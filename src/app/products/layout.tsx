import { Sidebar } from '@/components/shared/Sidebar'
import { Metadata } from 'next'
import { ReactNode } from 'react'

export const metadata: Metadata = {
    title: "Your Products"
}

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
