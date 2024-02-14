import { ServerRoutesArgs, ServerRoutesRes } from '@/types/ServerActions'
import { getChatDetails } from '@/utils/chatUtils'
import { NextApiRequest, NextApiResponse } from 'next'
import { openai, supabase } from './lib/singletons'

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
        const userMessageId = await insertNewMessageInDb(chatId, message, 'user')
        const systemResponse = 'hello my friend'
        const systemMessageId = await insertNewMessageInDb(chatId, systemResponse, 'system')
        console.log({ systemResponse })

        return res.status(200).json({ result: 'success', data: systemResponse })
    } catch (error) {
        console.error('Error processing chat:', error)
        return res.status(500).json({ result: 'failure', error: 'Error processing chat' })
    }
}

const insertNewMessageInDb = async (chatId: number, message: string, sender: 'user' | 'system') => {
    const messageId = await supabase
        .from('user_chat_messages')
        .insert([{ user_chat_id: chatId, message, sender: 'user' }])
        .select('id')
        .single()

    return messageId.data?.id as number
}
