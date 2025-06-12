import { Sidebar } from '@/components/shared/Sidebar'
import { ReactNode } from 'react'

function DashboardLayout({ children }: { children: ReactNode }) {
    return (
        <main className='flex'>
            <Sidebar />
            {children}
        </main>
    )
}

export default DashboardLayout
