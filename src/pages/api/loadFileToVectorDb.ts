import { ServerRoutesArgs, ServerRoutesRes } from '@/types/api'
import { GithubFile } from '@/types/Github'
import { Octokit } from '@octokit/core'
import { NextApiRequest, NextApiResponse } from 'next'
import { openai, supabase } from './lib/singletons'

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse<ServerRoutesRes['loadFileToVectorDb']>
) {
    if (req.method !== 'POST') {
        return res.status(405).json({ result: 'failure', error: 'Method not allowed' })
    }
    const parsed = JSON.parse(req.body)
    const { provider_token, repoName, path, owner, fileName } =
        parsed as ServerRoutesArgs['loadFileToVectorDb']
    const octokit = new Octokit({ auth: provider_token })
    const file = await getFile(octokit, { repoName, path, owner, provider_token, fileName })
    if (Array.isArray(file)) {
        return res.status(500).json({ result: 'failure', error: 'File is directory' })
    }
    await insertFile({
        owner,
        repoName,
        path,
        fileName,
        fileContent: file.data as string,
    })
    return res.status(200).json({ result: 'success', data: file })
}

const getFile = async (octokit: Octokit, args: ServerRoutesArgs['loadFileToVectorDb']) => {
    console.log('Getting file')
    // console.log({ args })
    const { repoName, path, owner } = args
    const file = await octokit.request('GET /repos/{owner}/{repo}/contents/{path}', {
        owner,
        repo: repoName,
        path,
        mediaType: {
            format: 'raw',
        },
    })
    // console.log({file})
    return file as unknown as GithubFile
}

const insertFile = async ({
    owner,
    repoName,
    path,
    fileContent,
    fileName,
}: {
    owner: string
    repoName: string
    path: string
    fileName: string
    fileContent: string
}) => {
    const input = (fileContent as string).replace(/\s+/g, ' ')

    const embeddingResponse = await openai.embeddings.create({
        model: 'text-embedding-ada-002',
        input,
    })

    const embedding = embeddingResponse.data[0]?.embedding
    try {
        const supaRes = await supabase
            .from('code_embeddings')
            .insert({
                owner,
                repo_name: repoName,
                path,
                file_name: fileName,
                file_content: fileContent,
                embedding,
            })
            .select()
        console.log({ supaRes })
        console.log(`Inserted file ${fileName} into DB`)
        return supaRes
    } catch (error) {
        console.error('Error inserting file:', error)
    }

    return
}
