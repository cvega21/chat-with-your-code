import { ServerRoutes, ServerRoutesArgs, ServerRoutesRes } from '@/types/api'

export async function callApi<K extends keyof ServerRoutes>(
    method: K,
    args: ServerRoutesArgs[K]
): Promise<ServerRoutesRes[K]> {
    console.debug(`Calling API: ${method}`, args)
    const route = `/api/${method}`
    const res = await fetch(route, {
        method: 'POST',
        body: JSON.stringify(args),
    })

    const data = await res.json() as ServerRoutesRes[K]
    console.debug(`${method} Response`, data)
    return data
}
