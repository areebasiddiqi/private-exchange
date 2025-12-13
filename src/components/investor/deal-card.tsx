import Link from "next/link"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "lucide-react" // Wait, Badge is usually a component, let's check if I have it. I don't think I created a Badge component. I'll use a simple span for now or create one.
// Actually, I'll just use standard HTML/Tailwind for badges for now to save time, or create a simple one inline.

export function DealCard({ deal }: { deal: any }) {
    return (
        <Card className="flex flex-col">
            <CardHeader>
                <div className="flex justify-between items-start">
                    <CardTitle className="line-clamp-1 text-lg">{deal.title}</CardTitle>
                    <span className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 border-transparent bg-primary text-primary-foreground hover:bg-primary/80 uppercase">
                        {deal.property_type}
                    </span>
                </div>
                <div className="text-sm text-muted-foreground">{deal.property_location}</div>
            </CardHeader>
            <CardContent className="flex-1 grid gap-4">
                <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                        <div className="text-muted-foreground">Loan Amount</div>
                        <div className="font-semibold">${deal.loan_amount.toLocaleString()}</div>
                    </div>
                    <div>
                        <div className="text-muted-foreground">Interest Rate</div>
                        <div className="font-semibold">{deal.interest_rate}%</div>
                    </div>
                    <div>
                        <div className="text-muted-foreground">Term</div>
                        <div className="font-semibold">{deal.term_months} Months</div>
                    </div>
                    <div>
                        <div className="text-muted-foreground">LTV</div>
                        <div className="font-semibold">{deal.ltv}%</div>
                    </div>
                </div>
                <p className="text-sm text-muted-foreground line-clamp-3 mt-2">
                    {deal.description}
                </p>
            </CardContent>
            <CardFooter>
                <Button asChild className="w-full">
                    <Link href={`/dashboard/investor/deals/${deal.id}`}>
                        View Details
                    </Link>
                </Button>
            </CardFooter>
        </Card>
    )
}
