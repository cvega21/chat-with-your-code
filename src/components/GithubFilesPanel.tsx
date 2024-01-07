import { GithubFile, RepoContentsResponse } from '@/types/Github'
import React from 'react'
import { GithubFileElement } from './GithubFileElement'

export const GithubFilesPanel = ({
    files,
    ownerName,
    repoName
}: {
    files: RepoContentsResponse
    ownerName: string
    repoName: string
}) => {
    const sortedFiles = Array.isArray(files)
        ? [...files].sort((a, b) => {
              if (a.type === 'dir' && b.type === 'file') return -1
              if (a.type === 'file' && b.type === 'dir') return 1
              return 0
          })
        : [files]

    return (
        <div className='flex flex-col border-t border-stone-600 my-4'>
            {sortedFiles.map(file => (
                <GithubFileElement file={file} ownerName={ownerName} repoName={repoName}/>
            ))}
        </div>
    )
}
