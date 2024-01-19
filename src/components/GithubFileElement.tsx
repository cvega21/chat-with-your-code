import { useOctokitContext } from '@/hooks/useOctokitContext'
import { GithubFile } from '@/types/Github'
import { callApi } from '@/utils/callApi'
import { useSession } from '@supabase/auth-helpers-react'
import React, { useEffect } from 'react'
import { BasicButton } from './BasicButton'

export const GithubFileElement = ({
    file,
    ownerName,
    repoName,
}: {
    file: GithubFile
    ownerName: string
    repoName: string
}) => {
    const { name, size, type, path } = file
    const [fileContent, setFileContent] = React.useState<string | null>(null)
    const { getOctokit } = useOctokitContext()
    const session = useSession()

    const loadToVectorDB = async () => {
        if (!session?.provider_token) {
            console.log({session})
            return console.error('no provider token')
        }
        const res = await callApi('loadFileToVectorDb', {
            provider_token: session.provider_token,
            repoName,
            owner: ownerName,
            path,
        })
    }

    const getFile = async () => {
        const octokit = await getOctokit()
        if (!octokit) return console.error('no octokit')
        if (!ownerName) return console.error('no owner name')
        const fileContent = await octokit.request('GET /repos/{owner}/{repo}/contents/{path}', {
            owner: ownerName,
            repo: repoName,
            path: file.path,
            mediaType: {
                format: 'raw',
            },
        })
        console.log({ fileContent })
        if (Array.isArray(fileContent.data)) {
            console.error('file content is array')
            return
        }

        setFileContent(fileContent.data as unknown as string)
    }

    useEffect(() => {
        console.log({ file })
    }, [])

    return (
        <>
            <div className='flex justify-between items-center border-x border-b border-stone-600 p-2 px-3 hover:bg-stone-700 transition-all duration-50'>
                <div className='flex gap-4 items-center'>
                    <p>{type === 'file' ? '📄' : '📁'}</p>
                    <p>{name}</p>
                </div>
                <div className='flex items-center gap-4'>
                    <BasicButton onClick={getFile} text='See File' />
                    <BasicButton onClick={loadToVectorDB} text='Load to Vector DB' />
                    <p className='text-xs text-stone-400'>{size} B</p>
                </div>
            </div>
            {fileContent && (
                <div className='p-2 border-b border-stone-600 text-xs border max-w-screen-md'>
                    <pre className='text-stone-400'>{fileContent}</pre>
                </div>
            )}
        </>
    )
}
