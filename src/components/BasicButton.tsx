import React from 'react'

export const BasicButton = ({
    onClick,
    text,
    className,
    buttonType
}: {
    onClick: any
    text: string
    className?: string
    buttonType?: 'submit' | 'button' | 'reset'
}) => {
    return (
        <button
            onClick={onClick}
            className={`bg-black text-white px-2 py-1 m-2 text-sm ${className ? className : ''}`}
            type={buttonType}
        >
            {text}
        </button>
    )
}
