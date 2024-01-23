import React from 'react'
import { UsernameReposResponse, GithubFile, RepoContentsResponse } from '@/types/Github'
import { Tag } from './Tag'
import { getLanguageColor } from '@/utils/styles'
import { BasicButton } from './BasicButton'
import { useOctokitContext } from '@/hooks/useOctokitContext'
import { GithubFilesPanel } from './GithubFilesPanel'
import { callApi } from '@/utils/callApi'
import { useSession } from '@supabase/auth-helpers-react'

export const RepoMeta = ({ repo }: { repo: UsernameReposResponse }) => {
    const { name, fork, description, html_url, visibility, owner, language } = repo
    const { login: ownerName, avatar_url } = owner
    const { bgColor, textColor } = getLanguageColor(language ?? '')
    const { getOctokit } = useOctokitContext()
    const [files, setFiles] = React.useState<RepoContentsResponse>([])
    const session = useSession()

    const getRepoContent = async () => {
        console.debug('getRepoContent', repo)
        const octokit = await getOctokit()
        if (!octokit) return console.error('no octokit')
        if (!ownerName) return console.error('no owner name')
        const repoContent = await octokit.request('GET /repos/{owner}/{repo}/contents/{path}', {
            owner: ownerName,
            repo: name,
            path: '',
            mediaType: {
                format: 'raw',
            },
        })

        console.log(repoContent.data)
        if (Array.isArray(repoContent.data)) {
            const githubFiles = repoContent.data.map(file => {
                const { name, size, type, path } = file
                return {
                    name,
                    size,
                    type,
                    path,
                }
            })
            setFiles(repoContent.data)
        } else {
            const singleFile = repoContent.data
            setFiles([singleFile])
        }
    }

    const loadToVectorDB = async () => {
        // send API request to load entire repo to vector DB
        console.log({repo})
        if (!session?.provider_token) return console.error('no provider token')
        await callApi('loadToVectorDb', {
            provider_token: session.provider_token,
            repoName: repo.name,
            owner: ownerName,
        })
    }

    return (
        <div className='border-b border-black py-2'>
            <div className='flex gap-4 items-center'>
                {/* <img src={avatar_url} className='rounded-full w-8 h-8'></img> */}
                <a
                    className='font-bold text-indigo-500'
                    href={html_url}
                    target={'_blank'}
                    rel={'noreferrer'}
                >
                    {name}
                </a>
                {fork && <Tag text='Forked' />}
                <BasicButton text={'Get Files'} onClick={getRepoContent} />
                <BasicButton text={'Load to Vector DB'} onClick={loadToVectorDB} />
            </div>
            <p className='italic font-light text-stone-500'>{visibility}</p>
            <p className='font-light'>{description}</p>
            {language && <Tag text={language} bgColor={bgColor} textColor={textColor} />}
            {Array.isArray(files) && files.length > 0 && (
                <GithubFilesPanel files={files} ownerName={ownerName} repoName={repo.name} />
            )}
        </div>
    )
}
