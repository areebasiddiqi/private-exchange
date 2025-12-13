import { NextResponse } from "next/server"
import { headers } from "next/headers"
import { stripe } from "@/lib/stripe"
import { createClient } from "@supabase/supabase-js"

// Use service role client for webhook (bypasses RLS)
const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(request: Request) {
    const body = await request.text()
    const headersList = await headers()
    const signature = headersList.get("stripe-signature")

    if (!signature) {
        return NextResponse.json({ error: "No signature" }, { status: 400 })
    }

    let event

    try {
        event = stripe.webhooks.constructEvent(
            body,
            signature,
            process.env.STRIPE_WEBHOOK_SECRET!
        )
    } catch (err) {
        console.error("Webhook signature verification failed:", err)
        return NextResponse.json({ error: "Invalid signature" }, { status: 400 })
    }

    // Handle the event
    if (event.type === "checkout.session.completed") {
        const session = event.data.object

        const userId = session.metadata?.user_id
        const amount = parseFloat(session.metadata?.amount || "0")

        if (!userId || !amount) {
            console.error("Missing metadata in checkout session")
            return NextResponse.json({ error: "Invalid metadata" }, { status: 400 })
        }

        try {
            console.log(`Processing deposit for user ${userId}, amount: $${amount}`)

            // 1. Get or create wallet
            let { data: wallet, error: walletFetchError } = await supabaseAdmin
                .from("wallets")
                .select("*")
                .eq("user_id", userId)
                .single()

            if (walletFetchError && walletFetchError.code !== 'PGRST116') {
                console.error("Error fetching wallet:", walletFetchError)
                throw walletFetchError
            }

            if (!wallet) {
                console.log("Creating new wallet for user")
                const { data: newWallet, error: createError } = await supabaseAdmin
                    .from("wallets")
                    .insert({ user_id: userId, balance: 0 })
                    .select()
                    .single()

                if (createError) {
                    console.error("Error creating wallet:", createError)
                    throw createError
                }
                wallet = newWallet
            }

            // 2. Update wallet balance
            const newBalance = Number(wallet.balance) + amount
            console.log(`Updating wallet balance from ${wallet.balance} to ${newBalance}`)

            const { error: updateError } = await supabaseAdmin
                .from("wallets")
                .update({
                    balance: newBalance,
                    updated_at: new Date().toISOString()
                })
                .eq("id", wallet.id)

            if (updateError) {
                console.error("Error updating wallet:", updateError)
                throw updateError
            }

            // 3. Create transaction record
            console.log("Creating transaction record")
            const { error: txError } = await supabaseAdmin
                .from("transactions")
                .insert({
                    user_id: userId,
                    type: "deposit",
                    amount: amount,
                    status: "completed",
                    reference_id: session.id,
                })

            if (txError) {
                console.error("Error creating transaction:", txError)
                throw txError
            }

            console.log(`✅ Deposit completed: $${amount} for user ${userId}`)
        } catch (error: any) {
            console.error("Error processing deposit:", error)
            console.error("Error details:", {
                message: error.message,
                code: error.code,
                details: error.details,
            })
            return NextResponse.json(
                { error: "Failed to process deposit", details: error.message },
                { status: 500 }
            )
        }
    }

    return NextResponse.json({ received: true })
}
