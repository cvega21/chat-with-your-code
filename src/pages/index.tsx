import { Login } from '@/components/Login'
import { Meta } from '@/layouts/Meta'

const Index = () => {
    return (
        <div className='flex min-h-screen min-w-full flex-col items-center'>
            <Meta title='Dev Estimator' description='' />
            <div className='mt-16'>
                <Login />
            </div>
        </div>
    )
}

export default Index
