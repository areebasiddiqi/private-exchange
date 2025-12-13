import { createClient } from "@/lib/supabase/server"
import { DealCard } from "@/components/investor/deal-card"

export default async function InvestorMarketplacePage() {
    const supabase = await createClient()

    const { data: deals } = await supabase
        .from("deals")
        .select("*")
        .eq("status", "approved")
        .order("created_at", { ascending: false })

    return (
        <div className="flex flex-col gap-6">
            <div className="flex flex-col gap-2">
                <h1 className="text-3xl font-bold tracking-tight">Marketplace</h1>
                <p className="text-muted-foreground">
                    Browse vetted lending opportunities and deploy capital.
                </p>
            </div>

            {deals && deals.length > 0 ? (
                <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                    {deals.map((deal) => (
                        <DealCard key={deal.id} deal={deal} />
                    ))}
                </div>
            ) : (
                <div className="flex flex-col items-center justify-center py-12 text-center border rounded-lg bg-muted/10">
                    <h3 className="text-lg font-semibold">No active deals</h3>
                    <p className="text-muted-foreground">
                        Check back later for new investment opportunities.
                    </p>
                </div>
            )}
        </div>
    )
}
