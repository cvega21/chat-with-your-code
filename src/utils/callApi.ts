import { ServerMethodMapping, ServerRoutes, ServerRoutesArgs, ServerRoutesRes } from '@/types/ServerActions'
import { toast } from 'react-hot-toast'
import { getCurrentEnv } from './utils'

export async function callApi<K extends keyof ServerRoutes>(
    route: K,
    args: ServerRoutesArgs[K]
): Promise<ServerRoutesRes[K]> {
    console.log(`Calling API: ${route}`, args)
    const routeUrl = `/api/${route}`
    const method = ServerMethodMapping[route]
    // const toastId = toast.loading('Loading...')

    const env = getCurrentEnv()
    let baseUrl = ''
    if (env === 'local') {
        baseUrl = 'http://localhost:3000'
    }
    const res = await fetch(`${baseUrl}${routeUrl}`, {
        method,
        body: JSON.stringify(args),
    })
    const data = (await res.json()) as ServerRoutesRes[K]
    console.log(`${route} Response`, data)
    if (data.result === 'failure') {
        // toast.error(data.error || 'Unknown error', { id: toastId })
        toast.error(data.error || 'Unknown error')
    } else {
        // toast.success('Success', { id: toastId })
    }
    return data
}
