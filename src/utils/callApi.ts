import { ServerMethodMapping, ServerRoutes, ServerRoutesArgs, ServerRoutesRes } from '@/types/ServerActions'
import { toast } from 'react-hot-toast'

export async function callApi<K extends keyof ServerRoutes>(
    route: K,
    args: ServerRoutesArgs[K]
): Promise<ServerRoutesRes[K]> {
    console.debug(`Calling API: ${route}`, args)
    const routeUrl = `/api/${route}`
    const method = ServerMethodMapping[route]
    const toastId = toast.loading('Loading...')
    const res = fetch(routeUrl, {
        method,
        body: JSON.stringify(args),
    })

    const data = (await (await res).json()) as ServerRoutesRes[K]
    console.debug(`${route} Response`, data)
    if (data.result === 'failure') {
        toast.error(data.error || 'Unknown error', { id: toastId })
    } else {
        toast.success('Success', { id: toastId })
    }
    return data
}
