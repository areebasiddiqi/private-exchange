import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"

export default async function DashboardPage() {
    const supabase = await createClient()
    const {
        data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
        redirect("/login")
    }

    const { data: profile } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", user.id)
        .single()

    if (profile?.role === "lender") {
        redirect("/dashboard/lender")
    } else if (profile?.role === "investor") {
        redirect("/dashboard/investor") // Will implement later
    } else if (profile?.role === "admin") {
        redirect("/dashboard/admin") // Will implement later
    }

    return (
        <div>
            <h1>Dashboard</h1>
            <p>Redirecting...</p>
        </div>
    )
}
