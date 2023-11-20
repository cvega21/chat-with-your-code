import { Octokit } from '@octokit/core'
import React, { createContext } from 'react'

export type IGithubContext = {
    octokit: Octokit | null
    username: string | null
    initOctokit: (provider_token: string) => Promise<void>
}

export const GithubContext = createContext<IGithubContext | null>(null)

export const GithubContextProvider = ({ children }: { children: React.ReactNode }) => {
    const [octokit, setOctokit] = React.useState<Octokit | null>(null)
    const [username, setUsername] = React.useState<string | null>(null)
    const initOctokit = async (provider_token: string) => {
        const octokit = new Octokit({ auth: provider_token })
        const user = await octokit.request('GET /user')
        setUsername(user.data.name)
        setOctokit(octokit)
    }

    const githubContext: IGithubContext = { octokit, username, initOctokit }

    return <GithubContext.Provider value={githubContext}>{children}</GithubContext.Provider>
}
