export type OpenAIChatModel = 'gpt-3.5-turbo-0125' | 'gpt-4'

export type OpenAIEmbeddingModel =
    | 'text-embedding-ada-002'
    | 'text-embedding-3-small'
    | 'text-embedding-3-large'

export interface PreLangchainDoc {
    content: string
    metadata: Record<string, any>
}
