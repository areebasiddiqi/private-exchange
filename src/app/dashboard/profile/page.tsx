import { createClient } from "@/lib/supabase/server"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { redirect } from "next/navigation"
import { User, Mail, Building2, Shield } from "lucide-react"

export default async function ProfilePage() {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        redirect("/login")
    }

    const { data: profile } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single()

    async function updateProfile(formData: FormData) {
        "use server"

        const supabase = await createClient()
        const { data: { user } } = await supabase.auth.getUser()

        if (!user) throw new Error("Unauthorized")

        const fullName = formData.get("full_name") as string
        const companyName = formData.get("company_name") as string

        const { error } = await supabase
            .from("profiles")
            .update({
                full_name: fullName,
                company_name: companyName,
                updated_at: new Date().toISOString()
            })
            .eq("id", user.id)

        if (error) {
            throw new Error(error.message)
        }

        redirect("/dashboard/profile?updated=true")
    }

    return (
        <div className="flex flex-col gap-6 max-w-3xl mx-auto">
            <h1 className="text-3xl font-bold tracking-tight">Profile Settings</h1>

            <Card>
                <CardHeader>
                    <CardTitle>Account Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="grid gap-2">
                        <Label className="flex items-center gap-2">
                            <Mail className="h-4 w-4" />
                            Email Address
                        </Label>
                        <Input
                            value={user.email || ""}
                            disabled
                            className="bg-muted"
                        />
                        <p className="text-xs text-muted-foreground">
                            Email cannot be changed
                        </p>
                    </div>

                    <div className="grid gap-2">
                        <Label className="flex items-center gap-2">
                            <Shield className="h-4 w-4" />
                            Role
                        </Label>
                        <Input
                            value={profile?.role || "N/A"}
                            disabled
                            className="bg-muted capitalize"
                        />
                    </div>

                    <div className="grid gap-2">
                        <Label className="flex items-center gap-2">
                            <Shield className="h-4 w-4" />
                            Verification Status
                        </Label>
                        <Input
                            value={profile?.verification_status || "pending"}
                            disabled
                            className="bg-muted capitalize"
                        />
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Personal Information</CardTitle>
                </CardHeader>
                <CardContent>
                    <form action={updateProfile} className="space-y-4">
                        <div className="grid gap-2">
                            <Label htmlFor="full_name" className="flex items-center gap-2">
                                <User className="h-4 w-4" />
                                Full Name
                            </Label>
                            <Input
                                id="full_name"
                                name="full_name"
                                defaultValue={profile?.full_name || ""}
                                placeholder="Enter your full name"
                                required
                            />
                        </div>

                        {profile?.role === "lender" && (
                            <div className="grid gap-2">
                                <Label htmlFor="company_name" className="flex items-center gap-2">
                                    <Building2 className="h-4 w-4" />
                                    Company Name
                                </Label>
                                <Input
                                    id="company_name"
                                    name="company_name"
                                    defaultValue={profile?.company_name || ""}
                                    placeholder="Enter your company name"
                                />
                            </div>
                        )}

                        <Button type="submit" className="w-full">
                            Save Changes
                        </Button>
                    </form>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Account Details</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 text-sm">
                    <div className="flex justify-between">
                        <span className="text-muted-foreground">Account Created</span>
                        <span className="font-medium">
                            {new Date(profile?.created_at || "").toLocaleDateString()}
                        </span>
                    </div>
                    <div className="flex justify-between">
                        <span className="text-muted-foreground">Last Updated</span>
                        <span className="font-medium">
                            {new Date(profile?.updated_at || "").toLocaleDateString()}
                        </span>
                    </div>
                    {profile?.role === "investor" && (
                        <div className="flex justify-between">
                            <span className="text-muted-foreground">Accreditation Status</span>
                            <span className="font-medium">
                                {profile?.accreditation_status ? "Accredited" : "Not Accredited"}
                            </span>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    )
}
