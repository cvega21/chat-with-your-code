import { BasicButton } from '@/components/BasicButton'
import { Meta } from '@/layouts/Meta'
import { useRouter } from 'next/router'
import App from './app'
const Index = () => {
    const router = useRouter()

    return (
        <div className='flex min-h-screen min-w-full flex-col items-center bg-stone-800 text-white px-8'>
            <Meta
                title='Welcome to Dev Estimator'
                description='Explore the app to estimate your development tasks.'
            />
            <h1>
                Welcome to AutoDev.AI
            </h1>
            <BasicButton text='Enter App' onClick={() => {
                router.push('/app')
            }}/>
        </div>
    )
}

export default Index
