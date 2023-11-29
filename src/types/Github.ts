import { Endpoints } from '@octokit/types'

export type UsernameReposResponse = Endpoints['GET /users/{username}/repos']['response']['data'][0]

export type RepoContentsResponse =
    Endpoints['GET /repos/{owner}/{repo}/contents/{path}']['response']['data']

export type GithubFile = {
    type: 'dir' | 'file' | 'submodule' | 'symlink'
    size: number
    name: string
    path: string
}
export type RepoLanguage = 'TypeScript' | 'JavaScript' | 'Python' | 'Jupyter Notebook'