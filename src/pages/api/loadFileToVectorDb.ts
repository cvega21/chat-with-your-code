import { ServerRoutesArgs, ServerRoutesRes } from '@/types/ServerActions'
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
    const fileContent = await getFileContent({ octokit, repoName, path, owner })
    if (Array.isArray(fileContent)) {
        return res.status(500).json({ result: 'failure', error: 'File is directory' })
    }
    const fileExists = await checkIfFileExists({ owner, repoName, path, fileName })
    if (fileExists) {
        return res.status(500).json({ result: 'failure', error: 'File already loaded' })
    }

    await insertFile({
        owner,
        repoName,
        path,
        fileName,
        fileContent,
    })
    return res.status(200).json({ result: 'success', data: fileContent })
}

export const getFileContent = async ({
    octokit,
    repoName,
    path,
    owner,
}: {
    octokit: Octokit
    repoName: string
    path: string
    owner: string
}) => {
    console.log(`Getting file ${path} from ${repoName} for ${owner}`)
    // console.log({ args })
    const file = await octokit.request('GET /repos/{owner}/{repo}/contents/{path}', {
        owner,
        repo: repoName,
        path,
        mediaType: {
            format: 'raw',
        },
    })
    // console.log({ file })
    return file.data as unknown as string
}

export const insertFile = async ({
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
    console.log(`Inserting file ${fileName} into DB`)
    console.log({ owner, repoName, path, fileName, fileContent })
    if (!fileContent) {
        console.error(`File ${fileName} has no content`)
        return
    }
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
                content: fileContent,
                embedding: JSON.stringify(embedding),
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

export const checkIfFileExists = async ({
    owner,
    repoName,
    path,
    fileName,
}: {
    owner: string
    repoName: string
    path: string
    fileName: string
}) => {
    const { data: files } = await supabase
        .from('code_embeddings')
        .select('file_name')
        .eq('owner', owner)
        .eq('repo_name', repoName)
        .eq('path', path)
        .eq('file_name', fileName)
    const fileExists = files && files.length > 0
    console.log(`File ${fileName} exists: ${fileExists}`)
    return fileExists
}
