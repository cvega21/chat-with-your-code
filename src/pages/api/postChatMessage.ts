import { ServerRoutesArgs, ServerRoutesRes } from '@/types/ServerActions'
import { getChatDetails } from '@/utils/chatUtils'
import { NextApiRequest, NextApiResponse } from 'next'
import { openai, supabase } from './lib/singletons'
import { RunnableSequence, RunnablePassthrough } from '@langchain/core/runnables'
import {
    getCodeChatPromptTemplate,
    getCodeFollowupPrompt,
    getDocsForRepo,
    getModelMemory,
    getModelWithParser,
    getVectorStoreRetriever,
    splitIntoChunks,
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
        // const supabase = supabase
        const { repoName, owner, messages } = await getChatDetails(chatId)
        console.log('getting docs')
        const docs = await getDocsForRepo({ owner, repoName })
        // console.log({docs})
        console.log('docs retrieved')
        console.log('splitting into chunks')
        const chunks = await splitIntoChunks({ docs, chunkSize: 2000, chunkOverlap: 200 })
        // console.log({chunks})
        console.log('chunks retrieved')
        console.log('getting retriever')
        const retriever = await getVectorStoreRetriever({
            client: supabase,
            tableName: 'code_embeddings_new',
            chunks,
        })
        console.log({retriever})
        console.log('getting model and memory')
        const model = getModelWithParser('gpt-3.5-turbo-0125')
        const memory = getModelMemory('chat_history')
        console.log({model, memory})
        const combineDocumentsPrompt = getCodeChatPromptTemplate()
        const questionGeneratorTemplate = getCodeFollowupPrompt()

        const combineDocumentsChain = RunnableSequence.from([
            {
                question: (output: string) => output,
                chat_history: async () => {
                    const { chat_history } = await memory.loadMemoryVariables({})
                    return chat_history
                },
                context: async (output: string) => {
                    const relevantDocs = await retriever.getRelevantDocuments(output)
                    return formatDocumentsAsString(relevantDocs)
                },
            },
            combineDocumentsPrompt,
            model,
            new StringOutputParser(),
        ])

        const conversationalQaChain = RunnableSequence.from([
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
        const systemResponse = await conversationalQaChain.invoke({
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

        return res
            .status(200)
            .json({ result: 'success', data: { response: systemResponse, history: messages } })
    } catch (error) {
        console.error('Error procesxsing chat:', error)
        return res.status(500).json({ result: 'failure', error: 'Error processing chat' })
    }
}

const insertNewMessageInDb = async (chatId: number, message: string, sender: 'user' | 'system') => {
    const messageId = await supabase
        .from('user_chat_messages')
        .insert([{ user_chat_id: chatId, message, sender }])
        .select('id')
        .single()

    return messageId.data?.id as number
}
