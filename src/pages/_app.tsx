import '../styles/global.css'
import { SessionProvider } from 'next-auth/react'
import { Session } from 'next-auth'

import type { AppProps } from 'next/app'

const MyApp = ({
    Component,
    pageProps: { session, ...pageProps },
}: AppProps & { session: Session }) => (
    <SessionProvider session={session}>
        <Component {...pageProps} />
    </SessionProvider>
)

export default MyApp
