import { createClient } from "@/lib/supabase/server"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { approveRepayment, rejectRepayment } from "@/app/actions/admin"

export default async function AdminRepaymentsPage() {
    const supabase = await createClient()

    const { data: pendingRepayments } = await supabase
        .from("pending_transactions")
        .select("*, profiles(full_name, company_name, email), deals(title, loan_amount)")
        .eq("type", "repayment")
        .eq("status", "pending")
        .order("created_at", { ascending: false })

    return (
        <div className="flex flex-col gap-4">
            <h1 className="text-2xl font-bold tracking-tight">Repayment Approval Queue</h1>
            <Card>
                <CardHeader>
                    <CardTitle>Pending Repayments</CardTitle>
                </CardHeader>
                <CardContent>
                    {pendingRepayments && pendingRepayments.length > 0 ? (
                        <div className="relative w-full overflow-auto">
                            <table className="w-full caption-bottom text-sm">
                                <thead className="[&_tr]:border-b">
                                    <tr className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted">
                                        <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Lender</th>
                                        <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Deal</th>
                                        <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Amount</th>
                                        <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Date</th>
                                        <th className="h-12 px-4 text-right align-middle font-medium text-muted-foreground">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="[&_tr:last-child]:border-0">
                                    {pendingRepayments.map((transaction) => (
                                        <tr key={transaction.id} className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted">
                                            <td className="p-4 align-middle font-medium">
                                                {transaction.profiles?.company_name || transaction.profiles?.full_name || transaction.profiles?.email || "Unknown"}
                                            </td>
                                            <td className="p-4 align-middle">{transaction.deals?.title || "Unknown Deal"}</td>
                                            <td className="p-4 align-middle">${transaction.amount.toLocaleString()}</td>
                                            <td className="p-4 align-middle">{new Date(transaction.created_at).toLocaleDateString()}</td>
                                            <td className="p-4 align-middle text-right">
                                                <div className="flex justify-end gap-2">
                                                    <form action={async () => {
                                                        "use server"
                                                        await approveRepayment(transaction.id)
                                                    }}>
                                                        <Button size="sm" variant="default">Approve</Button>
                                                    </form>
                                                    <form action={async () => {
                                                        "use server"
                                                        await rejectRepayment(transaction.id)
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
                            No pending repayments.
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    )
}
