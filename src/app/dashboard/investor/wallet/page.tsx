import { createClient } from "@/lib/supabase/server"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { createStripeCheckout } from "@/app/actions/stripe"
import { Wallet, ArrowUpRight, ArrowDownLeft } from "lucide-react"
import { Counter } from "@/components/ui/counter"

export default async function InvestorWalletPage() {
    const supabase = await createClient()
    const {
        data: { user },
    } = await supabase.auth.getUser()

    const { data: wallet } = await supabase
        .from("wallets")
        .select("*")
        .eq("user_id", user?.id)
        .single()

    const { data: transactions } = await supabase
        .from("transactions")
        .select("*")
        .eq("user_id", user?.id)
        .order("created_at", { ascending: false })

    return (
        <div className="flex flex-col gap-6">
            <h1 className="text-3xl font-bold tracking-tight">My Wallet</h1>

            <div className="grid gap-6 md:grid-cols-2">
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Wallet className="h-5 w-5" />
                            Current Balance
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-4xl font-bold">
                            <Counter value={wallet?.balance || 0} />
                        </div>
                        <p className="text-sm text-muted-foreground mt-2">
                            Available for investment
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Deposit Funds</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <form action={async (formData) => {
                            "use server"
                            const amount = Number(formData.get("amount"))
                            await createStripeCheckout(amount)
                        }} className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="amount">Amount ($)</Label>
                                <Input
                                    id="amount"
                                    name="amount"
                                    type="number"
                                    min="100"
                                    step="100"
                                    placeholder="Enter amount to deposit"
                                    required
                                />
                            </div>
                            <Button type="submit" className="w-full">
                                Deposit with Stripe
                            </Button>
                        </form>
                    </CardContent>
                </Card>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Transaction History</CardTitle>
                </CardHeader>
                <CardContent>
                    {transactions && transactions.length > 0 ? (
                        <div className="relative w-full overflow-auto">
                            <table className="w-full caption-bottom text-sm">
                                <thead className="[&_tr]:border-b">
                                    <tr className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted">
                                        <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Type</th>
                                        <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Amount</th>
                                        <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Status</th>
                                        <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Date</th>
                                    </tr>
                                </thead>
                                <tbody className="[&_tr:last-child]:border-0">
                                    {transactions.map((tx) => (
                                        <tr key={tx.id} className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted">
                                            <td className="p-4 align-middle font-medium capitalize flex items-center gap-2">
                                                {tx.type === 'deposit' || tx.type === 'repayment' ? (
                                                    <ArrowDownLeft className="h-4 w-4 text-green-500" />
                                                ) : (
                                                    <ArrowUpRight className="h-4 w-4 text-red-500" />
                                                )}
                                                {tx.type}
                                            </td>
                                            <td className={`p-4 align-middle font-bold ${tx.type === 'deposit' || tx.type === 'repayment' ? 'text-green-600' : 'text-red-600'}`}>
                                                {tx.type === 'deposit' || tx.type === 'repayment' ? '+' : '-'}${Math.abs(tx.amount).toLocaleString()}
                                            </td>
                                            <td className="p-4 align-middle capitalize">{tx.status}</td>
                                            <td className="p-4 align-middle">{new Date(tx.created_at).toLocaleDateString()}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    ) : (
                        <div className="py-8 text-center text-muted-foreground">
                            No transactions yet.
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    )
}
