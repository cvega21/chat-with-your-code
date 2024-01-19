import { ServerRoutesArgs, ServerRoutesRes } from '@/types/api'
import { GithubFile } from '@/types/Github'
import { Octokit } from '@octokit/core'
import { NextApiRequest, NextApiResponse } from 'next'

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse<ServerRoutesRes['loadFileToVectorDb']>
) {
    if (req.method !== 'POST') {
        return res.status(405).json({ result: 'failure', error: 'Method not allowed' })
    }
    const parsed = JSON.parse(req.body)
    const { provider_token, repoName, path, owner } =
        parsed as ServerRoutesArgs['loadFileToVectorDb']
    const octokit = new Octokit({ auth: provider_token })
    const file = await getFile(octokit, { repoName, path, owner, provider_token }) as GithubFile

    return res.status(200).json({ result: 'success', data: file })
}

const getFile = async (octokit: Octokit, args: ServerRoutesArgs['loadFileToVectorDb']) => {
    console.log('Getting file')
    console.log({ args })
    const { repoName, path, owner } = args
    const fileContent = await octokit.request('GET /repos/{owner}/{repo}/contents/{path}', {
        owner,
        repo: repoName,
        path,
        mediaType: {
            format: 'raw',
        },
    })
    return fileContent.data
}
