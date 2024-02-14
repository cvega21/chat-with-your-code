import { ServerRoutesArgs, ServerRoutesRes } from '@/types/ServerActions'
import { NextApiRequest, NextApiResponse } from 'next'
import { openai, supabase } from './lib/singletons'
import { Octokit } from '@octokit/core'
import { checkIfFileExists, getFileContent, insertFile } from './loadFileToVectorDb'
import { GithubFile } from '@/types/Github'
import { checkIfRepoIsLoaded } from './loadRepoToVectorDb'
import { getChatDetails } from '@/utils/chatUtils'

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse<ServerRoutesRes['getChatDetails']>
) {
    if (req.method !== 'POST') {
        return res.status(405).json({ result: 'failure', error: 'Method not allowed' })
    }

    const parsed = JSON.parse(req.body)
    console.log({ parsed })
    const { chatId } = parsed as ServerRoutesArgs['getChatDetails']
    console.log(`Loading chat details for chatId: ${chatId}`)

    try {
        // Retrieve all files from the repository
        const chatDetails = await getChatDetails(chatId)
        if (!chatDetails) {
            console.log('Chat details not found')
            return res.status(400).json({ result: 'failure', error: 'Chat not found' })
        }
        const { owner, repoName, messages } = chatDetails
        return res
            .status(200)
            .json({
                result: 'success',
                data: { owner, repoName, chatId, messages },
            })
    } catch (error) {
        console.error('Error getting chat details:', error)
        return res.status(500).json({ result: 'failure', error: 'Error getting chat details' })
    }
}
