'use client'
import { LoginButton } from '@/components/LoginButton'
import { Meta } from '@/layouts/Meta'
import { useSession } from 'next-auth/react'

const Index = () => {
    const { data: session } = useSession()

    return (
        <div className='flex min-h-screen min-w-full flex-col items-center'>
            <Meta title='Dev Estimator' description='' />
            <div className='mt-16'>
                <p>{session ? <>Logged in as {session.user?.name}</> : <>Not logged in</>}</p>
                <LoginButton />
            </div>
        </div>
    )
}

export default Index
