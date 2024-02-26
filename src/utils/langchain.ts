import { openai, supabase } from '../pages/api/lib/singletons'
import { Document } from 'langchain/document'
import { RecursiveCharacterTextSplitter } from 'langchain/text_splitter'
import { SupabaseClient } from '@supabase/supabase-js'
import { OpenAIEmbeddings } from '@langchain/openai'
import { SupabaseVectorStore } from 'langchain/vectorstores/supabase'
import { ChatOpenAI } from '@langchain/openai'
import { StringOutputParser } from '@langchain/core/output_parsers'
import { BufferMemory } from 'langchain/memory'
import {
    ChatPromptTemplate,
    MessagesPlaceholder,
    AIMessagePromptTemplate,
    HumanMessagePromptTemplate,
} from 'langchain/prompts'
import { OpenAIEmbeddingModel, PreLangchainDoc } from '@/types/Langchain'
import { EmbeddingsInterface } from '@langchain/core/embeddings'
import { SupabaseLibArgs } from 'langchain/vectorstores/supabase'

/** Loads langchain doc for repo */
export const getDocsForRepo = async ({ owner, repoName }: { owner: string; repoName: string }) => {
    console.log(`Getting langchain docs for ${owner}/${repoName}`)
    const files = await supabase
        .from('code_embeddings')
        .select('content, file_name, path')
        .eq('repo_name', repoName)
        .eq('owner', owner)

    if (!files.data) {
        throw new Error(`No files found for ${owner}/${repoName}`)
    }

    const docs: Document[] = []
    for (const file of files.data) {
        const { content, file_name, path } = file
        const doc = new Document({
            pageContent: content,
            metadata: {
                title: file_name,
                path,
                repoName,
                owner,
            },
        })
        docs.push(doc)
    }

    return docs
}

export const splitCodeIntoChunks = async ({
    docs,
    chunkSize,
    chunkOverlap,
}: {
    docs: Document[]
    chunkSize: number
    chunkOverlap: number
}) => {
    const javascriptSplitter = RecursiveCharacterTextSplitter.fromLanguage('js', {
        chunkSize,
        chunkOverlap,
    })
    return await javascriptSplitter.splitDocuments(docs)
}

/** Need to chunk up contents first */
export const getVectorStoreRetriever = async ({
    client,
    tableName,
    chunks,
}: {
    client: SupabaseClient
    tableName: string
    chunks: Document[]
}) => {
    const vectorStore = await SupabaseVectorStore.fromDocuments(chunks, new OpenAIEmbeddings(), {
        client,
        tableName,
    })

    const retriever = vectorStore.asRetriever({
        searchType: 'mmr', // Use max marginal relevance search
        searchKwargs: { fetchK: 5 },
    })

    return retriever
}

export const getVectorStoreFromExistingIndex = async ({
    embeddings,
    dbConfig,
}: {
    embeddings: EmbeddingsInterface
    dbConfig: SupabaseLibArgs
}) => {
    const vectorStore = await SupabaseVectorStore.fromExistingIndex(embeddings, dbConfig)
    return vectorStore
}

export const getModelWithParser = (modelName: 'gpt-4' | 'gpt-3.5-turbo-0125') => {
    const model = new ChatOpenAI({ modelName }).pipe(new StringOutputParser())
    return model
}

/** Memory key must match prompt template input variable */
export const getModelMemory = (memoryKey: string) => {
    const memory = new BufferMemory({
        returnMessages: true, // Return stored messages as instances of `BaseMessage`
        memoryKey, // This must match up with our prompt template input variable.
    })

    return memory
}

export const getCodeFollowupPrompt = () => {
    const questionGeneratorTemplate = ChatPromptTemplate.fromMessages([
        AIMessagePromptTemplate.fromTemplate(
            'Given the following conversation about a codebase and a follow up question, rephrase the follow up question to be a standalone question.'
        ),
        new MessagesPlaceholder('chat_history'),
        AIMessagePromptTemplate.fromTemplate(`Follow Up Input: {question}
      Standalone question:`),
    ])

    return questionGeneratorTemplate
}

export const getCodeChatPromptTemplate = () => {
    const combineDocumentsPrompt = ChatPromptTemplate.fromMessages([
        AIMessagePromptTemplate.fromTemplate(
            "Use the following pieces of context to answer the question at the end. If you don't know the answer, just say that you don't know, don't try to make up an answer.\n\n{context}\n\n"
        ),
        new MessagesPlaceholder('chat_history'),
        HumanMessagePromptTemplate.fromTemplate('Question: {question}'),
    ])

    return combineDocumentsPrompt
}

export const embedText = (text: string, model?: OpenAIEmbeddingModel) => {
    const embeddings = new OpenAIEmbeddings({
        openAIApiKey: process.env.OPENAI_API_KEY,
        modelName: model || 'text-embedding-ada-002',
    })
    return embeddings.embedQuery(text)
}

export const createLangchainDocs = (data: Array<PreLangchainDoc>) => {
    const docs: Document[] = []

    for (const d of data) {
        const { content, metadata } = d
        const doc = new Document({ pageContent: content, metadata })
        docs.push(doc)
    }

    return docs
}

export const getEmbeddingsModel = (modelName: OpenAIEmbeddingModel): OpenAIEmbeddings => {
    const embeddings = new OpenAIEmbeddings({
        openAIApiKey: process.env.OPENAI_API_KEY,
        modelName,
    })
    return embeddings
}
