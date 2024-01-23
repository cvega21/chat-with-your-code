import { ServerRoutes, ServerRoutesArgs, ServerRoutesRes } from '@/types/api'
import { toast } from 'react-hot-toast'

export async function callApi<K extends keyof ServerRoutes>(
    method: K,
    args: ServerRoutesArgs[K]
): Promise<ServerRoutesRes[K]> {
    console.debug(`Calling API: ${method}`, args)
    const route = `/api/${method}`
    const toastId = toast.loading('Loading...')
    const res = fetch(route, {
        method: 'POST',
        body: JSON.stringify(args),
    })


    const data = await (await res).json() as ServerRoutesRes[K]
    console.debug(`${method} Response`, data)
    if (data.result === 'failure') {
        toast.error(data.error || 'Unknown error', { id: toastId })
    } else {
        toast.success('Success', { id: toastId })
    }
    return data
}
