import { BasicButton } from '@/components/BasicButton'
import PageWrapper from '@/layouts/PageWrapper'
import { ChatDetails, ChatMessage } from '@/types/Chat'
import { callApi } from '@/utils/callApi'
import { useRouter } from 'next/router'
import React, { useEffect, useRef, useState } from 'react'
import { toast } from 'react-hot-toast'
import { GetServerSideProps, NextPageContext } from 'next'

export default function UserChat({ chatDetails }: { chatDetails: ChatDetails }) {
    const { owner, repoName, chatId, messages } = chatDetails
    const [curMessage, setCurMessage] = useState<string>('')
    const [messageHistory, setMessageHistory] = useState<ChatMessage[]>(messages)
    const messagesEndRef = useRef<HTMLDivElement | null>(null)
    const inputRef = useRef<HTMLInputElement | null>(null)

    const sendMessage = async () => {
        if (curMessage === '') {
            toast.error('Message cannot be empty')
            return
        }
        setMessageHistory([
            ...messageHistory,
            { id: messageHistory.length, message: curMessage, sender: 'user' },
        ])
        const res = await callApi('postChatMessage', {
            chatId,
            message: curMessage,
        })
        console.log({ res })
        if (res.result === 'success' && res.data) {
            setMessageHistory(res.data.history)
            setCurMessage('')
        } else {
            toast.error('Failed to send message')
        }
    }

    useEffect(() => {
        if (messagesEndRef.current) {
            const scrollHeight = messagesEndRef.current.scrollHeight;
            messagesEndRef.current.scrollTop = scrollHeight;
        }
        if (inputRef.current) {
            inputRef.current.focus()
        }
    }, [messageHistory.length]);

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
                <ChatMessages messages={messageHistory} ref={messagesEndRef}/>
                <form className='w-full flex bg-stone-700 rounded-lg'>
                    <input
                        type='text'
                        className='bg-stone-700 p-2 px-4 w-full rounded-lg focus:outline-none placeholder-stone-500'
                        placeholder='Chat with your code...'
                        name='chatbox'
                        autoComplete='off'
                        value={curMessage}
                        onChange={e => setCurMessage(e.target.value)}
                        onSubmit={e => {
                            e.preventDefault()
                            sendMessage()
                        }}
                        ref={inputRef}
                    />
                    <BasicButton
                        text={'Send'}
                        onClick={sendMessage}
                        className='px-4 py-2 rounded-lg'
                        buttonType='submit'
                    />
                </form>
            </div>
        </PageWrapper>
    )
}

const ChatMessages = React.forwardRef<HTMLDivElement, { messages: ChatMessage[] }>(
    ({ messages }, ref) => {
        return (
            <div ref={ref} className='flex flex-col justify-between gap-4 max-h-[70vh] overflow-y-scroll px-2'>
                {messages.map(message => (
                    <div
                        key={message.id}
                        className={`flex w-full ${
                            message.sender === 'system' ? 'justify-start' : 'justify-end'
                        }`}
                    >
                        <div
                            className={`max-w-max py-2 px-3 rounded-xl ${
                                message.sender === 'system' ? 'bg-stone-700' : 'bg-sky-600'
                            }`}
                        >
                            <p>{message.message}</p>
                        </div>
                    </div>
                ))}
            </div>
        )
    }
)

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
    console.log({ chatDetails })
    return { props: { chatDetails } }
}
