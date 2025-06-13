import { Card, CardContent } from "@/components/ui/card"
import { Metadata } from "next"
import Link from "next/link"
import { ReactNode } from "react"

export const metadata: Metadata = {
    title: "Sign in or sign up to Konverse"
}

export default function AuthLayout({ children }: { children: ReactNode }) {
    return (
        <main className="min-h-screen grid grid-rows-2 relative items-center justify-center md:items-stretch md:justify-normal text-center md:text-left">
            <article className="h-full bg-gradient-to-tr from-white to-sky-400"></article>
            <article className="h-full flex flex-col justify-between p-4 md:p-16 gap-4 md:gap-0">
                {/* Copy */}
                <article className="flex flex-col gap-2 md:gap-0">
                    <h2 className="font-semibold text-2xl">Your WhatsApp storefront, powered by <span className="font-bold bg-clip-text bg-gradient-to-tr from-green-400 to-green-600 text-transparent">AI</span></h2>
                    <p className="text-muted-foreground text-md md:max-w-lg">Easily manage your business, automate responses, and engage customers—all within WhatsApp.</p>
                </article>

                {/* Links */}
                <article className="flex gap-2 items-center justify-center md:justify-start">
                    {
                        [{ name: "Terms of Service", link: "terms-of-service" }, { name: "Pricing", link: "pricing" }, { name: "Contact Us", link: "contact-us" }].map((item: { name: string, link: string }, index: number) => (
                            <Link key={index} className="text-md text-green-600 font-semibold" href={item.link}>
                                {item.name}
                            </Link>
                        ))
                    }
                </article>
            </article>

            <Card className="w-fit rounded-xl shadow-md shadow-green-200 border border-green-400 mx-auto md:mx-0 md:absolute right-4 bottom-10 top-10 px-4 py-8 h-fit">
                <CardContent>
                    {children}
                </CardContent>
            </Card>
        </main>
    )
}