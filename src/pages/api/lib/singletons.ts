import { createClient } from '@supabase/supabase-js'
import { OpenAI } from 'openai'

export const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
)
export const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
})
