import { createClient } from "@/lib/supabase/server"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { verifyUser, rejectUser } from "@/app/actions/admin"

export default async function AdminUsersPage() {
    const supabase = await createClient()

    const { data: users } = await supabase
        .from("profiles")
        .select("*")
        .eq("verification_status", "pending")
        .order("created_at", { ascending: false })

    return (
        <div className="flex flex-col gap-4">
            <h1 className="text-2xl font-bold tracking-tight">User Verification Queue</h1>
            <Card>
                <CardHeader>
                    <CardTitle>Pending Users</CardTitle>
                </CardHeader>
                <CardContent>
                    {users && users.length > 0 ? (
                        <div className="relative w-full overflow-auto">
                            <table className="w-full caption-bottom text-sm">
                                <thead className="[&_tr]:border-b">
                                    <tr className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted">
                                        <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Name</th>
                                        <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Role</th>
                                        <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Company</th>
                                        <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Date</th>
                                        <th className="h-12 px-4 text-right align-middle font-medium text-muted-foreground">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="[&_tr:last-child]:border-0">
                                    {users.map((user) => (
                                        <tr key={user.id} className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted">
                                            <td className="p-4 align-middle font-medium">{user.full_name || "N/A"}</td>
                                            <td className="p-4 align-middle capitalize">{user.role}</td>
                                            <td className="p-4 align-middle">{user.company_name || "-"}</td>
                                            <td className="p-4 align-middle">{new Date(user.created_at).toLocaleDateString()}</td>
                                            <td className="p-4 align-middle text-right">
                                                <div className="flex justify-end gap-2">
                                                    <form action={async () => {
                                                        "use server"
                                                        await verifyUser(user.id)
                                                    }}>
                                                        <Button size="sm" variant="default">Verify</Button>
                                                    </form>
                                                    <form action={async () => {
                                                        "use server"
                                                        await rejectUser(user.id)
                                                    }}>
                                                        <Button size="sm" variant="destructive">Reject</Button>
                                                    </form>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    ) : (
                        <div className="py-8 text-center text-muted-foreground">
                            No pending user verifications.
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    )
}
