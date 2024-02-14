import { BasicButton } from '@/components/BasicButton'
import PageWrapper from '@/layouts/PageWrapper'
import { ChatDetails, ChatMessage } from '@/types/Chat'
import { callApi } from '@/utils/callApi'
import { useRouter } from 'next/router'
import { useEffect, useState } from 'react'
import { toast } from 'react-hot-toast'
import { GetServerSideProps, NextPageContext } from 'next'

export default function UserChat({ chatDetails }: { chatDetails: ChatDetails }) {
    const { owner, repoName, chatId, messages } = chatDetails
    console.log({messages})
    const [curMessage, setCurMessage] = useState<string>('')
    const [messageHistory, setMessageHistory] = useState<ChatMessage[]>(messages)

    const sendMessage = async () => {
        if (curMessage === '') {
            toast.error('Message cannot be empty')
            return
        }
        const res = await callApi('postChatMessage', {
            chatId,
            message: curMessage,
        })
        console.log({res})
        if (res.result === 'success') {
            toast.success(res.data as string)
            setCurMessage('')
        } else {
            toast.error('Failed to send message')
        }
    }

    return (
        <PageWrapper>
            <BasicButton
                text='Go Back'
                onClick={() => {
                    window.history.back()
                }}
            />
            <div className='w-full h-full flex-grow flex flex-col justify-between'>
                {chatDetails && (
                    <>
                        <h1 className='text-2xl font-bold text-center'>
                            {owner}/{repoName}
                        </h1>
                    </>
                )}
                <div className='w-full flex bg-stone-700 rounded-lg'>
                    <input
                        type='text'
                        className='bg-stone-700 p-2 px-4 w-full rounded-lg focus:outline-none placeholder-stone-500'
                        placeholder='Chat with your code...'
                        name='chatbox'
                        autoComplete='off'
                        value={curMessage}
                        onChange={(e) => setCurMessage(e.target.value)}
                        onSubmit={sendMessage}
                    />
                    <BasicButton
                        text={'Send'}
                        onClick={sendMessage}
                        className='px-4 py-2 rounded-lg'
                        buttonType='submit'
                    />
                </div>
            </div>
        </PageWrapper>
    )
}

export const getServerSideProps = async (context: NextPageContext) => {
    const { query } = context
    const chatId = query?.chatId
    if (!chatId) {
        console.error('No chatId found')
        console.log({ query })
        return { props: { query: { chatId: 0 } } }
    } else if (Array.isArray(chatId)) {
        console.error('chatId is an array')
        console.log({ chatId })
        return { props: { query: { chatId: chatId[0] } } }
    } else if (isNaN(parseInt(chatId))) {
        console.error('chatId is not a number')
        console.log({ chatId })
        return { props: { query: { chatId: 0 } } }
    }

    const chatDetails = (await callApi('getChatDetails', { chatId: parseInt(chatId) })).data
    console.log({chatDetails})
    return { props: { chatDetails } }
}
