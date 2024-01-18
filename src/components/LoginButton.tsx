import React, { useEffect } from 'react'
import { useSupabaseClient, useUser } from '@supabase/auth-helpers-react'
import { createBrowserClient } from '@supabase/ssr'

export const LoginButton = () => {
    const supabase = createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    )

    const user = useUser()

    const signInWithGithub = async () => {
        const { data, error } = await supabase.auth.signInWithOAuth({
            provider: 'github',
        })
        if (error) console.log('Error: ', error)
        console.log(data)
    }

    const signOut = async () => {
        await supabase.auth.signOut()
    }

    return (
        <button onClick={user ? signOut : signInWithGithub} className='bg-black text-white p-2 m-2'>
            {user ? 'Sign out' : 'Sign in with GitHub'}
        </button>
    )
}
