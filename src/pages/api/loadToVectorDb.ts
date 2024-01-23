import { ServerRoutesArgs, ServerRoutesRes } from '@/types/api'
import { NextApiRequest, NextApiResponse } from 'next'
import { openai, supabase } from './lib/singletons'
import { Octokit } from '@octokit/core'
import { checkIfFileExists, getFileContent, insertFile } from './loadFileToVectorDb'
import { GithubFile } from '@/types/Github'

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse<ServerRoutesRes['loadToVectorDb']>
) {
    if (req.method !== 'POST') {
        return res.status(405).json({ result: 'failure', error: 'Method not allowed' })
    }

    const parsed = JSON.parse(req.body)
    const { provider_token, repoName, owner } = parsed as ServerRoutesArgs['loadToVectorDb']
    console.log(`Loading repository: ${repoName} for ${owner}`)
    const octokit = new Octokit({ auth: provider_token })

    try {
        // Retrieve all files from the repository
        const files = await getAllFilesInRepo(octokit, owner, repoName)

        for (const file of files) {
            const fileExists = await checkIfFileExists({
                owner,
                repoName,
                path: file.path,
                fileName: file.name,
            })
            if (!fileExists) {
                const fileContent = await getFileContent({
                    octokit,
                    repoName,
                    path: file.path,
                    owner,
                })

                await insertFile({
                    owner,
                    repoName,
                    path: file.path,
                    fileName: file.name,
                    fileContent,
                })
            }
        }

        return res.status(200).json({ result: 'success', data: 'Files loaded' })
    } catch (error) {
        console.error('Error processing repository:', error)
        return res.status(500).json({ result: 'failure', error: 'Error processing repository' })
    }
}

const getAllFilesInRepo = async (octokit: Octokit, owner: string, repo: string) => {
    console.log('Getting all files in repo')
    const dirs: GithubFile[] = []
    const files: GithubFile[] = []
    const response = await octokit.request('GET /repos/{owner}/{repo}/contents/', {
        owner,
        repo,
        mediaType: {
            format: 'raw',
        }
    })

    if (Array.isArray(response.data)) {
        for (const item of response.data) {
            // console.log({item})
            if (item.type === 'dir') {
                dirs.push(item)
            } else if (item.type === 'file' && !isExcludedFileType(item.name)) {
                console.log(`Found file: ${item.path}`)
                files.push(item)
            }
        }
    }

    while (dirs.length > 0) {
        const dir = dirs.pop() as GithubFile
        console.log(`Getting files in dir: ${dir.path}`)
        const response = await octokit.request('GET /repos/{owner}/{repo}/contents/{path}', {
            owner,
            repo,
            path: dir.path,
        })
        if (Array.isArray(response.data)) {
            for (const item of response.data) {
                if (item.type === 'dir') {
                    dirs.push(item)
                } else if (item.type === 'file' && !isExcludedFileType(item.name)) {
                    // console.log(`Found file: ${item.path}`)
                    files.push(item)
                }
            }
        } else {
            files.push(response.data as GithubFile)
        }
    }

    return files
}

const isExcludedFileType = (fileName: string) => {
    const excludedExtensions = ['.png', '.svg', '.jpg', '.gif', '.ico', '.lock'];
    return excludedExtensions.some(ext => fileName.endsWith(ext));
};
