import { GithubFile } from '@/types/Github'
import React from 'react'

export const GithubFileElement = ({ file }: { file: GithubFile }) => {
    const { name, size, type, path } = file
    return (
        <div className='flex justify-between items-center border-x border-b border-stone-600 p-2 px-3 hover:bg-stone-700 transition-all duration-50'>
            <div className='flex gap-4 items-center'>
                <p>{type === 'file' ? '📄' : '📁'}</p>
                <p>{name}</p>
            </div>
            <p className='text-xs text-stone-400'>{size} B</p>
        </div>
    )
}
