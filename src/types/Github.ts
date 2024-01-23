import { Endpoints } from '@octokit/types'

export type UsernameReposResponse = Endpoints['GET /users/{username}/repos']['response']['data'][0]

export type RepoContentsResponse =
    Endpoints['GET /repos/{owner}/{repo}/contents/{path}']['response']['data']

export type GithubFile = {
    type: "dir" | "file" | "submodule" | "symlink";
    size: number;
    name: string;
    path: string;
    content?: string;
    sha: string;
    /** Format: uri */
    url: string;
    /** Format: uri */
    git_url: string | null;
    /** Format: uri */
    html_url: string | null;
    /** Format: uri */
    download_url: string | null;
    _links: {
      /** Format: uri */
      git: string | null;
      /** Format: uri */
      html: string | null;
      /** Format: uri */
      self: string;
    };
    /** @example "actual/actual.md" */
    target?: string;
    /** @example "git://example.com/defunkt/dotjs.git" */
    submodule_git_url?: string;
    repoName?: string
    data?: string
}

export type RepoLanguage = 'TypeScript' | 'JavaScript' | 'Python' | 'Jupyter Notebook'
