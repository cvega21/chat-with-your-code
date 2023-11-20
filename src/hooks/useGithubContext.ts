import { GithubContext } from '@/contexts/GithubContextProvider'
import { useContext } from 'react'

export const useGithubContext = () => {
    const context = useContext(GithubContext)
    if (context === null) throw Error('Null Github context')
    return context
}
