'use client'

import React from 'react'
import { useSession, signIn, signOut } from 'next-auth/react'

export const LoginButton = () => {
    const { data: session } = useSession()

    const handleLogin = async () => {
        if (!session) {
            await signIn('github')
        } else {
            await signOut()
        }
    }

    return (
        <button onClick={handleLogin} className='bg-stone-800 text-white px-2 py-1 rounded-lg'>
            {!session ? 'Login with Github' : 'Log out'}
        </button>
    )
}
