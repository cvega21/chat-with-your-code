import { ServerRoutesArgs, ServerRoutesRes } from '@/types/ServerActions'
import { NextApiRequest, NextApiResponse } from 'next'
import { supabase } from './lib/singletons'

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
        const repos = await supabase
            .from('supabase_vector_store')
            .select('metadata->repo_name')
            .contains('metadata', { owner})

        if (repos.data === null) {
            return res
                .status(500)
                .json({ result: 'failure', error: 'Error retrieving repositories' })
        }
        const repoNames = repos.data.map(repo => repo.repo_name as string)

        return res.status(200).json({ result: 'success', data: repoNames })
    } catch (error) {
        console.error('Error processing repository:', error)
        return res.status(500).json({ result: 'failure', error: 'Error processing repository' })
    }
}
