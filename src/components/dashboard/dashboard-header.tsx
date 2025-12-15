"use client"

import { LogOut } from "lucide-react"
import { Button } from "@/components/ui/button"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"

interface DashboardHeaderProps {
    user: {
        name: string
        email: string
        role: string
    }
}

export function DashboardHeader({ user }: DashboardHeaderProps) {
    const router = useRouter()
    const supabase = createClient()

    const handleSignOut = async () => {
        await supabase.auth.signOut()
        router.push("/login")
        router.refresh()
    }

    const getPortalName = () => {
        switch (user.role) {
            case "admin":
                return "Admin Portal"
            case "lender":
                return "Lender Portal"
            default:
                return "Investor Portal"
        }
    }

    return (
        <header className="bg-white border-b border-gray-200">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Private Money Exchange</h1>
                        <p className="text-sm text-gray-600">{getPortalName()}</p>
                    </div>
                    <div className="flex items-center gap-4">
                        <div className="text-right hidden sm:block">
                            <p className="font-medium text-gray-900">{user.name}</p>
                            <p className="text-sm text-gray-600">{user.email}</p>
                        </div>
                        <Button variant="outline" size="sm" onClick={handleSignOut}>
                            <LogOut className="mr-2 size-4" />
                            Logout
                        </Button>
                    </div>
                </div>
            </div>
        </header>
    )
}
