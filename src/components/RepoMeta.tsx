import React from 'react'
import { RepoData, RepoLanguage } from '@/types/Github'
import { Tag } from './Tag'
import { getLanguageColor, languageColors } from '@/utils/styles'
import { BasicButton } from './BasicButton'
import { useOctokitContext } from '@/hooks/useOctokitContext'

export const RepoMeta = ({ repo }: { repo: RepoData }) => {
    const { name, fork, description, html_url, visibility, owner, language } = repo
    const { login: ownerName, avatar_url } = owner
    const { bgColor, textColor } = getLanguageColor(language ?? '')
    const { getOctokit } = useOctokitContext()
    const files = []

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
            }
        })
        console.log(repoContent)
        //@ts-expect-error
        const file1 = repoContent.data[3]
        console.log({file1})
        const fileContent = await octokit.request('GET /repos/{owner}/{repo}/contents/{path}', {
            owner: ownerName,
            repo: name,
            path: file1.path,
            mediaType: {
                format: 'raw',
            }
        })
        console.log({fileContent})
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
                <BasicButton text={'Get Code'} onClick={getRepoContent} />
            </div>
            <p className='italic font-light text-stone-500'>{visibility}</p>
            <p className='font-light'>{description}</p>
            {language && <Tag text={language} bgColor={bgColor} textColor={textColor} />}
        </div>
    )
}
