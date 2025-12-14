"use client"

import Link from "next/link"
import { User, Menu } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger, SheetTitle, SheetDescription } from "@/components/ui/sheet"
import { Sidebar } from "./sidebar"
import { createClient } from "@/lib/supabase/client"
import { useEffect, useState } from "react"

export function Header() {
    const [role, setRole] = useState<string>("")
    const supabase = createClient()

    useEffect(() => {
        async function getRole() {
            const { data: { user } } = await supabase.auth.getUser()
            if (user) {
                const { data: profile } = await supabase
                    .from("profiles")
                    .select("role")
                    .eq("id", user.id)
                    .single()
                if (profile) setRole(profile.role)
            }
        }
        getRole()
    }, [])

    return (
        <header className="sticky top-0 z-50 flex h-16 items-center justify-between border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 px-6">
            <div className="flex items-center gap-4">
                <Sheet>
                    <SheetTrigger asChild>
                        <Button variant="outline" size="icon" className="shrink-0 md:hidden">
                            <Menu className="h-5 w-5" />
                            <span className="sr-only">Toggle navigation menu</span>
                        </Button>
                    </SheetTrigger>
                    <SheetContent side="left" className="flex flex-col p-0 w-72">
                        <SheetTitle className="sr-only">Navigation Menu</SheetTitle>
                        <SheetDescription className="sr-only">Main navigation menu for the dashboard</SheetDescription>
                        <Sidebar role={role} />
                    </SheetContent>
                </Sheet>
                <div className="w-full flex-1 md:w-auto md:flex-none">
                    {/* Add search or breadcrumbs here if needed */}
                </div>
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
