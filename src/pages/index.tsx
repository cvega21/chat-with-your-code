import { Meta } from '@/layouts/Meta'
import { GithubContextProvider } from '@/contexts/GithubContextProvider'
import { AllRepoMeta } from '@/components/AllRepoMeta'

const Index = () => {
    return (
        <div className='flex min-h-screen min-w-full flex-col items-center'>
            <Meta title='Dev Estimator' description='' />
            <GithubContextProvider>
                <AllRepoMeta/>
            </GithubContextProvider>
        </div>
    )
}

export default Index
