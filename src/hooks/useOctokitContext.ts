import { OctokitContext } from '@/contexts/OctokitContextProvider'
import { useContext } from 'react'

export const useOctokitContext = () => {
    const context = useContext(OctokitContext)
    if (context === null) throw Error('Null Octokit context')
    return context
}
