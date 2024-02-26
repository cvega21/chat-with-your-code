import { ServerRoutesArgs, ServerRoutesRes } from '@/types/ServerActions'
import { NextApiRequest, NextApiResponse } from 'next'
import { supabase } from './lib/singletons'

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse<ServerRoutesRes['getRecentChats']>
) {
    if (req.method !== 'POST') {
        return res.status(405).json({ result: 'failure', error: 'Method not allowed' })
    }

    const parsed = JSON.parse(req.body)
    const { owner } = parsed as ServerRoutesArgs['getReposInDb']
    console.log(`Getting repositories in Vector DB for: ${owner}`)

    const { data } = await supabase
        .from('user_chat')
        .select('id, repo_name')
        .filter('owner', 'eq', owner)
        .order('id', { ascending: false })
        .limit(5)

    if (data) {
        const parsedData = data.map(chat => ({
            chatId: chat.id,
            repoName: chat.repo_name,
        }))
        return res.status(200).json({ result: 'success', data: parsedData })
    }

    return res.status(200).json({ result: 'success', data: [] })
}
