"use server"

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"

export async function repayLoan(dealId: string, amount: number) {
    const supabase = await createClient()

    const {
        data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
        throw new Error("Unauthorized")
    }

    // Check wallet balance before creating repayment request
    const { data: walletData } = await supabase
        .from("wallets")
        .select("balance")
        .eq("user_id", user.id)
        .single()

    const currentBalance = walletData?.balance || 0
    if (currentBalance < amount) {
        throw new Error(`Insufficient wallet balance. You need $${amount.toLocaleString(undefined, { maximumFractionDigits: 2 })} but only have $${currentBalance.toLocaleString(undefined, { maximumFractionDigits: 2 })}.`)
    }

    // Create pending transaction for admin approval
    const { error } = await supabase
        .from("pending_transactions")
        .insert({
            user_id: user.id,
            deal_id: dealId,
            type: "repayment",
            amount: amount,
            status: "pending"
        })

    if (error) {
        console.error("Error creating pending repayment:", error)
        throw new Error(error.message)
    }

    revalidatePath("/dashboard/lender/deals")
    redirect("/dashboard/lender/deals?pending=true")
}
