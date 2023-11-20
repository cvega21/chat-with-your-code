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
    const { octokit, username, initOctokit } = useGithubContext()

    const getRepoInfo = async () => {
        if (!session) return
        if (!session.provider_token) return
        if (!octokit) await initOctokit(session.provider_token)
        console.log({ session })
        const githubUsername = session.user.user_metadata.user_name
        const repos = await octokit!.request('GET /users/{username}/repos', {
            username: githubUsername,
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
