import React from 'react'

export const BasicButton = ({
    onClick,
    text,
    className,
}: {
    onClick: any
    text: string
    className?: string
}) => {
    return (
        <button
            onClick={onClick}
            className={`bg-black text-white px-2 py-1 m-2 text-sm ${className ? className : ''}`}
        >
            {text}
        </button>
    )
}
