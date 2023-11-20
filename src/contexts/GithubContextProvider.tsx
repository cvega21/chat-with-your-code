import { Octokit } from '@octokit/core'
import { useSession } from '@supabase/auth-helpers-react'
import React, { createContext, useEffect } from 'react'

export type IGithubContext = {
    octokit: Octokit | null
    username: string | null
	getOctokit: () => Promise<Octokit | null>
}

export const GithubContext = createContext<IGithubContext | null>(null)

export const GithubContextProvider = ({ children }: { children: React.ReactNode }) => {
    const session = useSession()

	const [octokit, setOctokit] = React.useState<Octokit | null>(null)
    const [username, setUsername] = React.useState<string | null>(null)

	const getOctokit = async (): Promise<Octokit | null> => {
		const provider_token = session?.provider_token || localStorage.getItem('provider_token')
		if (!session) {
			console.error('no session')
			return null
		}
		if (!provider_token) {
			console.error('no provider token in session or local storage')
			console.log({session})
			return null
		}
		if (octokit) return octokit
		const newOctokit = new Octokit({ auth: session.provider_token })
		const user = await newOctokit.request('GET /user')
		setUsername(user.data.login)
		setOctokit(newOctokit)
		return newOctokit
	}

	useEffect(() => {
		if (!session) return
		const storedProviderToken = localStorage.getItem('provider_token')
		if (!storedProviderToken && session.provider_token) {
			localStorage.setItem('provider_token', session.provider_token)
		}
	}, [session])

    const githubContext: IGithubContext = { octokit, username, getOctokit }

    return <GithubContext.Provider value={githubContext}>{children}</GithubContext.Provider>
}
