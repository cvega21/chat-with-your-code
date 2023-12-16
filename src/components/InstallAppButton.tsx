import React, { useCallback, useEffect } from 'react'
import { useOctokitContext } from '@/hooks/useOctokitContext'

export const InstallAppButton = () => {
    const { getOctokit, username } = useOctokitContext()
    const [isInstalled, setIsInstalled] = React.useState<boolean>(false)

    const checkForInstall = useCallback(async () => {
        const octokit = await getOctokit()
        if (!octokit) return console.error('no octokit')
        const installs = await octokit.request('GET /user/installations', {
            headers: {
                'X-GitHub-Api-Version': '2022-11-28',
            },
        })
        console.log('checking for install')
        console.log({ installs })

        // todo add logic to check the correct app is installed
        if (installs.data.total_count === 0) {
            setIsInstalled(false)
            return false
        } else {
            setIsInstalled(true)
            return true
        }
    }, [username])

    const triggerAppInstall = async () => {
        window.open('https://github.com/apps/dev-estimator/installations/new', '_blank')
    }

    useEffect(() => {
        if (isInstalled) return
        checkForInstall()
    }, [username])

    return (
        <button
            onClick={triggerAppInstall}
            className={`bg-black text-white p-2 m-2`}
        >
            {isInstalled ? 'Uninstall App' : 'Install App'}
        </button>
    )
}
