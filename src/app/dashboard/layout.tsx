import { Sidebar } from '@/components/shared/Sidebar'
import { ReactNode } from 'react'

function DashboardLayout({ children }: { children: ReactNode }) {
    
    return (
        <main className='flex'>
            <Sidebar />
            <article className='w-full h-full p-4'>
                {children}
            </article>
        </main>
    )
}

export default DashboardLayout
