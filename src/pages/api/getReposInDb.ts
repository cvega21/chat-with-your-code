import { ServerRoutesArgs, ServerRoutesRes } from '@/types/ServerActions'
import { NextApiRequest, NextApiResponse } from 'next'
import { openai, supabase } from './lib/singletons'
import { Octokit } from '@octokit/core'
import { checkIfFileExists, getFileContent, insertFile } from './loadFileToVectorDb'
import { GithubFile } from '@/types/Github'

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse<ServerRoutesRes['getReposInDb']>
) {
    if (req.method !== 'POST') {
        return res.status(405).json({ result: 'failure', error: 'Method not allowed' })
    }

    const parsed = JSON.parse(req.body)
    const { owner } = parsed as ServerRoutesArgs['getReposInDb']
    console.log(`Getting repositories in Vector DB for: ${owner}`)

    try {
        // Retrieve distinct repo_names where owner = owner from supabase code_embeddings table
        const repos = await supabase
            .from('distinct_repo')
            .select('repo_name')
            .eq('owner', owner)

        if (repos.data === null) { return res.status(500).json({ result: 'failure', error: 'Error retrieving repositories' }) }
        const repoNames = repos.data.map((repo) => repo.repo_name as string)


        return res.status(200).json({ result: 'success', data: repoNames })
    } catch (error) {
        console.error('Error processing repository:', error)
        return res.status(500).json({ result: 'failure', error: 'Error processing repository' })
    }
}
