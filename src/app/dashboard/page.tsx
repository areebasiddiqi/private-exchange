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

    const { data: profile, error } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", user.id)
        .single()

    // Debug: log what we got
    console.log("Dashboard redirect - user:", user.id, "profile:", profile, "error:", error)

    if (profile?.role === "admin") {
        redirect("/dashboard/admin")
    } else if (profile?.role === "lender") {
        redirect("/dashboard/lender")
    } else {
        // Default to investor dashboard (handles 'investor' role and any fallback)
        redirect("/dashboard/investor")
    }
}
