"use server"

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"

export async function depositFunds(amount: number) {
    const supabase = await createClient()

    const {
        data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
        throw new Error("Unauthorized")
    }

    // 1. Get current wallet or create if not exists (handled by trigger usually, but good to be safe)
    let { data: wallet } = await supabase
        .from("wallets")
        .select("*")
        .eq("user_id", user.id)
        .single()

    if (!wallet) {
        // Should have been created by trigger, but if not:
        const { data: newWallet, error: createError } = await supabase
            .from("wallets")
            .insert({ user_id: user.id, balance: 0 })
            .select()
            .single()

        if (createError) throw new Error(createError.message)
        wallet = newWallet
    }

    // 2. Update balance
    const newBalance = (Number(wallet.balance) || 0) + amount

    const { error: updateError } = await supabase
        .from("wallets")
        .update({ balance: newBalance })
        .eq("id", wallet.id)

    if (updateError) throw new Error(updateError.message)

    // 3. Create transaction record
    const { error: transactionError } = await supabase
        .from("transactions")
        .insert({
            user_id: user.id,
            type: "deposit",
            amount: amount,
            status: "completed",
        })

    if (transactionError) console.error("Transaction error:", transactionError)

    revalidatePath("/dashboard/investor/wallet")
    revalidatePath("/dashboard/investor/portfolio")
}
