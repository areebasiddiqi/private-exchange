import { createClient } from "@/lib/supabase/server"
import { notFound } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { repayLoan } from "@/app/actions/repay"

export default async function RepayLoanPage({ params }: { params: Promise<{ id: string }> }) {
    const supabase = await createClient()
    const { id } = await params

    const { data: deal } = await supabase
        .from("deals")
        .select("*")
        .eq("id", id)
        .single()

    if (!deal) {
        notFound()
    }

    // Simple Interest Calculation: Principal + (Principal * Rate * Term/12)
    const principal = Number(deal.loan_amount)
    const interest = principal * (Number(deal.interest_rate) / 100) * (deal.term_months / 12)
    const totalDue = principal + interest

    return (
        <div className="flex flex-col gap-6 max-w-2xl mx-auto">
            <h1 className="text-3xl font-bold tracking-tight">Repay Loan</h1>

            <Card>
                <CardHeader>
                    <CardTitle>Loan Summary: {deal.title}</CardTitle>
                </CardHeader>
                <CardContent className="grid gap-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <div className="text-sm text-muted-foreground">Principal</div>
                            <div className="text-lg font-semibold">${principal.toLocaleString()}</div>
                        </div>
                        <div>
                            <div className="text-sm text-muted-foreground">Interest Rate</div>
                            <div className="text-lg font-semibold">{deal.interest_rate}%</div>
                        </div>
                        <div>
                            <div className="text-sm text-muted-foreground">Term</div>
                            <div className="text-lg font-semibold">{deal.term_months} Months</div>
                        </div>
                        <div>
                            <div className="text-sm text-muted-foreground">Total Interest</div>
                            <div className="text-lg font-semibold text-red-600">${interest.toLocaleString(undefined, { maximumFractionDigits: 2 })}</div>
                        </div>
                    </div>

                    <div className="border-t pt-4 mt-2">
                        <div className="flex justify-between items-center">
                            <span className="text-lg font-bold">Total Payoff Amount</span>
                            <span className="text-2xl font-bold">${totalDue.toLocaleString(undefined, { maximumFractionDigits: 2 })}</span>
                        </div>
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Process Repayment</CardTitle>
                </CardHeader>
                <CardContent>
                    <form action={async (formData) => {
                        "use server"
                        const amount = Number(formData.get("amount"))
                        await repayLoan(deal.id, amount)
                    }} className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="amount">Repayment Amount ($)</Label>
                            <Input
                                id="amount"
                                name="amount"
                                type="number"
                                defaultValue={totalDue.toFixed(2)}
                                readOnly
                                className="bg-muted"
                            />
                            <p className="text-xs text-muted-foreground">
                                Full repayment required to close the loan.
                            </p>
                        </div>
                        <Button type="submit" className="w-full" size="lg">
                            Confirm Repayment
                        </Button>
                    </form>
                </CardContent>
            </Card>
        </div>
    )
}
