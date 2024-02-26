import { Meta } from '@/layouts/Meta'
import { OctokitContextProvider } from '@/contexts/OctokitContextProvider'
import { AllRepoMeta } from '@/components/AllRepoMeta'
import { Toaster } from 'react-hot-toast'
import PageWrapper from '@/layouts/PageWrapper'

const Index = () => {
    return (
        <PageWrapper>
            <Meta title='Chat With Your Code' description='' />
            <Toaster />
            <h1 className='text-3xl font-bold mt-8'>Chat With Your Code</h1>
            <OctokitContextProvider>
                <AllRepoMeta />
            </OctokitContextProvider>
        </PageWrapper>
    )
}

export default Index
