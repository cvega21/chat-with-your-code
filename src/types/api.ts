export type TestReqBody = {
    test: string
    title: string
}

export type APIResponse<T = unknown> = {
    result: 'success' | 'failure'
    data?: T
    error?: string
}

export interface ServerRoutesMeta {
    loadToVectorDb: {
        args: {
            provider_token: string
            repoName: string
        }
        res: APIResponse<string>
    }
}

export type ServerRoutesArgs = {
    [K in keyof ServerRoutesMeta]: ServerRoutesMeta[K]['args']
}

export type ServerRoutesRes = {
    [K in keyof ServerRoutesMeta]: ServerRoutesMeta[K]['res']
}

export type ServerRoutes = {
    [K in keyof ServerRoutesMeta]: (
        args: ServerRoutesArgs[K]
    ) => ServerRoutesMeta[K]['res']
}
