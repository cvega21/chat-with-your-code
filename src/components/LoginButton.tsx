'use client'

import React, { useEffect } from 'react'
import { useSession, signIn, signOut } from 'next-auth/react'
import { useSupabaseClient, useUser } from '@supabase/auth-helpers-react'
import { Auth } from '@supabase/auth-ui-react'
import { ThemeSupa } from '@supabase/auth-ui-shared'

export const LoginButton = () => {
    const supabase = useSupabaseClient()


    return (
        <Auth
            supabaseClient={supabase}
            providers={['github']}
            socialLayout='horizontal'
            appearance={{ theme: ThemeSupa }}
            redirectTo='http://localhost:54321/auth/v1/callback'
        />
    )
}
