import { Endpoints } from '@octokit/types'

export type RepoData = Endpoints['GET /users/{username}/repos']['response']['data'][0]
export type RepoLanguage = 'TypeScript' | 'JavaScript' | 'Python' | 'Jupyter Notebook'
