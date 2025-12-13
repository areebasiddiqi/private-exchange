import { createClient } from "@/lib/supabase/server"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { approveDeal, rejectDeal } from "@/app/actions/admin"

export default async function AdminDealsPage() {
    const supabase = await createClient()

    const { data: deals } = await supabase
        .from("deals")
        .select("*, profiles(full_name, company_name)")
        .eq("status", "submitted")
        .order("created_at", { ascending: false })

    return (
        <div className="flex flex-col gap-4">
            <h1 className="text-2xl font-bold tracking-tight">Deal Approval Queue</h1>
            <Card>
                <CardHeader>
                    <CardTitle>Submitted Deals</CardTitle>
                </CardHeader>
                <CardContent>
                    {deals && deals.length > 0 ? (
                        <div className="relative w-full overflow-auto">
                            <table className="w-full caption-bottom text-sm">
                                <thead className="[&_tr]:border-b">
                                    <tr className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted">
                                        <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Title</th>
                                        <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Lender</th>
                                        <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Amount</th>
                                        <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">LTV</th>
                                        <th className="h-12 px-4 text-right align-middle font-medium text-muted-foreground">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="[&_tr:last-child]:border-0">
                                    {deals.map((deal) => (
                                        <tr key={deal.id} className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted">
                                            <td className="p-4 align-middle font-medium">{deal.title}</td>
                                            <td className="p-4 align-middle">
                                                {deal.profiles?.company_name || deal.profiles?.full_name || "Unknown"}
                                            </td>
                                            <td className="p-4 align-middle">${deal.loan_amount.toLocaleString()}</td>
                                            <td className="p-4 align-middle">{deal.ltv}%</td>
                                            <td className="p-4 align-middle text-right">
                                                <div className="flex justify-end gap-2">
                                                    <form action={async () => {
                                                        "use server"
                                                        await approveDeal(deal.id)
                                                    }}>
                                                        <Button size="sm" variant="default">Approve</Button>
                                                    </form>
                                                    <form action={async () => {
                                                        "use server"
                                                        await rejectDeal(deal.id)
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
                            No pending deals.
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    )
}
