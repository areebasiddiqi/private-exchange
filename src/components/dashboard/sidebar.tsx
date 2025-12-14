"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { LayoutDashboard, PlusCircle, List, LogOut, Users, FileText, Wallet, TrendingUp, DollarSign, Settings } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"

export function Sidebar({ role }: { role: string }) {
    const pathname = usePathname()
    const router = useRouter()
    const supabase = createClient()

    const handleSignOut = async () => {
        await supabase.auth.signOut()
        router.push("/login")
        router.refresh()
    }

    const allLinks = [
        {
            href: "/dashboard/lender",
            label: "Overview",
            icon: LayoutDashboard,
            roles: ["lender", "investor", "admin"],
        },
        {
            href: "/dashboard/lender/deals",
            label: "My Deals",
            icon: List,
            roles: ["lender", "investor", "admin"],
        },
        {
            href: "/dashboard/lender/deals/create",
            label: "Submit Deal",
            icon: PlusCircle,
            roles: ["lender", "investor", "admin"],
        },
        // Admin links
        {
            href: "/dashboard/admin",
            label: "Admin Overview",
            icon: LayoutDashboard,
            roles: ["admin"],
        },
        {
            href: "/dashboard/admin/users",
            label: "User Queue",
            icon: Users,
            roles: ["admin"],
        },
        {
            href: "/dashboard/admin/deals",
            label: "Deal Queue",
            icon: FileText,
            roles: ["admin"],
        },
        {
            href: "/dashboard/admin/investments",
            label: "Investment Queue",
            icon: TrendingUp,
            roles: ["admin"],
        },
        {
            href: "/dashboard/admin/repayments",
            label: "Repayment Queue",
            icon: DollarSign,
            roles: ["admin"],
        },
        // Investor links
        {
            href: "/dashboard/investor",
            label: "Marketplace",
            icon: LayoutDashboard,
            roles: ["lender", "investor", "admin"],
        },
        {
            href: "/dashboard/investor/portfolio",
            label: "My Portfolio",
            icon: List,
            roles: ["lender", "investor", "admin"],
        },
        {
            href: "/dashboard/investor/wallet",
            label: "Wallet",
            icon: Wallet,
            roles: ["lender", "investor", "admin"],
        },
        {
            href: "/dashboard/profile",
            label: "Profile",
            icon: Settings,
            roles: ["lender", "investor", "admin"],
        },
    ]

    const links = allLinks.filter(link => link.roles.includes(role))

    return (
        <div className="flex h-full w-full flex-col bg-background border-r border-border/50">
            <div className="flex h-16 items-center border-b border-border/50 px-6 font-semibold font-heading tracking-tight text-lg">
                Private Money Exchange
            </div>
            <div className="flex-1 overflow-auto py-4">
                <nav className="grid items-start px-4 text-sm font-medium">
                    {links.map((link) => {
                        const Icon = link.icon
                        return (
                            <Link
                                key={link.href}
                                href={link.href}
                                className={cn(
                                    "group flex items-center gap-3 rounded-lg px-3 py-2 transition-all duration-300 hover:text-primary hover:pl-4",
                                    pathname === link.href
                                        ? "bg-gradient-to-r from-primary/10 to-transparent text-primary border-l-2 border-primary shadow-[0_0_20px_rgba(124,58,237,0.1)]"
                                        : "text-muted-foreground hover:bg-muted/50"
                                )}
                            >
                                <Icon className="h-4 w-4" />
                                {link.label}
                            </Link>
                        )
                    })}
                </nav>
            </div>
            <div className="border-t p-4">
                <button
                    onClick={handleSignOut}
                    className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground transition-all hover:text-primary"
                >
                    <LogOut className="h-4 w-4" />
                    Sign Out
                </button>
            </div>
        </div >
    )
}
