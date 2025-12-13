"use server"

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"

export async function verifyUser(userId: string) {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error("Unauthorized")

    const { data: profile } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", user.id)
        .single()

    if (profile?.role !== "admin") {
        throw new Error("Unauthorized: Admin access required")
    }

    const { error } = await supabase
        .from("profiles")
        .update({ verification_status: "verified" })
        .eq("id", userId)

    if (error) {
        throw new Error(error.message)
    }

    revalidatePath("/dashboard/admin/users")
}

export async function rejectUser(userId: string) {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error("Unauthorized")

    const { data: profile } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", user.id)
        .single()

    if (profile?.role !== "admin") {
        throw new Error("Unauthorized: Admin access required")
    }

    const { error } = await supabase
        .from("profiles")
        .update({ verification_status: "rejected" })
        .eq("id", userId)

    if (error) {
        throw new Error(error.message)
    }

    revalidatePath("/dashboard/admin/users")
}

export async function approveDeal(dealId: string) {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error("Unauthorized")

    const { data: profile } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", user.id)
        .single()

    if (profile?.role !== "admin") {
        throw new Error("Unauthorized: Admin access required")
    }

    const { error } = await supabase
        .from("deals")
        .update({ status: "approved" })
        .eq("id", dealId)

    if (error) {
        throw new Error(error.message)
    }

    revalidatePath("/dashboard/admin/deals")
}

export async function rejectDeal(dealId: string) {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error("Unauthorized")

    const { data: profile } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", user.id)
        .single()

    if (profile?.role !== "admin") {
        throw new Error("Unauthorized: Admin access required")
    }

    const { error } = await supabase
        .from("deals")
        .update({ status: "rejected" })
        .eq("id", dealId)

    if (error) {
        throw new Error(error.message)
    }

    revalidatePath("/dashboard/admin/deals")
}

export async function approveInvestment(transactionId: string) {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error("Unauthorized")

    const { data: profile } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", user.id)
        .single()

    if (profile?.role !== "admin") {
        throw new Error("Unauthorized: Admin access required")
    }

    // Get pending transaction details
    const { data: transaction } = await supabase
        .from("pending_transactions")
        .select("*")
        .eq("id", transactionId)
        .single()

    if (!transaction) {
        throw new Error("Transaction not found")
    }

    // Process the investment via RPC
    const { error: rpcError } = await supabase.rpc('process_investment', {
        p_deal_id: transaction.deal_id,
        p_investor_id: transaction.user_id,
        p_amount: transaction.amount
    })

    if (rpcError) {
        throw new Error(rpcError.message)
    }

    // Mark transaction as approved
    const { error } = await supabase
        .from("pending_transactions")
        .update({ status: "approved", updated_at: new Date().toISOString() })
        .eq("id", transactionId)

    if (error) {
        throw new Error(error.message)
    }

    revalidatePath("/dashboard/admin/investments")
    revalidatePath("/dashboard/lender")
}

export async function rejectInvestment(transactionId: string) {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error("Unauthorized")

    const { data: profile } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", user.id)
        .single()

    if (profile?.role !== "admin") {
        throw new Error("Unauthorized: Admin access required")
    }

    const { error } = await supabase
        .from("pending_transactions")
        .update({ status: "rejected", updated_at: new Date().toISOString() })
        .eq("id", transactionId)

    if (error) {
        throw new Error(error.message)
    }

    revalidatePath("/dashboard/admin/investments")
}

export async function approveRepayment(transactionId: string) {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error("Unauthorized")

    const { data: profile } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", user.id)
        .single()

    if (profile?.role !== "admin") {
        throw new Error("Unauthorized: Admin access required")
    }

    // Get pending transaction details
    const { data: transaction } = await supabase
        .from("pending_transactions")
        .select("*")
        .eq("id", transactionId)
        .single()

    if (!transaction) {
        throw new Error("Transaction not found")
    }

    // Process the repayment via RPC
    const { error: rpcError } = await supabase.rpc('process_repayment', {
        p_deal_id: transaction.deal_id,
        p_lender_id: transaction.user_id,
        p_total_repayment_amount: transaction.amount
    })

    if (rpcError) {
        throw new Error(rpcError.message)
    }

    // Mark transaction as approved
    const { error } = await supabase
        .from("pending_transactions")
        .update({ status: "approved", updated_at: new Date().toISOString() })
        .eq("id", transactionId)

    if (error) {
        throw new Error(error.message)
    }

    revalidatePath("/dashboard/admin/repayments")
    revalidatePath("/dashboard/lender")
}

export async function rejectRepayment(transactionId: string) {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error("Unauthorized")

    const { data: profile } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", user.id)
        .single()

    if (profile?.role !== "admin") {
        throw new Error("Unauthorized: Admin access required")
    }

    const { error } = await supabase
        .from("pending_transactions")
        .update({ status: "rejected", updated_at: new Date().toISOString() })
        .eq("id", transactionId)

    if (error) {
        throw new Error(error.message)
    }

    revalidatePath("/dashboard/admin/repayments")
}
