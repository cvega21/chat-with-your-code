import { NextRequest } from 'next/server'
import { Message as VercelChatMessage, StreamingTextResponse } from 'ai'

import { BytesOutputParser } from 'langchain/schema/output_parser'
import { ServerRoutesArgs } from '@/types/ServerActions'
import { getChatDetails, insertNewMessageInDb } from '@/utils/chatUtils'
import { supabase } from '@/pages/api/lib/singletons'
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

export const runtime = 'edge'

export async function POST(req: NextRequest) {
    console.log('Posting chat message...')
    const { chatId, messages: reqMessages } =
        (await req.json()) as ServerRoutesArgs['postChatMessageStream']

    const messages = reqMessages ?? []
    const message = messages[messages.length - 1]?.content as string
    await insertNewMessageInDb(chatId, message, 'user')

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
                },
            },
        })

        const retriever = vectorStore.asRetriever()

        let llmFormattedQuestion = ''

        console.log('getting model and memory')
        const model = getModelWithParser('gpt-3.5-turbo-0125', true)
        const memory = getModelMemory('chat_history')
        const combineDocumentsPrompt = getCodeChatPromptTemplate()
        const questionGeneratorTemplate = getCodeFollowupPrompt()

        const combineDocumentsChain = RunnableSequence.from([
            {
                question: (output: string) => {
                    console.log('1 - Question')
                    console.log({ output })
                    llmFormattedQuestion = output
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
            new BytesOutputParser(),
        ])

        const chain = RunnableSequence.from(
            [
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
            ],
            'chat_chain'
        )

        const question = message
        console.log('invoking chain')

        const stream = await chain.stream(
            {
                question,
            },
            {
                callbacks: [
                    {
                        handleChainEnd: async (outputs, runId, parentRunId, tags) => {
                            if (
                                tags?.includes('seq:step:3') &&
                                outputs.output &&
                                llmFormattedQuestion !== '' &&
                                llmFormattedQuestion !== outputs.output
                            ) {
                                console.log('Chain End')
                                await insertNewMessageInDb(
                                    chatId,
                                    outputs?.output,
                                    'system'
                                )
                            }
                        },
                    },
                ],
            }
        )

        await memory.saveContext(
            {
                input: question,
            },
            {
                output: stream,
            }
        )

        return new StreamingTextResponse(stream)
    } catch (error) {
        console.error('Error processsing chat:', error)
        return
    }
}
