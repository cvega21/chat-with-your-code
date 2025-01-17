import { ChatDetails, ChatMessage } from '@/types/Chat'
import { supabase } from './utils'

export const getChatDetails = async (chatId: number): Promise<ChatDetails> => {
    const chatDetails = await supabase
        .from('user_chat')
        .select('owner, repo_name')
        .filter('id', 'eq', chatId)
        .limit(1)
        .single()

    const owner = chatDetails.data?.owner
    const repoName = chatDetails.data?.repo_name
    const messages = await getChatMessages(chatId)

    return {
        owner: owner as string,
        repoName: repoName as string,
        chatId,
        messages,
    }
}

export const getChatMessages = async (chatId: number): Promise<ChatMessage[]> => {
    const messages = await supabase
        .from('user_chat_messages')
        .select('id, message, sender')
        .filter('user_chat_id', 'eq', chatId)
        .order('created_at', { ascending: true })

    const messagesData = messages.data as ChatMessage[]


    return messagesData
}

export const insertNewMessageInDb = async (chatId: number, message: string, sender: 'user' | 'system') => {
    const messageId = await supabase
        .from('user_chat_messages')
        .insert([{ user_chat_id: chatId, message, sender }])
        .select('id')
        .single()

    return messageId.data?.id as number
}
