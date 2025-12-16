"use server"

import { createClient } from "@/lib/supabase/server"
import { stripe } from "@/lib/stripe"
import { redirect } from "next/navigation"

export async function createStripeCheckout(amount: number, returnPath?: string) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        throw new Error("Unauthorized")
    }

    if (!amount || amount < 100) {
        throw new Error("Minimum deposit is $100")
    }

    // Get user's role to determine redirect path
    const { data: profile } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", user.id)
        .single()

    const dashboardPath = returnPath || (profile?.role === 'lender' ? '/dashboard/lender' : '/dashboard/investor/wallet')

    try {
        // Create Stripe Checkout Session
        const session = await stripe.checkout.sessions.create({
            payment_method_types: ['card'],
            line_items: [
                {
                    price_data: {
                        currency: 'usd',
                        product_data: {
                            name: 'Wallet Deposit',
                            description: `Add $${amount} to your wallet`,
                        },
                        unit_amount: amount * 100, // Stripe uses cents
                    },
                    quantity: 1,
                },
            ],
            mode: 'payment',
            success_url: `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}${dashboardPath}?success=true`,
            cancel_url: `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}${dashboardPath}?canceled=true`,
            metadata: {
                user_id: user.id,
                amount: amount.toString(),
                type: 'wallet_deposit',
            },
        })

        if (!session.url) {
            throw new Error("Failed to create checkout session - no URL returned")
        }

        // This will throw NEXT_REDIRECT which is expected behavior
        redirect(session.url)
    } catch (error: any) {
        // Re-throw Next.js redirect errors (they're not actual errors)
        if (error.message === 'NEXT_REDIRECT') {
            throw error
        }

        console.error('Stripe checkout error:', error)

        // Provide more specific error messages
        if (error.type === 'StripeInvalidRequestError') {
            throw new Error(`Stripe configuration error: ${error.message}`)
        }

        throw new Error(`Failed to create checkout session: ${error.message || 'Unknown error'}`)
    }
}
