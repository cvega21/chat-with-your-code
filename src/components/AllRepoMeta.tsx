import React from 'react'
import { LoginButton } from '@/components/LoginButton'
import { useSession, useUser } from '@supabase/auth-helpers-react'
import { useEffect, useState } from 'react'
import { RepoData } from '@/types/Github'
import { RepoMeta } from '@/components/RepoMeta'
import { useGithubContext } from '@/hooks/useGithubContext'

export const AllRepoMeta = () => {
    const user = useUser()
    const session = useSession()
    const [repoData, setRepoData] = useState<RepoData[]>([])
    const { octokit, username, getOctokit } = useGithubContext()

    const getRepoInfo = async () => {
        const octokit = await getOctokit()
        if (!octokit) return console.error('no octokit')
        if (!username) return console.error('no username')
        console.log({ session })
        const repos = await octokit.request('GET /users/{username}/repos', {
            username,
            headers: {
                'X-GitHub-Api-Version': '2022-11-28',
            },
        })
        setRepoData(repos.data)
        console.log({ repos })
    }

    useEffect(() => {
        getRepoInfo()
    }, [])

    return (
        <div className='mt-16'>
            <p>{user ? <>Logged in as {user.id}</> : <>Not logged in</>}</p>
            <LoginButton />
            <button onClick={getRepoInfo} className='p-2 border text-white bg-black'>
                Get all repo info
            </button>
            {repoData &&
                repoData.map(repo => {
                    return <RepoMeta repo={repo} key={repo.url} />
                })}
        </div>
    )
}
