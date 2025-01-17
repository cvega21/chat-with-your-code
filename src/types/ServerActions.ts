import { ChatDetails, ChatMessage } from './Chat'
import { Message as VercelChatMessage } from 'ai'

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
    loadRepoToVectorDb: {
        args: {
            owner: string
            repoName: string
            provider_token: string
        }
        res: APIResponse<string>
    }
    loadFileToVectorDb: {
        args: {
            fileName: string
            owner: string
            repoName: string
            path: string
            provider_token: string
        }
        res: APIResponse<string>
    }
    getReposInDb: {
        args: {
            owner: string
        }
        res: APIResponse<string[]>
    }
    startNewChat: {
        args: {
            owner: string
            repoName: string
        }
        res: APIResponse<number>
    }
    getChatDetails: {
        args: {
            chatId: number
        }
        res: APIResponse<ChatDetails>
    }
    postChatMessage: {
        args: {
            chatId: number
            message: string
        }
        res: APIResponse<{ response: string; history: ChatMessage[] }>
    }
    getRecentChats: {
        args: {
            owner: string
        }
        res: APIResponse<{ chatId: number; repoName: string }[]>
    }
    postChatMessageStream: {
        args: {
            chatId: number
            messages: VercelChatMessage[]
        }
        res: APIResponse<{ response: string; history: VercelChatMessage[] }> // unused because it's a stream
    }
}

export type ServerMethod = 'POST' | 'GET'

export const ServerMethodMapping: Record<keyof ServerRoutes, ServerMethod> = {
    loadRepoToVectorDb: 'POST',
    loadFileToVectorDb: 'POST',
    getReposInDb: 'POST',
    startNewChat: 'POST',
    getChatDetails: 'POST',
    postChatMessage: 'POST',
    getRecentChats: 'POST',
    postChatMessageStream: 'POST',
}

export type ServerRoutesArgs = {
    [K in keyof ServerRoutesMeta]: ServerRoutesMeta[K]['args']
}

export type ServerRoutesRes = {
    [K in keyof ServerRoutesMeta]: ServerRoutesMeta[K]['res']
}

export type ServerRoutes = {
    [K in keyof ServerRoutesMeta]: (args: ServerRoutesArgs[K]) => ServerRoutesMeta[K]['res']
}
