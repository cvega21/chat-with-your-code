import { RepoLanguage } from '@/types/Github'


export const languageColors: Record<RepoLanguage, { bgColor: string, textColor: string}> = {
    JavaScript: {
        bgColor: 'bg-yellow-400',
        textColor: 'text-black'
    },
    TypeScript: {
        bgColor: 'bg-blue-600',
        textColor: 'text-white'
    },
    Python: {
        bgColor: 'bg-blue-400',
        textColor: 'text-white'
    },
    'Jupyter Notebook': {
        bgColor: 'bg-green-600',
        textColor: 'text-white'
    }
}

export const getLanguageColor = (language: string) => {
    if (!isRepoLanguage(language)) {
        return {bgColor: 'bg-gray-600', textColor: 'text-white'}
    }
    return languageColors[language]
}

export const isRepoLanguage = (language: string): language is RepoLanguage => {
    return Object.keys(languageColors).includes(language)
}
