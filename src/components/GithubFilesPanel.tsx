import { GithubFile } from '@/types/Github'
import React from 'react'
import { GithubFileElement } from './GithubFileElement'

export const GithubFilesPanel = ({ files }: { files: GithubFile[] }) => {
    const sortedFiles = [...files].sort((a, b) => {
        if (a.type === 'dir' && b.type === 'file') return -1
        if (a.type === 'file' && b.type === 'dir') return 1
        return 0
    })

    return (
        <div className='flex flex-col border-t border-stone-600 my-4'>
            {sortedFiles.map(file => (
                <GithubFileElement file={file} />
            ))}
        </div>
    )
}
