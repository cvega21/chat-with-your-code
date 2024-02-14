export type ChatDetails = {
    owner: string
    repoName: string
    chatId: number
    messages: ChatMessage[]
}

export type ChatMessage = {
    id: number
    message: string
    sender: 'user' | 'system'
}
