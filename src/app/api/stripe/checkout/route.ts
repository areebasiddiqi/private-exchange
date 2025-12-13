import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { stripe } from "@/lib/stripe"

export async function POST(request: Request) {
    try {
        const supabase = await createClient()
        const { data: { user } } = await supabase.auth.getUser()

        if (!user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
        }

        const { amount } = await request.json()

        if (!amount || amount < 100) {
            return NextResponse.json(
                { error: "Minimum deposit is $100" },
                { status: 400 }
            )
        }

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
            success_url: `${request.headers.get('origin')}/dashboard/investor/wallet?success=true`,
            cancel_url: `${request.headers.get('origin')}/dashboard/investor/wallet?canceled=true`,
            metadata: {
                user_id: user.id,
                amount: amount.toString(),
                type: 'wallet_deposit',
            },
        })

        return NextResponse.json({ url: session.url })
    } catch (error) {
        console.error('Stripe checkout error:', error)
        return NextResponse.json(
            { error: 'Failed to create checkout session' },
            { status: 500 }
        )
    }
}
