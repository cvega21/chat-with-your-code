import { Meta } from '@/layouts/Meta'
import { OctokitContextProvider } from '@/contexts/OctokitContextProvider'
import { AllRepoMeta } from '@/components/AllRepoMeta'
import { BasicButton } from '@/components/BasicButton'
import { Toaster } from 'react-hot-toast'
import PageWrapper from '@/layouts/PageWrapper'

const App = () => {
    return (
        <PageWrapper>
            <Meta title='Dev Estimator' description='' />
            <Toaster />
            <BasicButton
                text='Go Back'
                onClick={() => {
                    window.history.back()
                }}
            />
            <OctokitContextProvider>
                <AllRepoMeta />
            </OctokitContextProvider>
        </PageWrapper>
    )
}

export default App
