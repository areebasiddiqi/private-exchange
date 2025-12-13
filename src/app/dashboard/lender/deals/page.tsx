import { createClient } from "@/lib/supabase/server"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { PlusCircle } from "lucide-react"

export default async function LenderDealsPage() {
    const supabase = await createClient()
    const {
        data: { user },
    } = await supabase.auth.getUser()

    const { data: deals } = await supabase
        .from("deals")
        .select("*")
        .eq("lender_id", user?.id)
        .order("created_at", { ascending: false })

    return (
        <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold tracking-tight">My Deals</h1>
                <Button asChild>
                    <Link href="/dashboard/lender/deals/create">
                        <PlusCircle className="mr-2 h-4 w-4" />
                        Submit New Deal
                    </Link>
                </Button>
            </div>

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
                                        <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Amount</th>
                                        <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Rate</th>
                                        <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Term</th>
                                        <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Status</th>
                                        <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Date</th>
                                    </tr>
                                </thead>
                                <tbody className="[&_tr:last-child]:border-0">
                                    {deals.map((deal) => (
                                        <tr key={deal.id} className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted">
                                            <td className="p-4 align-middle font-medium">{deal.title}</td>
                                            <td className="p-4 align-middle">${deal.loan_amount.toLocaleString()}</td>
                                            <td className="p-4 align-middle">{deal.interest_rate}%</td>
                                            <td className="p-4 align-middle">{deal.term_months} mo</td>
                                            <td className="p-4 align-middle capitalize">{deal.status}</td>
                                            <td className="p-4 align-middle">{new Date(deal.created_at).toLocaleDateString()}</td>
                                            <td className="p-4 align-middle text-right">
                                                {deal.status === 'funded' && (
                                                    <Button size="sm" asChild>
                                                        <Link href={`/dashboard/lender/deals/${deal.id}/repay`}>
                                                            Repay Loan
                                                        </Link>
                                                    </Button>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    ) : (
                        <div className="flex flex-col items-center justify-center py-8 text-center">
                            <p className="text-muted-foreground">No deals submitted yet.</p>
                            <Button variant="link" asChild className="mt-2">
                                <Link href="/dashboard/lender/deals/create">
                                    Submit your first deal
                                </Link>
                            </Button>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    )
}
