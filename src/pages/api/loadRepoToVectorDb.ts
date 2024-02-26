import { ServerRoutesArgs, ServerRoutesRes } from '@/types/ServerActions'
import { NextApiRequest, NextApiResponse } from 'next'
import { openai, supabase } from './lib/singletons'
import { Octokit } from '@octokit/core'
import { checkIfFileExists, getFileContent, insertFile } from './loadFileToVectorDb'
import { GithubFile } from '@/types/Github'
import { PreLangchainDoc } from '@/types/Langchain'
import { createLangchainDocs, getEmbeddingsModel, splitCodeIntoChunks } from '@/utils/langchain'
import { SupabaseVectorStore } from 'langchain/vectorstores/supabase'

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse<ServerRoutesRes['loadRepoToVectorDb']>
) {
    if (req.method !== 'POST') {
        return res.status(405).json({ result: 'failure', error: 'Method not allowed' })
    }

    const parsed = JSON.parse(req.body)
    const { provider_token, repoName, owner } = parsed as ServerRoutesArgs['loadRepoToVectorDb']
    console.log(`Loading repository: ${repoName} for ${owner}`)
    const octokit = new Octokit({ auth: provider_token })

    const repoExists = await checkIfVectorStoreIsLoaded(owner, repoName)
    if (repoExists) {
        console.log('Repo already loaded')
        return res.status(200).json({ result: 'success', data: 'Repo already loaded' })
    }

    // Retrieve all files from the repository, fill content prop
    const filePreDocs: Array<PreLangchainDoc> = []

    const files = await getAllFilesInRepo(octokit, owner, repoName)
    for (const file of files) {
        file.content = await getFileContent({
            octokit,
            repoName,
            path: file.path,
            owner,
        })
        const fileDoc: PreLangchainDoc = {
            content: file.content,
            metadata: {
                file_name: file.name,
                owner,
                path: file.path,
                repo_name: repoName,
                loaded_ts: new Date().toISOString(),
            },
        }
        filePreDocs.push(fileDoc)
    }

    const fileDocs = createLangchainDocs(filePreDocs)
    const fileDocChunks = await splitCodeIntoChunks({
        docs: fileDocs,
        chunkSize: 2000,
        chunkOverlap: 200,
    })

    console.log('chunked files into', fileDocChunks.length, 'chunks')

    // init vector store
    const vectorStore = await SupabaseVectorStore.fromDocuments(
        fileDocChunks,
        getEmbeddingsModel('text-embedding-3-small'),
        {
            client: supabase,
            tableName: 'supabase_vector_store',
            queryName: 'match_documents',
        }
    )

    console.log('vector store initialized')

    // console.log('doing test...')
    // const resultOne = await vectorStore.similaritySearch('Repository readme', 1)
    // console.log({ resultOne })

    return res.status(200).json({ result: 'success', data: 'Files loaded' })
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
        },
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
    const excludedExtensions = ['.png', '.svg', '.jpg', '.gif', '.ico', '.lock']
    return excludedExtensions.some(ext => fileName.endsWith(ext))
}

export const checkIfRepoIsLoaded = async (owner: string, repoName: string) => {
    const repo = await supabase
        .from('distinct_repo')
        .select('repo_name')
        .eq('owner', owner)
        .eq('repo_name', repoName)

    return repo.data !== null
}

export const checkIfVectorStoreIsLoaded = async (owner: string, repoName: string) => {
    console.log(`Checking if vector store is loaded for ${owner}/${repoName}`)
    const { count, error } = await supabase
        .from('supabase_vector_store')
        .select('*', { count: 'exact', head: true })
        .contains('metadata', { owner, repo_name: repoName })

    // console.log(`Vector store count: ${count}`)

    return count && count > 0
}
