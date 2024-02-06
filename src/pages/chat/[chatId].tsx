import { BasicButton } from '@/components/BasicButton'
import PageWrapper from '@/layouts/PageWrapper'
import { ChatDetails } from '@/types/Chat'
import { callApi } from '@/utils/callApi'
import { useRouter } from 'next/router'
import { useEffect, useState } from 'react'
import { toast } from 'react-hot-toast'

export default function UserChat() {
    const router = useRouter()
    console.log({ router })
    const [chatDetails, setChatDetails] = useState<ChatDetails | null>(null)

    useEffect(() => {
        const chatId = parseInt(router.query.chatId as string)
        console.log(chatId)
        callApi('getChatDetails', { chatId }).then(res => {
            console.log({ res })
            if (!res.data) return toast.error('No chat found')
            setChatDetails(res.data)
            return res.data
        })
    }, [])

    const owner = chatDetails?.owner
    const repoName = chatDetails?.repoName

    return (
        <PageWrapper>
            <BasicButton
                text='Go Back'
                onClick={() => {
                    window.history.back()
                }}
            />
            <div className='w-full h-full flex-grow flex flex-col justify-between'>
                { chatDetails &&
                <>
                    <h1 className='text-2xl font-bold text-center'>{owner}/{repoName}</h1>
                </>
                }
                <div className='w-full flex bg-stone-700 rounded-lg'>
                    <input
                        type={'text'}
                        className='bg-stone-700 p-2 w-full rounded-lg'
                        placeholder='Chat with your code...'
                    />
                    <BasicButton
                        text={'Send'}
                        onClick={() => {}}
                        className='px-4 py-2 rounded-lg'
                    />
                </div>
            </div>
        </PageWrapper>
    )
}
