"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { Loader2 } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select } from "@/components/ui/select"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { cn } from "@/lib/utils"

const formSchema = z.object({
    title: z.string().min(5, "Title must be at least 5 characters"),
    description: z.string().min(20, "Description must be at least 20 characters"),
    loanAmount: z.coerce.number().min(1000, "Minimum loan amount is $1,000"),
    interestRate: z.coerce.number().min(1, "Minimum interest rate is 1%").max(100, "Maximum is 100%"),
    termMonths: z.coerce.number().min(1, "Minimum term is 1 month"),
    ltv: z.coerce.number().min(1, "Minimum LTV is 1%").max(100, "Maximum is 100%"),
    propertyType: z.string().min(1, "Property type is required"),
    propertyLocation: z.string().min(5, "Location is required"),
    exit_strategy: z.string().min(10, "Exit strategy is required"),
    documents: z.string().optional(),
})

export default function CreateDealPage() {
    const router = useRouter()
    const supabase = createClient()
    const [isLoading, setIsLoading] = useState(false)

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            title: "",
            description: "",
            loanAmount: 0,
            interestRate: 0,
            termMonths: 0,
            ltv: 0,
            propertyType: "residential",
            propertyLocation: "",
            exit_strategy: "",
            documents: "",
        },
    })

    async function onSubmit(values: z.infer<typeof formSchema>) {
        setIsLoading(true)

        try {
            const {
                data: { user },
            } = await supabase.auth.getUser()

            if (!user) throw new Error("No user found")

            const { error } = await supabase.from("deals").insert({
                lender_id: user.id,
                title: values.title,
                description: values.description,
                loan_amount: values.loanAmount,
                interest_rate: values.interestRate,
                term_months: values.termMonths,
                ltv: values.ltv,
                property_type: values.propertyType,
                property_location: values.propertyLocation,
                exit_strategy: values.exit_strategy,
                documents: values.documents ? values.documents.split('\n').filter(url => url.trim() !== '') : [],
                status: "submitted",
            })

            if (error) throw error

            router.push("/dashboard/lender/deals")
            router.refresh()
        } catch (error) {
            console.error("Error creating deal:", error)
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <div className="max-w-2xl mx-auto">
            <Card>
                <CardHeader>
                    <CardTitle>Submit New Deal</CardTitle>
                    <CardDescription>
                        Provide details about the loan opportunity.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                        <div className="grid gap-4">
                            <div className="grid gap-2">
                                <Label htmlFor="title">Deal Title</Label>
                                <Input
                                    id="title"
                                    placeholder="e.g. Fix & Flip in Austin, TX"
                                    disabled={isLoading}
                                    {...form.register("title")}
                                />
                                {form.formState.errors.title && (
                                    <p className="text-sm text-red-500">{form.formState.errors.title.message}</p>
                                )}
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="description">Description</Label>
                                <Textarea
                                    id="description"
                                    placeholder="Describe the property, exit strategy, and borrower details..."
                                    disabled={isLoading}
                                    {...form.register("description")}
                                />
                                {form.formState.errors.description && (
                                    <p className="text-sm text-red-500">{form.formState.errors.description.message}</p>
                                )}
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="grid gap-2">
                                    <Label htmlFor="loanAmount">Loan Amount ($)</Label>
                                    <Input
                                        id="loanAmount"
                                        type="number"
                                        disabled={isLoading}
                                        {...form.register("loanAmount")}
                                    />
                                    {form.formState.errors.loanAmount && (
                                        <p className="text-sm text-red-500">{form.formState.errors.loanAmount.message}</p>
                                    )}
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="interestRate">Interest Rate (%)</Label>
                                    <Input
                                        id="interestRate"
                                        type="number"
                                        step="0.1"
                                        disabled={isLoading}
                                        {...form.register("interestRate")}
                                    />
                                    {form.formState.errors.interestRate && (
                                        <p className="text-sm text-red-500">{form.formState.errors.interestRate.message}</p>
                                    )}
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="grid gap-2">
                                    <Label htmlFor="termMonths">Term (Months)</Label>
                                    <Input
                                        id="termMonths"
                                        type="number"
                                        disabled={isLoading}
                                        {...form.register("termMonths")}
                                    />
                                    {form.formState.errors.termMonths && (
                                        <p className="text-sm text-red-500">{form.formState.errors.termMonths.message}</p>
                                    )}
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="ltv">LTV (%)</Label>
                                    <Input
                                        id="ltv"
                                        type="number"
                                        step="0.1"
                                        disabled={isLoading}
                                        {...form.register("ltv")}
                                    />
                                    {form.formState.errors.ltv && (
                                        <p className="text-sm text-red-500">{form.formState.errors.ltv.message}</p>
                                    )}
                                </div>
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="propertyType">Property Type</Label>
                                <Select
                                    id="propertyType"
                                    disabled={isLoading}
                                    {...form.register("propertyType")}
                                >
                                    <option value="residential">Residential (1-4 Units)</option>
                                    <option value="multifamily">Multifamily (5+ Units)</option>
                                    <option value="commercial">Commercial</option>
                                    <option value="land">Land</option>
                                </Select>
                                {form.formState.errors.propertyType && (
                                    <p className="text-sm text-red-500">{form.formState.errors.propertyType.message}</p>
                                )}
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="propertyLocation">Property Location</Label>
                                <Input
                                    id="propertyLocation"
                                    placeholder="Address or City, State"
                                    disabled={isLoading}
                                    {...form.register("propertyLocation")}
                                />
                                {form.formState.errors.propertyLocation && (
                                    <p className="text-sm text-red-500">{form.formState.errors.propertyLocation.message}</p>
                                )}
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="exit_strategy">Exit Strategy</Label>
                                <Textarea
                                    id="exit_strategy"
                                    placeholder="Explain how the loan will be repaid (e.g., Sale of property, Refinance)"
                                    disabled={isLoading}
                                    {...form.register("exit_strategy")}
                                />
                                {form.formState.errors.exit_strategy && (
                                    <p className="text-sm text-red-500">{form.formState.errors.exit_strategy.message}</p>
                                )}
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="documents">Supporting Documents (URLs)</Label>
                                <Textarea
                                    id="documents"
                                    placeholder="Enter URLs for Appraisal, Budget, etc. (One per line)"
                                    disabled={isLoading}
                                    {...form.register("documents")}
                                />
                                <p className="text-xs text-muted-foreground">For now, please paste direct links to your documents.</p>
                            </div>

                            <Button disabled={isLoading} className="w-full">
                                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                Submit Deal
                            </Button>
                        </div>
                    </form>
                </CardContent>
            </Card>
        </div>
    )
}
