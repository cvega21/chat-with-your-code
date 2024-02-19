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

export const splitIntoChunks = async ({
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
        // queryName: 'match_code', // using match_documents by default
    })

    const retriever = vectorStore.asRetriever({
        searchType: 'mmr', // Use max marginal relevance search
        searchKwargs: { fetchK: 5 },
    })

    return retriever
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
