"use client"

import Link from "next/link"
import { User, Menu, Bell } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger, SheetTitle, SheetDescription } from "@/components/ui/sheet"
import { Sidebar } from "./sidebar"
import { createClient } from "@/lib/supabase/client"
import { useEffect, useState } from "react"

export function Header() {
    const [role, setRole] = useState<string>("")
    const [userName, setUserName] = useState<string>("")
    const [userEmail, setUserEmail] = useState<string>("")
    const supabase = createClient()

    useEffect(() => {
        async function getUserInfo() {
            const { data: { user } } = await supabase.auth.getUser()
            if (user) {
                setUserEmail(user.email || "")
                const { data: profile } = await supabase
                    .from("profiles")
                    .select("role, full_name")
                    .eq("id", user.id)
                    .single()
                if (profile) {
                    setRole(profile.role)
                    setUserName(profile.full_name || user.email?.split("@")[0] || "User")
                }
            }
        }
        getUserInfo()
    }, [])

    return (
        <header className="sticky top-0 z-50 flex h-16 items-center justify-between border-b border-gray-200 bg-white px-6">
            <div className="flex items-center gap-4">
                <Sheet>
                    <SheetTrigger asChild>
                        <Button variant="outline" size="icon" className="shrink-0 lg:hidden">
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
                <div className="hidden lg:block">
                    <p className="text-sm text-gray-600">
                        {role === "admin" ? "Admin Portal" : role === "lender" ? "Lender Portal" : "Investor Portal"}
                    </p>
                </div>
            </div>
            <div className="flex items-center gap-4">
                <div className="hidden sm:block text-right">
                    <p className="font-medium text-gray-900 text-sm">{userName}</p>
                    <p className="text-xs text-gray-600">{userEmail}</p>
                </div>
                <Link href="/dashboard/profile">
                    <Button variant="ghost" size="icon" className="rounded-full bg-gray-100 hover:bg-gray-200">
                        <User className="h-5 w-5 text-gray-600" />
                        <span className="sr-only">Profile</span>
                    </Button>
                </Link>
            </div>
        </header>
    )
}
