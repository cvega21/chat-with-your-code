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
import { ChatDetails } from '@/types/Chat'

export const AllRepoMeta = () => {
    const user = useUser()
    const session = useSession()
    const [userReposMeta, setUserReposMeta] = useState<UsernameReposResponse[]>([])
    const { octokit, username, getOctokit } = useOctokitContext()
    const [reposInDb, setReposInDb] = useState<string[]>([])
    const [recentChats, setRecentChats] = useState<Pick<ChatDetails, 'chatId' | 'repoName'>[]>([])

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

    const getReposInDb = async (owner: string) => {
        const loadedRepos = await callApi('getReposInDb', { owner })
        console.log({ loadedRepos })
        setReposInDb(loadedRepos.data!)
    }

    const getRecentChats = async (username: string) => {
        const chats = await callApi('getRecentChats', { owner: username })
        console.log({ chats })
        if (chats.data) setRecentChats(chats.data)
    }

    useEffect(() => {
        if (session && username && userReposMeta.length === 0) {
            console.log('Getting repo info')
            getRepoInfo()
            getReposInDb(username)
            getRecentChats(username)
        }
    }, [session, username])

    return (
        <div className='mt-16'>
            <p>{user ? <>Logged in</> : <>Not logged in</>}</p>
            <LoginButton />
            <InstallAppButton />
            <button onClick={getRepoInfo} className='p-2 border text-white bg-black'>
                Get all repo info
            </button>
            <section className='my-4 bg-stone-900 p-6 rounded-xl border border-stone-600'>
                <h2 className='text-2xl font-bold'>Recent Chats</h2>
                <p className='font-light text-stone-400'>Click on a session to resume chat.</p>
                {recentChats.length > 0 &&
                    recentChats.map(chat => {
                        const repo = userReposMeta.find(repo => repo.name === chat.repoName)
                        if (!repo) return <></>
                        return (
                            <RepoMeta
                                repo={repo}
                                key={chat.chatId}
                                loaded={true}
                                chatId={chat.chatId}
                            />
                        )
                    })}
            </section>
            <section className='my-4 bg-stone-900 p-6 rounded-xl border border-stone-600'>
                <h2 className='text-2xl font-bold'>Repos in Vector DB</h2>
                <p className='font-light text-stone-400'>
                    Click on a repository to begin a chat session.
                </p>
                {userReposMeta &&
                    userReposMeta
                        .filter(repo => reposInDb.includes(repo.name))
                        .map(repo => {
                            return <RepoMeta repo={repo} key={repo.url} loaded={true} />
                        })}
            </section>
            <section className='my-4 bg-stone-900 p-6 rounded-xl border border-stone-600'>
                <h2 className='text-2xl font-bold'>Repos Not Loaded</h2>
                <p className='font-light text-stone-400'>
                    Click on a repository to begin a chat session.
                </p>
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
