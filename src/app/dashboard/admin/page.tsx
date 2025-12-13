import { createClient } from "@/lib/supabase/server"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Users, FileText, AlertCircle } from "lucide-react"

export default async function AdminDashboardPage() {
    const supabase = await createClient()

    // Fetch stats
    const { count: usersCount } = await supabase
        .from("profiles")
        .select("*", { count: "exact", head: true })

    const { count: pendingUsersCount } = await supabase
        .from("profiles")
        .select("*", { count: "exact", head: true })
        .eq("verification_status", "pending")

    const { count: pendingDealsCount } = await supabase
        .from("deals")
        .select("*", { count: "exact", head: true })
        .eq("status", "submitted")

    return (
        <div className="flex flex-col gap-4">
            <h1 className="text-2xl font-bold tracking-tight">Admin Overview</h1>
            <div className="grid gap-4 md:grid-cols-3">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Users</CardTitle>
                        <Users className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{usersCount || 0}</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Pending Verifications</CardTitle>
                        <AlertCircle className="h-4 w-4 text-yellow-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{pendingUsersCount || 0}</div>
                        <p className="text-xs text-muted-foreground">
                            Users awaiting approval
                        </p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Pending Deals</CardTitle>
                        <FileText className="h-4 w-4 text-blue-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{pendingDealsCount || 0}</div>
                        <p className="text-xs text-muted-foreground">
                            Deals awaiting approval
                        </p>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
