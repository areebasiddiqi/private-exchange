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

    const investorLinks = [
        {
            href: "/dashboard/investor",
            label: "Marketplace",
            icon: LayoutDashboard,
        },
        {
            href: "/dashboard/investor/portfolio",
            label: "My Portfolio",
            icon: List,
        },
        {
            href: "/dashboard/investor/wallet",
            label: "Wallet",
            icon: Wallet,
        },
    ]

    const lenderLinks = [
        {
            href: "/dashboard/lender",
            label: "Overview",
            icon: LayoutDashboard,
        },
        {
            href: "/dashboard/lender/deals",
            label: "My Deals",
            icon: List,
        },
        {
            href: "/dashboard/lender/deals/create",
            label: "Submit Deal",
            icon: PlusCircle,
        },
    ]

    const adminLinks = [
        {
            href: "/dashboard/admin",
            label: "Admin Overview",
            icon: LayoutDashboard,
        },
        {
            href: "/dashboard/admin/users",
            label: "User Queue",
            icon: Users,
        },
        {
            href: "/dashboard/admin/deals",
            label: "Deal Queue",
            icon: FileText,
        },
        {
            href: "/dashboard/admin/investments",
            label: "Investment Queue",
            icon: TrendingUp,
        },
        {
            href: "/dashboard/admin/repayments",
            label: "Repayment Queue",
            icon: DollarSign,
        },
    ]

    const getLinks = () => {
        if (role === "admin") {
            return [
                { title: "Admin", links: adminLinks },
                { title: "Investor View", links: investorLinks },
                { title: "Lender View", links: lenderLinks },
            ]
        }
        if (role === "lender") {
            return [
                { title: "Lender", links: lenderLinks },
                { title: "Investor View", links: investorLinks },
            ]
        }
        return [{ title: "Investor", links: investorLinks }]
    }

    const linkGroups = getLinks()

    return (
        <div className="flex h-full w-full flex-col bg-white">
            <div className="flex h-16 items-center border-b border-gray-200 px-6">
                <h1 className="text-xl font-bold text-gray-900">Private Money Exchange</h1>
            </div>
            <div className="flex-1 overflow-auto py-4">
                {linkGroups.map((group, groupIndex) => (
                    <div key={group.title} className={cn(groupIndex > 0 && "mt-6")}>
                        <div className="px-6 mb-2">
                            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
                                {group.title}
                            </p>
                        </div>
                        <nav className="grid items-start px-4 text-sm font-medium">
                            {group.links.map((link) => {
                                const Icon = link.icon
                                const isActive = pathname === link.href
                                return (
                                    <Link
                                        key={link.href}
                                        href={link.href}
                                        className={cn(
                                            "flex items-center gap-3 rounded-lg px-3 py-2 transition-colors",
                                            isActive
                                                ? "bg-blue-50 text-blue-600"
                                                : "text-gray-700 hover:bg-gray-50"
                                        )}
                                    >
                                        <Icon className="h-4 w-4" />
                                        {link.label}
                                    </Link>
                                )
                            })}
                        </nav>
                    </div>
                ))}
                <div className="mt-6">
                    <div className="px-6 mb-2">
                        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
                            Account
                        </p>
                    </div>
                    <nav className="grid items-start px-4 text-sm font-medium">
                        <Link
                            href="/dashboard/profile"
                            className={cn(
                                "flex items-center gap-3 rounded-lg px-3 py-2 transition-colors",
                                pathname === "/dashboard/profile"
                                    ? "bg-blue-50 text-blue-600"
                                    : "text-gray-700 hover:bg-gray-50"
                            )}
                        >
                            <Settings className="h-4 w-4" />
                            Profile
                        </Link>
                    </nav>
                </div>
            </div>
            <div className="border-t border-gray-200 p-4">
                <button
                    onClick={handleSignOut}
                    className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 hover:text-red-600"
                >
                    <LogOut className="h-4 w-4" />
                    Sign Out
                </button>
            </div>
        </div>
    )
}
