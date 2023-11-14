'use client'
import { LoginButton } from '@/components/LoginButton'
import { Meta } from '@/layouts/Meta'
import { useSession, useUser } from '@supabase/auth-helpers-react'
import { Octokit } from 'octokit'
import { useEffect } from 'react'

const Index = () => {
    const user = useUser()
    const session = useSession()

    const getRepoInfo = async () => {
        if (!session) return
        const octokit = new Octokit({ auth: session.access_token })
        const githubUsername = session.user.user_metadata.user_name
        const repo = await octokit.request('GET /users/{username}/repos', {
            username: githubUsername,
            headers: {
                'X-GitHub-Api-Version': '2022-11-28',
            },
        })
        console.log({repo})
    }

    return (
        <div className='flex min-h-screen min-w-full flex-col items-center'>
            <Meta title='Dev Estimator' description='' />
            <div className='mt-16'>
                <p>{user ? <>Logged in as {user.id}</> : <>Not logged in</>}</p>
                <LoginButton />
                <button onClick={getRepoInfo} className='p-2 border text-white bg-black'>Log all repo info</button>
            </div>
        </div>
    )
}

export default Index
