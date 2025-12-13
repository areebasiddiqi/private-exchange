import Link from "next/link"
import { Button } from "@/components/ui/button"

export default function Home() {
    return (
        <div className="flex min-h-screen flex-col items-center justify-center gap-6 p-24">
            <h1 className="text-4xl font-bold tracking-tight">Private Money Exchange</h1>
            <p className="text-xl text-muted-foreground">
                Connect with accredited investors and fund your deals.
            </p>
            <div className="flex gap-4">
                <Button asChild>
                    <Link href="/login">Login</Link>
                </Button>
                <Button asChild variant="outline">
                    <Link href="/signup">Sign Up</Link>
                </Button>
            </div>
        </div>
    )
}
