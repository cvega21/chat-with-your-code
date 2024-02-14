import '../styles/global.css'
import { SessionContextProvider, Session } from '@supabase/auth-helpers-react'

import type { AppProps } from 'next/app'
import { getSupabaseBrowserClient } from '@/lib/supabaseClient'
import { useState } from 'react'
import dynamic from 'next/dynamic'

const Toaster = dynamic(
    () => import('react-hot-toast').then(c => c.Toaster),
    {
        ssr: false
    }
)

const MyApp = ({
    Component,
    pageProps: { initialSession, ...pageProps },
}: AppProps<{ initialSession: Session }>) => {
    const [supabaseClient] = useState(() => getSupabaseBrowserClient())

    return (
        <SessionContextProvider initialSession={initialSession} supabaseClient={supabaseClient}>
            <Toaster/>
            <Component {...pageProps} />
        </SessionContextProvider>
    )
}

export default MyApp
