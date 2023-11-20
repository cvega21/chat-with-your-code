'use client'
import { LoginButton } from '@/components/LoginButton'
import { Meta } from '@/layouts/Meta'
import { useSession, useUser } from '@supabase/auth-helpers-react'
import { Octokit } from 'octokit'
import { useEffect, useState } from 'react'
import { Endpoints } from '@octokit/types'
import { RepoData } from '@/types/Github'
import { RepoMeta } from '@/components/RepoMeta'

const Index = () => {
    const user = useUser()
    const session = useSession()
    const [repoData, setRepoData] = useState<RepoData[]>([])

    const getRepoInfo = async () => {
        if (!session) return
        console.log({ session })
        const octokit = new Octokit({ auth: session.provider_token })
        const githubUsername = session.user.user_metadata.user_name
        const repos = await octokit.request('GET /users/{username}/repos', {
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
        <div className='flex min-h-screen min-w-full flex-col items-center'>
            <Meta title='Dev Estimator' description='' />
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
        </div>
    )
}

export default Index
