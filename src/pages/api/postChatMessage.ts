import { ServerRoutesArgs, ServerRoutesRes } from '@/types/ServerActions'
import { getChatDetails, insertNewMessageInDb } from '@/utils/chatUtils'
import { NextApiRequest, NextApiResponse } from 'next'
import { supabase } from './lib/singletons'
import { RunnableSequence } from '@langchain/core/runnables'
import {
    getCodeChatPromptTemplate,
    getCodeFollowupPrompt,
    getEmbeddingsModel,
    getModelMemory,
    getModelWithParser,
    getVectorStoreFromExistingIndex,
} from '@/utils/langchain'
import { formatDocumentsAsString } from 'langchain/util/document'
import { StringOutputParser } from '@langchain/core/output_parsers'

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse<ServerRoutesRes['postChatMessage']>
) {
    if (req.method !== 'POST') {
        return res.status(405).json({ result: 'failure', error: 'Method not allowed' })
    }

    console.log('Posting chat message...')
    const parsed = JSON.parse(req.body)
    const { chatId, message } = parsed as ServerRoutesArgs['postChatMessage']
    console.log({ chatId, message })


    try {
        const { repoName, owner } = await getChatDetails(chatId)

        const vectorStore = await getVectorStoreFromExistingIndex({
            embeddings: getEmbeddingsModel('text-embedding-3-small'),
            dbConfig: {
                client: supabase,
                tableName: 'supabase_vector_store',
                queryName: 'match_documents',
                filter: {
                    owner,
                    repo_name: repoName,
                }
            },
        })

        const retriever = vectorStore.asRetriever()

        console.log('getting model and memory')
        const model = getModelWithParser('gpt-3.5-turbo-0125')
        const memory = getModelMemory('chat_history')
        const combineDocumentsPrompt = getCodeChatPromptTemplate()
        const questionGeneratorTemplate = getCodeFollowupPrompt()

        const combineDocumentsChain = RunnableSequence.from([
            {
                question: (output: string) => {
                    console.log('1 - Question')
                    console.log({ output })
                    return output
                },
                chat_history: async () => {
                    console.log('0 - Chat History')
                    const { chat_history } = await memory.loadMemoryVariables({})
                    console.log(`Chat history messages count: ${chat_history?.length}`)
                    return chat_history
                },
                context: async (output: string) => {
                    console.log('2 - Context')
                    const relevantDocs = await retriever.getRelevantDocuments(output)
                    console.log(relevantDocs.map(d => d.metadata.file_name))
                    return formatDocumentsAsString(relevantDocs)
                },
            },
            combineDocumentsPrompt,
            model,
            new StringOutputParser(),
        ])

        const chain = RunnableSequence.from([
            {
                question: (i: { question: string }) => i.question,
                chat_history: async () => {
                    const { chat_history } = await memory.loadMemoryVariables({})
                    return chat_history
                },
            },
            questionGeneratorTemplate,
            model,
            new StringOutputParser(),
            combineDocumentsChain,
        ])

        const question = message
        console.log('invoking chain')
        const systemResponse = await chain.invoke({
            question,
        })

        await memory.saveContext(
            {
                input: question,
            },
            {
                output: systemResponse,
            }
        )

        const userMessageId = await insertNewMessageInDb(chatId, message, 'user')
        const systemMessageId = await insertNewMessageInDb(chatId, systemResponse, 'system')
        console.log({ systemResponse })
        const { messages: chatHistoryInDb } = await getChatDetails(chatId)

        return res.status(200).json({
            result: 'success',
            data: { response: systemResponse, history: chatHistoryInDb },
        })
    } catch (error) {
        console.error('Error procesxsing chat:', error)
        return res.status(500).json({ result: 'failure', error: 'Error processing chat' })
    }
}
