import { Meta } from '@/layouts/Meta'
import { OctokitContextProvider } from '@/contexts/OctokitContextProvider'
import { AllRepoMeta } from '@/components/AllRepoMeta'
import { BasicButton } from '@/components/BasicButton'
import { Toaster } from 'react-hot-toast'

const App = () => {
    return (
        <div className='flex min-h-screen min-w-full flex-col items-center bg-stone-800 text-white px-8'>
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
        </div>
    )
}

export default App
