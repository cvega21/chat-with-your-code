import React from 'react'

const PageWrapper = ({ children }: { children: React.ReactNode }) => {
    return (
        <div className='flex min-h-screen min-w-full flex-col items-center bg-stone-800 text-white p-8 flex-grow'>
            {children}
        </div>
    )
}

export default PageWrapper
