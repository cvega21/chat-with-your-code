import { ServerRoutes, ServerRoutesArgs, ServerRoutesRes } from '@/types/api'

export async function callApi<K extends keyof ServerRoutes>(
    method: K,
    args: ServerRoutesArgs[K]
): Promise<ServerRoutesRes[K]> {
    console.debug(`Calling API: ${method}`, args)
    const route = `/api/${method}`
    const res = await fetch(route, {
        method: 'POST',
        ...args,
    })

    console.debug(`${method} Response`, res)
    return res.json() as Promise<ServerRoutesRes[K]>
}
