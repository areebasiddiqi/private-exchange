import { createClient } from "@/lib/supabase/server"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { DollarSign, Briefcase, Activity } from "lucide-react"

export default async function LenderDashboardPage() {
    const supabase = await createClient()
    const {
        data: { user },
    } = await supabase.auth.getUser()

    // Fetch summary stats
    const { count: dealsCount } = await supabase
        .from("deals")
        .select("*", { count: "exact", head: true })
        .eq("lender_id", user?.id)

    // Fetch active loans count
    const { count: activeLoansCount } = await supabase
        .from("deals")
        .select("*", { count: "exact", head: true })
        .eq("lender_id", user?.id)
        .eq("status", "funded")

    const { data: wallet } = await supabase
        .from("wallets")
        .select("balance")
        .eq("user_id", user?.id)
        .single()

    const balance = Number(wallet?.balance || 0)

    return (
        <div className="flex flex-col gap-4">
            <h1 className="text-2xl font-bold tracking-tight">Lender Overview</h1>
            <div className="grid gap-4 md:grid-cols-3">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Deals</CardTitle>
                        <Briefcase className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{dealsCount || 0}</div>
                        <p className="text-xs text-muted-foreground">
                            Submitted deals
                        </p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Wallet Balance</CardTitle>
                        <DollarSign className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">${balance.toLocaleString()}</div>
                        <p className="text-xs text-muted-foreground">
                            Available funds
                        </p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Active Loans</CardTitle>
                        <Activity className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{activeLoansCount || 0}</div>
                        <p className="text-xs text-muted-foreground">
                            Currently funded
                        </p>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
