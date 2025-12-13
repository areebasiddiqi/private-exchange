import { createClient } from "@/lib/supabase/server"
import { notFound } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { investInDeal } from "@/app/actions/invest"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

export default async function DealDetailsPage({ params }: { params: Promise<{ id: string }> }) {
    const supabase = await createClient()
    const { id } = await params

    const { data: { user } } = await supabase.auth.getUser()

    const { data: deal } = await supabase
        .from("deals")
        .select("*, profiles(company_name, full_name)")
        .eq("id", id)
        .single()

    if (!deal) {
        notFound()
    }

    // Fetch wallet balance
    const { data: wallet } = await supabase
        .from("wallets")
        .select("balance")
        .eq("user_id", user?.id)
        .single()

    const balance = Number(wallet?.balance || 0)

    return (
        <div className="grid gap-6 lg:grid-cols-3">
            <div className="lg:col-span-2 space-y-6">
                <div>
                    <h1 className="text-3xl font-bold">{deal.title}</h1>
                    <p className="text-muted-foreground text-lg">{deal.property_location}</p>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>Investment Highlights</CardTitle>
                    </CardHeader>
                    <CardContent className="grid gap-4 sm:grid-cols-2">
                        <div>
                            <div className="text-sm text-muted-foreground">Loan Amount</div>
                            <div className="text-2xl font-bold">${deal.loan_amount.toLocaleString()}</div>
                        </div>
                        <div>
                            <div className="text-sm text-muted-foreground">Interest Rate</div>
                            <div className="text-2xl font-bold text-green-600">{deal.interest_rate}%</div>
                        </div>
                        <div>
                            <div className="text-sm text-muted-foreground">Term</div>
                            <div className="text-xl font-semibold">{deal.term_months} Months</div>
                        </div>
                        <div>
                            <div className="text-sm text-muted-foreground">LTV</div>
                            <div className="text-xl font-semibold">{deal.ltv}%</div>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Property Description</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="whitespace-pre-wrap leading-relaxed">{deal.description}</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Lender Information</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="grid gap-2">
                            <div className="font-semibold">{deal.profiles?.company_name || "Private Lender"}</div>
                            <div className="text-sm text-muted-foreground">
                                Verified Lender on Private Money Exchange
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            <div>
                <Card className="sticky top-6">
                    <CardHeader>
                        <CardTitle>Invest in this Deal</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="mb-4 p-4 bg-muted rounded-lg">
                            <div className="text-sm text-muted-foreground">Your Available Balance</div>
                            <div className="text-2xl font-bold">${balance.toLocaleString()}</div>
                        </div>

                        <form action={async (formData) => {
                            "use server"
                            const amount = Number(formData.get("amount"))
                            await investInDeal(deal.id, amount)
                        }} className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="amount">Investment Amount ($)</Label>
                                <Input
                                    id="amount"
                                    name="amount"
                                    type="number"
                                    min="1000"
                                    max={balance} // Prevent client-side submission if insufficient
                                    defaultValue="5000"
                                    step="1000"
                                    required
                                />
                                <p className="text-xs text-muted-foreground">Minimum investment: $1,000</p>
                            </div>
                            <Button type="submit" className="w-full" size="lg" disabled={balance < 1000}>
                                {balance < 1000 ? "Insufficient Funds" : "Commit Capital"}
                            </Button>
                        </form>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
