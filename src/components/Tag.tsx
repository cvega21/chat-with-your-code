import React from 'react'

export const Tag = ({ text, bgColor, textColor }: { text: string; bgColor?: string; textColor?: string }) => {
    return (
        <div
            className={`${
                bgColor ? bgColor : 'bg-indigo-600'
            } ${textColor ? textColor: 'text-white'} rounded-lg px-2 text-sm flex items-center max-w-min whitespace-nowrap`}
        >
            <p>{text}</p>
        </div>
    )
}
