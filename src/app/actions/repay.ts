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
