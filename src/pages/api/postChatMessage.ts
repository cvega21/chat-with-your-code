import { ServerRoutesArgs, ServerRoutesRes } from '@/types/ServerActions'
import { getChatDetails } from '@/utils/chatUtils'
import { NextApiRequest, NextApiResponse } from 'next'
import { openai, supabase } from './lib/singletons'
import { RunnableSequence, RunnablePassthrough } from '@langchain/core/runnables'
import {
    createLangchainDocs,
    embedText,
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
import { PreLangchainDoc } from '@/types/Langchain'

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
                    console.log('2 - Chat History')
                    const { chat_history } = await memory.loadMemoryVariables({})
                    console.log(`Chat history messages count: ${chat_history?.length}`)
                    return chat_history
                },
                context: async (output: string) => {
                    console.log('3 - Context')
                    console.log({ output })
                    const embeddedQuery = await embedText(output)
                    const queryResult = await supabase.rpc('match_code', {
                        query_embedding: JSON.stringify(embeddedQuery),
                        match_threshold: 0.1,
                        match_count: 5,
                        repo_name: repoName,
                        owner,
                    })

                    const { data } = queryResult
                    if (!data) {
                        const result = 'No relevant documents found.'
                        console.log(result)
                        return result
                    }

                    console.log(`Retrieved ${queryResult.data.length} relevant documents`)
                    console.log(queryResult.data.map(file => file.file_name).join(', '))

                    const fileContents: PreLangchainDoc[] = data.map(d => ({
                        content: d.content,
                        metadata: {
                            file_name: d.file_name,
                            repoName,
                            owner,
                            similarity: d.similarity,
                        },
                    }))

                    const relevantDocs = createLangchainDocs(fileContents)
                    // console.log({relevantDocs})

                    const documentStrings = formatDocumentsAsString(relevantDocs)
                    console.log(`Context length: ${documentStrings.length}`)
                    // console.log(documentStrings)
                    return documentStrings
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
        const { messages: chatHistoryInDb } = await getChatDetails(chatId)

        return res
            .status(200)
            .json({ result: 'success', data: { response: systemResponse, history: chatHistoryInDb } })
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
