import { supabase } from '@/utils/utils'
import { Octokit } from '@octokit/core'
import { useSession, useSessionContext } from '@supabase/auth-helpers-react'
import React, { createContext, useEffect } from 'react'

export type IOctokitContext = {
    octokit: Octokit | null
    username: string | null
	getOctokit: () => Promise<Octokit | null>
}

export const OctokitContext = createContext<IOctokitContext | null>(null)

export const OctokitContextProvider = ({ children }: { children: React.ReactNode }) => {
    // const session = useSession()
	const {isLoading, session, error} = useSessionContext()
	console.log({session})

	const [octokit, setOctokit] = React.useState<Octokit | null>(null)
    const [username, setUsername] = React.useState<string | null>(null)

	const getOctokit = async (): Promise<Octokit> => {
		console.log('Getting octokit...')
		if (octokit) {
			return octokit
		}

		const provider_token = session?.provider_token
		if (!session ) {
			console.error('no session')
			console.log({isLoading})
			return new Octokit() // unauthenticated octokit
			// throw new Error('no session')
			// return null
		}
		if (!provider_token) {
			console.error('no provider token in session or local storage')
			console.log({session})
			await supabase.auth.signOut()
			return new Octokit() // unauthenticated octokit
		}
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

    const octokitContext: IOctokitContext = { octokit, username, getOctokit }

    return <OctokitContext.Provider value={octokitContext}>{children}</OctokitContext.Provider>
}
