import React from 'react'
import { LoginButton } from '@/components/LoginButton'
import { useSession, useUser } from '@supabase/auth-helpers-react'
import { useEffect, useState } from 'react'
import { UsernameReposResponse } from '@/types/Github'
import { RepoMeta } from '@/components/RepoMeta'
import { useOctokitContext } from '@/hooks/useOctokitContext'
import { InstallAppButton } from './InstallAppButton'
import { BasicButton } from './BasicButton'
import { callApi } from '@/utils/callApi'

export const AllRepoMeta = () => {
    const user = useUser()
    const session = useSession()
    const [userReposMeta, setUserReposMeta] = useState<UsernameReposResponse[]>([])
    const { octokit, username, getOctokit } = useOctokitContext()
    const [reposInDb, setReposInDb] = useState<string[]>([])

    const getRepoInfo = async () => {
        const octokit = await getOctokit()
        if (!octokit) return console.error('no octokit')
        if (!username) return console.error('no username')
        // console.log({ session })
        const repos = await octokit.request('GET /users/{username}/repos', {
            username,
            headers: {
                'X-GitHub-Api-Version': '2022-11-28',
            },
        })
        setUserReposMeta(repos.data)
        console.log({ repos })
    }

    const getReposInDb = async () => {
        const loadedRepos = await callApi('getReposInDb', { owner: username ?? '' })
        console.log({ loadedRepos })
        setReposInDb(loadedRepos.data!)
    }

    useEffect(() => {
        if (session && username && userReposMeta.length === 0) {
            console.log('Getting repo info')
            getRepoInfo()
            getReposInDb()
        }
    }, [session, username])

    return (
        <div className='mt-16'>
            <p>{user ? <>Logged in as {user.id}</> : <>Not logged in</>}</p>
            <LoginButton />
            <InstallAppButton />
            <button onClick={getRepoInfo} className='p-2 border text-white bg-black'>
                Get all repo info
            </button>
            <section className='my-4 bg-stone-900 p-6 rounded-xl border border-stone-600'>
                <h2 className='text-2xl font-bold'>Repos in Vector DB</h2>
                <p className='font-light'>Click on a repository to begin a chat session.</p>
                {userReposMeta &&
                    userReposMeta
                        .filter(repo => reposInDb.includes(repo.name))
                        .map(repo => {
                            return <RepoMeta repo={repo} key={repo.url} loaded={true} />
                        })}
            </section>
            <section className='my-4 bg-stone-900 p-6 rounded-xl border border-stone-600'>
                <h2 className='text-2xl font-bold'>Repos Not Loaded</h2>
                <p className='font-light'>Click on a repository to begin a chat session.</p>
                {userReposMeta &&
                    userReposMeta
                    .filter(repo => !reposInDb.includes(repo.name))
                    .map(repo => {
                        return <RepoMeta repo={repo} key={repo.url} loaded={false} />
                    })}
            </section>
        </div>
    )
}
