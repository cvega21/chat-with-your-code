import { createClient } from '@supabase/supabase-js'
import { OpenAI } from 'openai'
import { Database } from '@/types/SupabasePostgres.types'

export const supabase = createClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
)
export const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
})
