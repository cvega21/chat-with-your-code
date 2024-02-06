import { ServerRoutesArgs, ServerRoutesRes } from '@/types/ServerActions'
import { NextApiRequest, NextApiResponse } from 'next'
import { openai, supabase } from './lib/singletons'
import { checkIfRepoIsLoaded } from './loadRepoToVectorDb'

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse<ServerRoutesRes['startNewChat']>
) {
    if (req.method !== 'POST') {
        return res.status(405).json({ result: 'failure', error: 'Method not allowed' })
    }

    const parsed = JSON.parse(req.body)
    const { repoName, owner } = parsed as ServerRoutesArgs['startNewChat']
    console.log(`Loading repository: ${repoName} for ${owner}`)

    const repoExists = await checkIfRepoIsLoaded(owner, repoName)
    if (!repoExists) {
        console.log('Repo already loaded')
        return res.status(400).json({ result: 'failure', error: 'Repo not loaded' })
    }

    try {
        // Retrieve all files from the repository
        const chatId = await insertNewChatInDb(owner, repoName)

        return res.status(200).json({ result: 'success', data: chatId })
    } catch (error) {
        console.error('Error processing repository:', error)
        return res.status(500).json({ result: 'failure', error: 'Error processing repository' })
    }
}

const insertNewChatInDb = async (owner: string, repoName: string) => {
    const chatId = await supabase
        .from('user_chat')
        .insert([{ owner, repo_name: repoName }])
        .select()
        .single()
    console.log({ chatId })
    return chatId.data?.id
}
