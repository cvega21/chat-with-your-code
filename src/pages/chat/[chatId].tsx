import { BasicButton } from '@/components/BasicButton'
import PageWrapper from '@/layouts/PageWrapper'
import { ChatDetails, ChatMessage } from '@/types/Chat'
import { callApi } from '@/utils/callApi'
import { useRouter } from 'next/router'
import React, { useEffect, useRef, useState } from 'react'
import { toast } from 'react-hot-toast'
import { GetServerSideProps, NextPageContext } from 'next'
import Link from 'next/link'
import { useChat } from 'ai/react'
import { Message as VercelChatMessage } from 'ai'

export default function UserChat({ chatDetails }: { chatDetails: ChatDetails }) {
    const { owner, repoName, chatId, messages: dbMessages } = chatDetails
    const messagesEndRef = useRef<HTMLDivElement | null>(null)
    const inputRef = useRef<HTMLInputElement | null>(null)
    const initialMessages: VercelChatMessage[] = dbMessages.map(m => ({
        content: m.message,
        role: m.sender === 'user' ? 'user' : 'assistant',
        id: m.id.toString(),
    }))
    const {
        messages: vercelMessages,
        input,
        handleInputChange,
        handleSubmit,
    } = useChat({
        body: {
            chatId,
        },
        initialMessages,
    })

    useEffect(() => {
        if (messagesEndRef.current) {
            const scrollHeight = messagesEndRef.current.scrollHeight
            messagesEndRef.current.scrollTop = scrollHeight
        }
        if (inputRef.current) {
            inputRef.current.focus()
        }
    }, [vercelMessages])

    return (
        <PageWrapper>
            <Link href='/'>
                <BasicButton text='Go Back' onClick={() => {}} />
            </Link>
            <div className='w-full h-full flex-grow flex flex-col justify-between'>
                {chatDetails && (
                    <>
                        <h1 className='text-2xl font-bold text-center'>
                            {owner}/{repoName}
                        </h1>
                    </>
                )}
                <ChatMessages messages={vercelMessages} ref={messagesEndRef} />
                <form
                    className='w-full flex bg-stone-700 rounded-lg'
                    onSubmit={e => {
                        console.log('submit')
                        e.preventDefault()
                        e.stopPropagation()
                        handleSubmit(e)
                    }}
                >
                    <input
                        type='text'
                        className='bg-stone-700 p-2 px-4 w-full rounded-lg focus:outline-none placeholder-stone-500'
                        placeholder='Chat with your code...'
                        name='chatbox'
                        autoComplete='off'
                        value={input}
                        onChange={handleInputChange}
                        ref={inputRef}
                        onSubmit={e => {
                            console.log('submit thru input')
                            e.preventDefault()
                            e.stopPropagation()
                        }}
                    />
                    <BasicButton
                        text={'Send'}
                        onClick={() => {}}
                        className='px-4 py-2 rounded-lg'
                        buttonType='submit'
                    />
                </form>
            </div>
        </PageWrapper>
    )
}

const ChatMessages = React.forwardRef<HTMLDivElement, { messages: VercelChatMessage[] }>(
    ({ messages }, ref) => {
        return (
            <div
                ref={ref}
                className='flex flex-col justify-between gap-4 max-h-[70vh] overflow-y-scroll px-2'
            >
                {messages.map(message => (
                    <div
                        key={message.id}
                        className={`flex w-full ${
                            message.role === 'assistant' ? 'justify-start' : 'justify-end'
                        }`}
                    >
                        <div
                            className={`max-w-max py-2 px-3 rounded-xl ${
                                message.role === 'assistant' ? 'bg-stone-700' : 'bg-sky-600'
                            }`}
                        >
                            <p>{message.content}</p>
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
