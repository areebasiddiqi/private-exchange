import Link from "next/link"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { MapPin, Clock, TrendingUp, DollarSign } from "lucide-react"

export function DealCard({ deal }: { deal: any }) {
    return (
        <Card className="flex flex-col border-2 hover:border-blue-200 hover:shadow-lg transition-all">
            <CardHeader>
                <div className="flex justify-between items-start gap-2">
                    <CardTitle className="line-clamp-1 text-lg text-gray-900">{deal.title}</CardTitle>
                    <span className="inline-flex items-center rounded-full bg-blue-100 text-blue-800 px-2.5 py-0.5 text-xs font-semibold uppercase shrink-0">
                        {deal.property_type}
                    </span>
                </div>
                <div className="flex items-center gap-1 text-sm text-gray-600 mt-1">
                    <MapPin className="size-3" />
                    {deal.property_location}
                </div>
            </CardHeader>
            <CardContent className="flex-1 grid gap-4">
                <div className="grid grid-cols-2 gap-4">
                    <div className="bg-gray-50 rounded-lg p-3">
                        <div className="flex items-center gap-1 text-gray-500 text-xs">
                            <DollarSign className="size-3" />
                            Loan Amount
                        </div>
                        <div className="font-bold text-gray-900 mt-1">
                            ${deal.loan_amount?.toLocaleString() || '0'}
                        </div>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-3">
                        <div className="flex items-center gap-1 text-gray-500 text-xs">
                            <TrendingUp className="size-3" />
                            Interest Rate
                        </div>
                        <div className="font-bold text-green-600 mt-1">
                            {deal.interest_rate}%
                        </div>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-3">
                        <div className="flex items-center gap-1 text-gray-500 text-xs">
                            <Clock className="size-3" />
                            Term
                        </div>
                        <div className="font-bold text-gray-900 mt-1">
                            {deal.term_months} Months
                        </div>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-3">
                        <div className="text-gray-500 text-xs">LTV</div>
                        <div className="font-bold text-gray-900 mt-1">
                            {deal.ltv}%
                        </div>
                    </div>
                </div>
                {deal.description && (
                    <p className="text-sm text-gray-600 line-clamp-2">
                        {deal.description}
                    </p>
                )}
            </CardContent>
            <CardFooter>
                <Button asChild className="w-full bg-blue-600 hover:bg-blue-700">
                    <Link href={`/dashboard/investor/deals/${deal.id}`}>
                        View Deal Details
                    </Link>
                </Button>
            </CardFooter>
        </Card>
    )
}
