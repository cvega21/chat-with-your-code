import React, { useEffect } from 'react'
import { useSupabaseClient, useUser } from '@supabase/auth-helpers-react'
import { Auth } from '@supabase/auth-ui-react'
import { ThemeSupa } from '@supabase/auth-ui-shared'

export const LoginButton = () => {
    const supabase = useSupabaseClient()
    const user = useUser()

    const signInWithGithub = async () => {
        const { data, error } = await supabase.auth.signInWithOAuth({
            provider: 'github',
        })
        if (error) console.log('Error: ', error)
        console.log(data)

        window.open('https://github.com/apps/dev-estimator/installations/new', '_blank');
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
