"use client"

import Link from "next/link"
import { User } from "lucide-react"
import { Button } from "@/components/ui/button"

export function Header() {
    return (
        <header className="flex h-14 items-center justify-between border-b bg-muted/40 px-6 lg:h-[60px]">
            <div className="w-full flex-1">
                {/* Add search or breadcrumbs here if needed */}
            </div>
            <div className="flex items-center gap-4">
                <Link href="/dashboard/profile">
                    <Button variant="ghost" size="icon" className="rounded-full">
                        <User className="h-5 w-5" />
                        <span className="sr-only">Profile</span>
                    </Button>
                </Link>
            </div>
        </header>
    )
}
