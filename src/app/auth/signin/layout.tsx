import { Metadata } from 'next'
import { ReactNode } from 'react'

export const metadata: Metadata = {
    title: "Sign in to Konverse"
}

function SignInLayout({children}: {children: ReactNode}) {
  return (
    {children}
  )
}

export default SignInLayout
