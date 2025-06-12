import { Button } from '@/components/ui/button'
import { CheckCheck, CheckCircle, CheckCircle2, CheckCircle2Icon } from 'lucide-react'
import Link from 'next/link'
import React from 'react'

function SuccessPage() {
    return (
        <article className='w-full h-full flex flex-col justify-center items-center'>
            <CheckCircle2Icon size={120} className='fill-green-400 text-white' />
            <article className="my-8 flex flex-col gap-2 justify-center items-center">
                <h2 className='text-2xl font-semibold text-center'>Success !</h2>
                <p className="text-muted-foreground max-w-xs text-center">
                    Your account was created successfully, please check your email for a confirmation link
                </p>
            </article>
            <Button className='w-full' variant="secondary" asChild>
                <Link href="/auth/signin">
                    Sign in
                </Link>
            </Button>
        </article>
    )
}

export default SuccessPage
