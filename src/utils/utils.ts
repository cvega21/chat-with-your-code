import { createBrowserClient } from '@supabase/ssr'

export const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export const getCurrentEnv = () => {
    const envType = process.env.ENV_TYPE as 'local' | 'test' | 'prod'
    return envType
}
