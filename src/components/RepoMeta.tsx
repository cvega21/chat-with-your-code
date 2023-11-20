import React from 'react'
import { RepoData, RepoLanguage } from '@/types/Github'
import { Tag } from './Tag'
import { getLanguageColor, languageColors } from '@/utils/styles'

export const RepoMeta = ({ repo }: { repo: RepoData }) => {
    const { name, fork, description, html_url, visibility, owner, language } = repo
    const { name: ownerName, avatar_url } = owner
    const { bgColor, textColor} = getLanguageColor(language ?? '')

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
            </div>
            <p className='italic font-light text-stone-500'>{visibility}</p>
            <p className='font-light'>{description}</p>
            {language && <Tag text={language} bgColor={bgColor} textColor={textColor} />}
        </div>
    )
}
