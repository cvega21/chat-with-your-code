import { Meta } from '@/layouts/Meta'
import { OctokitContextProvider } from '@/contexts/OctokitContextProvider'
import { AllRepoMeta } from '@/components/AllRepoMeta'

const Index = () => {
    return (
        <div className='flex min-h-screen min-w-full flex-col items-center bg-stone-800 text-white px-8'>
            <Meta title='Dev Estimator' description='' />
            <OctokitContextProvider>
                <AllRepoMeta />
            </OctokitContextProvider>
        </div>
    )
}

export default Index
