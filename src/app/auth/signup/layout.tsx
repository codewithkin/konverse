import { Metadata } from 'next'
import { ReactNode } from 'react'

export const metadata: Metadata = {
    title: "Sign up for Konverse"
}

function SignUpLayout({ children }: { children: ReactNode }) {
    return (
        { children }
    )
}

export default SignUpLayout
