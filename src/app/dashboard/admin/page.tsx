"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
    Users,
    FileText,
    DollarSign,
    TrendingUp,
    AlertCircle,
    CheckCircle,
    XCircle,
    Building2,
    Clock,
    Bell,
    Mail,
    MailOpen,
    Trash2
} from "lucide-react"

export default function AdminDashboardPage() {
    const [activeTab, setActiveTab] = useState("overview")
    const [deals, setDeals] = useState<any[]>([])
    const [users, setUsers] = useState<any[]>([])
    const [investments, setInvestments] = useState<any[]>([])
    const [repayments, setRepayments] = useState<any[]>([])
    const [deposits, setDeposits] = useState<any[]>([])
    const [withdrawals, setWithdrawals] = useState<any[]>([])
    const [notifications, setNotifications] = useState<any[]>([])
    const [loading, setLoading] = useState(true)

    const supabase = createClient()

    useEffect(() => {
        loadData()
    }, [])

    const loadData = async () => {
        try {
            setLoading(true)

            // Load all deals
            const { data: dealsData } = await supabase
                .from("deals")
                .select("*, profiles(full_name, company_name)")
                .order("created_at", { ascending: false })
            setDeals(dealsData || [])

            // Load pending users
            const { data: usersData } = await supabase
                .from("profiles")
                .select("*")
                .order("created_at", { ascending: false })
            setUsers(usersData || [])

            // Load pending investments
            const { data: investmentsData } = await supabase
                .from("pending_transactions")
                .select("*, deals(title, loan_amount)")
                .eq("type", "investment")
                .order("created_at", { ascending: false })

            // Enrich with user profiles
            if (investmentsData) {
                const enrichedInvestments = await Promise.all(
                    investmentsData.map(async (inv) => {
                        const { data: profile } = await supabase
                            .from("profiles")
                            .select("full_name, email")
                            .eq("id", inv.user_id)
                            .single()
                        return { ...inv, profile }
                    })
                )
                setInvestments(enrichedInvestments)
            } else {
                setInvestments([])
            }

            // Load pending repayments (from pending_transactions with type='repayment')
            const { data: repaymentsData } = await supabase
                .from("pending_transactions")
                .select("*, deals(title)")
                .eq("type", "repayment")
                .order("created_at", { ascending: false })

            // Enrich repayments with user profiles
            if (repaymentsData) {
                const enrichedRepayments = await Promise.all(
                    repaymentsData.map(async (rep) => {
                        const { data: profile } = await supabase
                            .from("profiles")
                            .select("full_name, company_name, email")
                            .eq("id", rep.user_id)
                            .single()
                        return { ...rep, profile }
                    })
                )
                setRepayments(enrichedRepayments)
            } else {
                setRepayments([])
            }

            // Load deposits from transactions table
            const { data: depositsData } = await supabase
                .from("transactions")
                .select("*")
                .eq("type", "deposit")
                .eq("status", "pending")
                .order("created_at", { ascending: false })

            // Enrich deposits with user profiles
            if (depositsData) {
                const enrichedDeposits = await Promise.all(
                    depositsData.map(async (dep) => {
                        const { data: profile } = await supabase
                            .from("profiles")
                            .select("full_name, email")
                            .eq("id", dep.user_id)
                            .single()
                        return { ...dep, profile }
                    })
                )
                setDeposits(enrichedDeposits)
            } else {
                setDeposits([])
            }

            // Load withdrawals from transactions table
            const { data: withdrawalsData } = await supabase
                .from("transactions")
                .select("*")
                .eq("type", "withdrawal")
                .eq("status", "pending")
                .order("created_at", { ascending: false })

            // Enrich withdrawals with user profiles
            if (withdrawalsData) {
                const enrichedWithdrawals = await Promise.all(
                    withdrawalsData.map(async (wd) => {
                        const { data: profile } = await supabase
                            .from("profiles")
                            .select("full_name, email")
                            .eq("id", wd.user_id)
                            .single()
                        return { ...wd, profile }
                    })
                )
                setWithdrawals(enrichedWithdrawals)
            } else {
                setWithdrawals([])
            }

            // Load notifications (table may not exist yet)
            const { data: notificationsData, error: notificationsError } = await supabase
                .from("notifications")
                .select("*")
                .order("created_at", { ascending: false })

            if (!notificationsError) {
                setNotifications(notificationsData || [])
            } else {
                // Table doesn't exist yet, just set empty array
                setNotifications([])
            }

        } catch (error) {
            console.error("Error loading data:", error)
        } finally {
            setLoading(false)
        }
    }

    const handleApproveDeal = async (dealId: string) => {
        try {
            const { error } = await supabase
                .from("deals")
                .update({ status: "approved" })
                .eq("id", dealId)
            if (error) throw error
            loadData()
        } catch (error) {
            console.error("Error approving deal:", error)
        }
    }

    const handleRejectDeal = async (dealId: string) => {
        try {
            const { error } = await supabase
                .from("deals")
                .update({ status: "rejected" })
                .eq("id", dealId)
            if (error) throw error
            loadData()
        } catch (error) {
            console.error("Error rejecting deal:", error)
        }
    }

    const handleFundDeal = async (dealId: string) => {
        try {
            const { error } = await supabase
                .from("deals")
                .update({ status: "funded" })
                .eq("id", dealId)
            if (error) throw error
            loadData()
        } catch (error) {
            console.error("Error funding deal:", error)
        }
    }

    const handleVerifyUser = async (userId: string) => {
        try {
            const { error } = await supabase
                .from("profiles")
                .update({ verification_status: "verified" })
                .eq("id", userId)
            if (error) throw error
            loadData()
        } catch (error) {
            console.error("Error verifying user:", error)
        }
    }

    const handleRejectUser = async (userId: string) => {
        try {
            const { error } = await supabase
                .from("profiles")
                .update({ verification_status: "rejected" })
                .eq("id", userId)
            if (error) throw error
            loadData()
        } catch (error) {
            console.error("Error rejecting user:", error)
        }
    }

    const handleApproveTransaction = async (transactionId: string, transactionType: "deposit" | "withdrawal") => {
        try {
            // Find the transaction to get user_id and amount
            const transaction = transactionType === "deposit"
                ? deposits.find(d => d.id === transactionId)
                : withdrawals.find(w => w.id === transactionId)

            if (!transaction) {
                console.error("Transaction not found")
                return
            }

            const { user_id, amount } = transaction

            // Get user's current wallet balance
            const { data: wallet, error: walletError } = await supabase
                .from("wallets")
                .select("balance")
                .eq("user_id", user_id)
                .single()

            if (walletError) {
                console.error("Wallet not found:", walletError)
                // If wallet doesn't exist, create one for deposits
                if (transactionType === "deposit") {
                    const { error: createWalletError } = await supabase
                        .from("wallets")
                        .insert({ user_id: user_id, balance: Math.abs(amount) })

                    if (createWalletError) {
                        console.error("Error creating wallet:", createWalletError)
                        alert("Failed to create wallet for user")
                        return
                    }
                } else {
                    alert("User wallet not found")
                    return
                }
            } else {
                // Update wallet balance
                const currentBalance = wallet?.balance || 0
                let newBalance: number

                if (transactionType === "deposit") {
                    newBalance = currentBalance + Math.abs(amount)
                } else {
                    // For withdrawals, check if user has sufficient balance
                    const withdrawAmount = Math.abs(amount)
                    if (currentBalance < withdrawAmount) {
                        alert("User has insufficient balance for this withdrawal")
                        return
                    }
                    newBalance = currentBalance - withdrawAmount
                }

                const { error: updateWalletError } = await supabase
                    .from("wallets")
                    .update({ balance: newBalance })
                    .eq("user_id", user_id)

                if (updateWalletError) {
                    console.error("Error updating wallet:", updateWalletError)
                    throw updateWalletError
                }
            }

            // Update transaction status to completed
            const { error } = await supabase
                .from("transactions")
                .update({ status: "completed" })
                .eq("id", transactionId)

            if (error) throw error

            alert(`${transactionType === "deposit" ? "Deposit" : "Withdrawal"} approved successfully!`)
            loadData()
        } catch (error) {
            console.error("Error approving transaction:", error)
            alert("Failed to approve transaction. Please try again.")
        }
    }

    const handleRejectTransaction = async (transactionId: string) => {
        try {
            const { error } = await supabase
                .from("transactions")
                .update({ status: "failed" })
                .eq("id", transactionId)
            if (error) throw error
            loadData()
        } catch (error) {
            console.error("Error rejecting transaction:", error)
        }
    }

    const handleApproveInvestment = async (investmentId: string) => {
        try {
            // Get the pending investment details
            const investment = investments.find(i => i.id === investmentId)
            if (!investment) {
                console.error("Investment not found")
                return
            }

            const { user_id, deal_id, amount } = investment

            // Get the deal to find the lender_id
            const { data: deal, error: dealError } = await supabase
                .from("deals")
                .select("lender_id")
                .eq("id", deal_id)
                .single()

            if (dealError || !deal) {
                console.error("Deal not found:", dealError)
                return
            }

            // Get investor's current wallet balance
            const { data: investorWallet, error: walletError } = await supabase
                .from("wallets")
                .select("balance")
                .eq("user_id", user_id)
                .single()

            if (walletError || !investorWallet) {
                console.error("Investor wallet not found:", walletError)
                alert("Investor wallet not found")
                return
            }

            // Check if investor has sufficient balance
            if (investorWallet.balance < amount) {
                alert("Investor has insufficient balance for this investment")
                return
            }

            // 1. Deduct from investor's wallet
            const { error: deductError } = await supabase
                .from("wallets")
                .update({ balance: investorWallet.balance - amount })
                .eq("user_id", user_id)

            if (deductError) {
                console.error("Error deducting from wallet:", deductError)
                throw deductError
            }

            // 2. Create investment record
            const { error: investmentError } = await supabase
                .from("investments")
                .insert({
                    investor_id: user_id,
                    deal_id: deal_id,
                    amount: amount,
                    status: "completed"
                })

            if (investmentError) {
                console.error("Error creating investment:", investmentError)
                // Rollback wallet deduction
                await supabase
                    .from("wallets")
                    .update({ balance: investorWallet.balance })
                    .eq("user_id", user_id)
                throw investmentError
            }

            // 3. Create transaction record for the investor
            const { error: transactionError } = await supabase
                .from("transactions")
                .insert({
                    user_id: user_id,
                    type: "investment",
                    amount: -amount,
                    status: "completed",
                    reference_id: deal_id
                })

            if (transactionError) {
                console.error("Error creating transaction:", transactionError)
                // Continue anyway, transaction record is for history
            }

            // 4. Add funds to lender's wallet
            const { data: lenderWallet } = await supabase
                .from("wallets")
                .select("balance")
                .eq("user_id", deal.lender_id)
                .single()

            if (lenderWallet) {
                // Update existing wallet
                const { error: lenderWalletError } = await supabase
                    .from("wallets")
                    .update({ balance: lenderWallet.balance + amount, updated_at: new Date().toISOString() })
                    .eq("user_id", deal.lender_id)

                if (lenderWalletError) {
                    console.error("Error adding to lender wallet:", lenderWalletError)
                }
            } else {
                // Create wallet for lender if doesn't exist
                const { error: createWalletError } = await supabase
                    .from("wallets")
                    .insert({ user_id: deal.lender_id, balance: amount })

                if (createWalletError) {
                    console.error("Error creating lender wallet:", createWalletError)
                }
            }

            // 5. Create transaction record for the lender (inflow)
            const { error: lenderTransactionError } = await supabase
                .from("transactions")
                .insert({
                    user_id: deal.lender_id,
                    type: "investment",
                    amount: amount,
                    status: "completed",
                    reference_id: deal_id
                })

            if (lenderTransactionError) {
                console.error("Error creating lender transaction:", lenderTransactionError)
            }

            // 6. Check if deal is fully funded and update status
            const { data: totalInvestments } = await supabase
                .from("investments")
                .select("amount")
                .eq("deal_id", deal_id)
                .eq("status", "completed")

            const totalInvested = totalInvestments?.reduce((sum, inv) => sum + (inv.amount || 0), 0) || 0

            const { data: dealInfo } = await supabase
                .from("deals")
                .select("loan_amount")
                .eq("id", deal_id)
                .single()

            if (dealInfo && totalInvested >= dealInfo.loan_amount) {
                await supabase
                    .from("deals")
                    .update({ status: "funded", updated_at: new Date().toISOString() })
                    .eq("id", deal_id)
            }

            // 7. Update pending_transaction status to approved
            const { error: updateError } = await supabase
                .from("pending_transactions")
                .update({ status: "approved" })
                .eq("id", investmentId)

            if (updateError) {
                console.error("Error updating pending transaction:", updateError)
            }

            alert("Investment approved successfully! Funds transferred from investor to lender wallet.")
            loadData()
        } catch (error) {
            console.error("Error approving investment:", error)
            alert("Failed to approve investment. Please try again.")
        }
    }

    const handleRejectInvestment = async (investmentId: string) => {
        try {
            const { error } = await supabase
                .from("pending_transactions")
                .update({ status: "rejected" })
                .eq("id", investmentId)
            if (error) throw error
            loadData()
        } catch (error) {
            console.error("Error rejecting investment:", error)
        }
    }

    const handleApproveRepayment = async (repaymentId: string) => {
        try {
            // Get the pending repayment details
            const repayment = repayments.find(r => r.id === repaymentId)
            if (!repayment) {
                console.error("Repayment not found")
                return
            }

            const { user_id: lender_id, deal_id, amount } = repayment

            // Get lender's current wallet balance
            const { data: lenderWallet, error: lenderWalletError } = await supabase
                .from("wallets")
                .select("balance")
                .eq("user_id", lender_id)
                .single()

            if (lenderWalletError || !lenderWallet) {
                console.error("Lender wallet not found:", lenderWalletError)
                alert("Lender wallet not found")
                return
            }

            // Check if lender has sufficient balance
            if (lenderWallet.balance < amount) {
                alert("Lender has insufficient balance for this repayment")
                return
            }

            // Get all investors who invested in this deal
            const { data: investmentsData, error: investmentsError } = await supabase
                .from("investments")
                .select("investor_id, amount")
                .eq("deal_id", deal_id)
                .eq("status", "completed")

            if (investmentsError) {
                console.error("Error fetching investments:", investmentsError)
                alert("Failed to fetch investments for this deal")
                return
            }

            if (!investmentsData || investmentsData.length === 0) {
                alert("No investments found for this deal")
                return
            }

            // Calculate total invested to determine each investor's share
            const totalInvested = investmentsData.reduce((sum, inv) => sum + Number(inv.amount), 0)

            // 1. Deduct from lender's wallet
            const { error: deductError } = await supabase
                .from("wallets")
                .update({ balance: lenderWallet.balance - amount })
                .eq("user_id", lender_id)

            if (deductError) {
                console.error("Error deducting from lender wallet:", deductError)
                throw deductError
            }

            // 2. Distribute to each investor proportionally
            for (const investment of investmentsData) {
                const investorShare = (Number(investment.amount) / totalInvested) * amount

                // Get investor's current wallet
                const { data: investorWallet } = await supabase
                    .from("wallets")
                    .select("balance")
                    .eq("user_id", investment.investor_id)
                    .single()

                if (investorWallet) {
                    // Add to investor's wallet
                    await supabase
                        .from("wallets")
                        .update({ balance: investorWallet.balance + investorShare })
                        .eq("user_id", investment.investor_id)

                    // Create transaction record for investor
                    await supabase
                        .from("transactions")
                        .insert({
                            user_id: investment.investor_id,
                            type: "repayment",
                            amount: investorShare,
                            status: "completed",
                            reference_id: deal_id
                        })
                }
            }

            // 3. Create transaction record for lender (outflow)
            await supabase
                .from("transactions")
                .insert({
                    user_id: lender_id,
                    type: "repayment",
                    amount: -amount,
                    status: "completed",
                    reference_id: deal_id
                })

            // 4. Update deal status to repaid
            await supabase
                .from("deals")
                .update({ status: "repaid" })
                .eq("id", deal_id)

            // 5. Update pending_transaction status to approved
            const { error: updateError } = await supabase
                .from("pending_transactions")
                .update({ status: "approved" })
                .eq("id", repaymentId)

            if (updateError) {
                console.error("Error updating pending transaction:", updateError)
            }

            alert("Repayment approved! Funds have been distributed to investors.")
            loadData()
        } catch (error) {
            console.error("Error approving repayment:", error)
            alert("Failed to approve repayment. Please try again.")
        }
    }

    const handleRejectRepayment = async (repaymentId: string) => {
        try {
            const { error } = await supabase
                .from("pending_transactions")
                .update({ status: "rejected" })
                .eq("id", repaymentId)
            if (error) throw error
            loadData()
        } catch (error) {
            console.error("Error rejecting repayment:", error)
        }
    }

    const handleMarkNotificationRead = async (notificationId: string) => {
        try {
            const { error } = await supabase
                .from("notifications")
                .update({ read: true })
                .eq("id", notificationId)
            if (error) throw error
            loadData()
        } catch (error) {
            console.error("Error marking notification as read:", error)
        }
    }

    const handleMarkAllNotificationsRead = async () => {
        try {
            const { error } = await supabase
                .from("notifications")
                .update({ read: true })
                .eq("read", false)
            if (error) throw error
            loadData()
        } catch (error) {
            console.error("Error marking all notifications as read:", error)
        }
    }

    const handleDeleteNotification = async (notificationId: string) => {
        try {
            const { error } = await supabase
                .from("notifications")
                .delete()
                .eq("id", notificationId)
            if (error) throw error
            loadData()
        } catch (error) {
            console.error("Error deleting notification:", error)
        }
    }

    const pendingDeals = deals.filter(d => d.status === "submitted")
    const approvedDeals = deals.filter(d => d.status === "approved")
    const fundedDeals = deals.filter(d => d.status === "funded" || d.status === "active")
    const pendingUsers = users.filter(u => u.verification_status === "pending")
    const investors = users.filter(u => u.role === "investor")
    const lenders = users.filter(u => u.role === "lender")
    const pendingInvestments = investments.filter(i => i.status === "pending")
    const pendingRepayments = repayments.filter(r => r.status === "pending")
    const pendingDeposits = deposits.filter(d => d.status === "pending")
    const pendingWithdrawals = withdrawals.filter(w => w.status === "pending")
    const unreadNotifications = notifications.filter(n => !n.read)

    const totalFunded = fundedDeals.reduce((sum, d) => sum + (d.loan_amount || 0), 0)

    const getStatusBadge = (status: string) => {
        const variants: Record<string, string> = {
            pending: "bg-yellow-100 text-yellow-800",
            submitted: "bg-yellow-100 text-yellow-800",
            approved: "bg-green-100 text-green-800",
            verified: "bg-green-100 text-green-800",
            active: "bg-blue-100 text-blue-800",
            funded: "bg-blue-100 text-blue-800",
            completed: "bg-gray-100 text-gray-800",
            rejected: "bg-red-100 text-red-800",
            denied: "bg-red-100 text-red-800",
        }
        return (
            <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${variants[status] || "bg-gray-100 text-gray-800"}`}>
                {status}
            </span>
        )
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                    <p className="mt-4 text-gray-600">Loading admin dashboard...</p>
                </div>
            </div>
        )
    }

    return (
        <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="mb-8 flex-wrap h-auto">
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="deals">
                    Deals {pendingDeals.length > 0 && <span className="ml-2 bg-orange-500 text-white rounded-full px-2 py-0.5 text-xs">{pendingDeals.length}</span>}
                </TabsTrigger>
                <TabsTrigger value="investments">
                    Investments {pendingInvestments.length > 0 && <span className="ml-2 bg-orange-500 text-white rounded-full px-2 py-0.5 text-xs">{pendingInvestments.length}</span>}
                </TabsTrigger>
                <TabsTrigger value="users">
                    Users {pendingUsers.length > 0 && <span className="ml-2 bg-orange-500 text-white rounded-full px-2 py-0.5 text-xs">{pendingUsers.length}</span>}
                </TabsTrigger>
                <TabsTrigger value="deposits">
                    Deposits {pendingDeposits.length > 0 && <span className="ml-2 bg-orange-500 text-white rounded-full px-2 py-0.5 text-xs">{pendingDeposits.length}</span>}
                </TabsTrigger>
                <TabsTrigger value="withdrawals">
                    Withdrawals {pendingWithdrawals.length > 0 && <span className="ml-2 bg-orange-500 text-white rounded-full px-2 py-0.5 text-xs">{pendingWithdrawals.length}</span>}
                </TabsTrigger>
                <TabsTrigger value="repayments">
                    Repayments {pendingRepayments.length > 0 && <span className="ml-2 bg-orange-500 text-white rounded-full px-2 py-0.5 text-xs">{pendingRepayments.length}</span>}
                </TabsTrigger>
                <TabsTrigger value="notifications">
                    <Bell className="size-4 mr-1" />
                    Notifications {unreadNotifications.length > 0 && <span className="ml-2 bg-blue-500 text-white rounded-full px-2 py-0.5 text-xs">{unreadNotifications.length}</span>}
                </TabsTrigger>
            </TabsList>

            {/* Overview Tab */}
            <TabsContent value="overview" className="space-y-6">
                {/* Stats */}
                <div className="grid gap-6 md:grid-cols-4">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Total Investors</CardTitle>
                            <Users className="size-4 text-gray-600" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{investors.length}</div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Total Lenders</CardTitle>
                            <Building2 className="size-4 text-gray-600" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{lenders.length}</div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Active Deals</CardTitle>
                            <FileText className="size-4 text-green-600" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-green-600">{fundedDeals.length}</div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Total Funded</CardTitle>
                            <DollarSign className="size-4 text-blue-600" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-blue-600">${totalFunded.toLocaleString()}</div>
                        </CardContent>
                    </Card>
                </div>

                {/* Pending Actions */}
                <Card>
                    <CardHeader>
                        <CardTitle>Pending Actions</CardTitle>
                        <CardDescription>Items requiring admin approval</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-3">
                            <div className="flex items-center justify-between p-3 border rounded-lg">
                                <div className="flex items-center gap-3">
                                    <AlertCircle className="size-5 text-orange-600" />
                                    <div>
                                        <p className="font-medium">Pending Deals</p>
                                        <p className="text-sm text-gray-600">New deal submissions for review</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3">
                                    <span className="text-lg font-bold">{pendingDeals.length}</span>
                                    <Button size="sm" onClick={() => setActiveTab("deals")}>Review</Button>
                                </div>
                            </div>

                            <div className="flex items-center justify-between p-3 border rounded-lg">
                                <div className="flex items-center gap-3">
                                    <AlertCircle className="size-5 text-orange-600" />
                                    <div>
                                        <p className="font-medium">Pending Investments</p>
                                        <p className="text-sm text-gray-600">Investor capital allocations</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3">
                                    <span className="text-lg font-bold">{pendingInvestments.length}</span>
                                    <Button size="sm" onClick={() => setActiveTab("investments")}>Review</Button>
                                </div>
                            </div>

                            <div className="flex items-center justify-between p-3 border rounded-lg">
                                <div className="flex items-center gap-3">
                                    <AlertCircle className="size-5 text-orange-600" />
                                    <div>
                                        <p className="font-medium">Pending Users</p>
                                        <p className="text-sm text-gray-600">Users awaiting verification</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3">
                                    <span className="text-lg font-bold">{pendingUsers.length}</span>
                                    <Button size="sm" onClick={() => setActiveTab("users")}>Review</Button>
                                </div>
                            </div>

                            <div className="flex items-center justify-between p-3 border rounded-lg">
                                <div className="flex items-center gap-3">
                                    <AlertCircle className="size-5 text-orange-600" />
                                    <div>
                                        <p className="font-medium">Pending Deposits</p>
                                        <p className="text-sm text-gray-600">Investor deposit requests</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3">
                                    <span className="text-lg font-bold">{pendingDeposits.length}</span>
                                    <Button size="sm" onClick={() => setActiveTab("deposits")}>Review</Button>
                                </div>
                            </div>

                            <div className="flex items-center justify-between p-3 border rounded-lg">
                                <div className="flex items-center gap-3">
                                    <AlertCircle className="size-5 text-orange-600" />
                                    <div>
                                        <p className="font-medium">Pending Withdrawals</p>
                                        <p className="text-sm text-gray-600">Investor withdrawal requests</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3">
                                    <span className="text-lg font-bold">{pendingWithdrawals.length}</span>
                                    <Button size="sm" onClick={() => setActiveTab("withdrawals")}>Review</Button>
                                </div>
                            </div>

                            <div className="flex items-center justify-between p-3 border rounded-lg">
                                <div className="flex items-center gap-3">
                                    <AlertCircle className="size-5 text-orange-600" />
                                    <div>
                                        <p className="font-medium">Pending Repayments</p>
                                        <p className="text-sm text-gray-600">Lender payment submissions</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3">
                                    <span className="text-lg font-bold">{pendingRepayments.length}</span>
                                    <Button size="sm" onClick={() => setActiveTab("repayments")}>Review</Button>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </TabsContent>

            {/* Deals Tab */}
            <TabsContent value="deals" className="space-y-6">
                <Card>
                    <CardHeader>
                        <CardTitle>Deal Management</CardTitle>
                        <CardDescription>Review and manage all deal submissions</CardDescription>
                    </CardHeader>
                    <CardContent>
                        {deals.length > 0 ? (
                            <div className="relative w-full overflow-auto">
                                <table className="w-full caption-bottom text-sm">
                                    <thead>
                                        <tr className="border-b">
                                            <th className="h-12 px-4 text-left align-middle font-medium text-gray-500">Deal</th>
                                            <th className="h-12 px-4 text-left align-middle font-medium text-gray-500">Lender</th>
                                            <th className="h-12 px-4 text-left align-middle font-medium text-gray-500">Loan Amount</th>
                                            <th className="h-12 px-4 text-left align-middle font-medium text-gray-500">Interest</th>
                                            <th className="h-12 px-4 text-left align-middle font-medium text-gray-500">LTV</th>
                                            <th className="h-12 px-4 text-left align-middle font-medium text-gray-500">Status</th>
                                            <th className="h-12 px-4 text-left align-middle font-medium text-gray-500">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {deals.map((deal) => (
                                            <tr key={deal.id} className="border-b hover:bg-gray-50">
                                                <td className="p-4 align-middle">
                                                    <div>
                                                        <p className="font-medium">{deal.title}</p>
                                                        <p className="text-xs text-gray-600">{deal.property_location}</p>
                                                    </div>
                                                </td>
                                                <td className="p-4 align-middle">{deal.profiles?.company_name || deal.profiles?.full_name || "Unknown"}</td>
                                                <td className="p-4 align-middle">${deal.loan_amount?.toLocaleString()}</td>
                                                <td className="p-4 align-middle">{deal.interest_rate}%</td>
                                                <td className="p-4 align-middle">{deal.ltv}%</td>
                                                <td className="p-4 align-middle">{getStatusBadge(deal.status)}</td>
                                                <td className="p-4 align-middle">
                                                    <div className="flex gap-2">
                                                        {deal.status === "submitted" && (
                                                            <>
                                                                <Button size="sm" onClick={() => handleApproveDeal(deal.id)}>
                                                                    <CheckCircle className="mr-1 size-3" />
                                                                    Approve
                                                                </Button>
                                                                <Button size="sm" variant="destructive" onClick={() => handleRejectDeal(deal.id)}>
                                                                    <XCircle className="mr-1 size-3" />
                                                                    Reject
                                                                </Button>
                                                            </>
                                                        )}
                                                        {deal.status === "approved" && (
                                                            <Button size="sm" onClick={() => handleFundDeal(deal.id)}>
                                                                <DollarSign className="mr-1 size-3" />
                                                                Fund Deal
                                                            </Button>
                                                        )}
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        ) : (
                            <p className="text-center text-gray-600 py-8">No deals found</p>
                        )}
                    </CardContent>
                </Card>
            </TabsContent>

            {/* Investments Tab */}
            <TabsContent value="investments" className="space-y-6">
                <Card>
                    <CardHeader>
                        <CardTitle>Investment Management</CardTitle>
                        <CardDescription>Review and approve investor capital allocations</CardDescription>
                    </CardHeader>
                    <CardContent>
                        {investments.length > 0 ? (
                            <div className="relative w-full overflow-auto">
                                <table className="w-full caption-bottom text-sm">
                                    <thead>
                                        <tr className="border-b">
                                            <th className="h-12 px-4 text-left align-middle font-medium text-gray-500">Date</th>
                                            <th className="h-12 px-4 text-left align-middle font-medium text-gray-500">Investor</th>
                                            <th className="h-12 px-4 text-left align-middle font-medium text-gray-500">Deal</th>
                                            <th className="h-12 px-4 text-left align-middle font-medium text-gray-500">Amount</th>
                                            <th className="h-12 px-4 text-left align-middle font-medium text-gray-500">Status</th>
                                            <th className="h-12 px-4 text-left align-middle font-medium text-gray-500">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {investments.map((inv) => (
                                            <tr key={inv.id} className="border-b hover:bg-gray-50">
                                                <td className="p-4 align-middle text-sm">{new Date(inv.created_at).toLocaleDateString()}</td>
                                                <td className="p-4 align-middle font-medium">{inv.profile?.full_name || inv.profile?.email || "Unknown"}</td>
                                                <td className="p-4 align-middle">{inv.deals?.title || "Unknown Deal"}</td>
                                                <td className="p-4 align-middle text-blue-600 font-medium">${(inv.amount || 0).toLocaleString()}</td>
                                                <td className="p-4 align-middle">{getStatusBadge(inv.status)}</td>
                                                <td className="p-4 align-middle">
                                                    {inv.status === "pending" && (
                                                        <div className="flex gap-2">
                                                            <Button size="sm" onClick={() => handleApproveInvestment(inv.id)}>
                                                                <CheckCircle className="mr-1 size-3" />
                                                                Approve
                                                            </Button>
                                                            <Button size="sm" variant="destructive" onClick={() => handleRejectInvestment(inv.id)}>
                                                                <XCircle className="mr-1 size-3" />
                                                                Reject
                                                            </Button>
                                                        </div>
                                                    )}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        ) : (
                            <p className="text-center text-gray-600 py-8">No investment requests found</p>
                        )}
                    </CardContent>
                </Card>
            </TabsContent>

            {/* Users Tab */}
            <TabsContent value="users" className="space-y-6">
                <Card>
                    <CardHeader>
                        <CardTitle>User Management</CardTitle>
                        <CardDescription>Review and verify user accounts</CardDescription>
                    </CardHeader>
                    <CardContent>
                        {users.length > 0 ? (
                            <div className="relative w-full overflow-auto">
                                <table className="w-full caption-bottom text-sm">
                                    <thead>
                                        <tr className="border-b">
                                            <th className="h-12 px-4 text-left align-middle font-medium text-gray-500">Name</th>
                                            <th className="h-12 px-4 text-left align-middle font-medium text-gray-500">Role</th>
                                            <th className="h-12 px-4 text-left align-middle font-medium text-gray-500">Company</th>
                                            <th className="h-12 px-4 text-left align-middle font-medium text-gray-500">Date</th>
                                            <th className="h-12 px-4 text-left align-middle font-medium text-gray-500">Status</th>
                                            <th className="h-12 px-4 text-left align-middle font-medium text-gray-500">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {users.map((user) => (
                                            <tr key={user.id} className="border-b hover:bg-gray-50">
                                                <td className="p-4 align-middle font-medium">{user.full_name || "N/A"}</td>
                                                <td className="p-4 align-middle capitalize">{user.role}</td>
                                                <td className="p-4 align-middle">{user.company_name || "-"}</td>
                                                <td className="p-4 align-middle text-sm text-gray-600">{new Date(user.created_at).toLocaleDateString()}</td>
                                                <td className="p-4 align-middle">{getStatusBadge(user.verification_status || "pending")}</td>
                                                <td className="p-4 align-middle">
                                                    {user.verification_status === "pending" && (
                                                        <div className="flex gap-2">
                                                            <Button size="sm" onClick={() => handleVerifyUser(user.id)}>
                                                                <CheckCircle className="mr-1 size-3" />
                                                                Verify
                                                            </Button>
                                                            <Button size="sm" variant="destructive" onClick={() => handleRejectUser(user.id)}>
                                                                <XCircle className="mr-1 size-3" />
                                                                Reject
                                                            </Button>
                                                        </div>
                                                    )}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        ) : (
                            <p className="text-center text-gray-600 py-8">No users found</p>
                        )}
                    </CardContent>
                </Card>
            </TabsContent>

            {/* Deposits Tab */}
            <TabsContent value="deposits" className="space-y-6">
                <Card>
                    <CardHeader>
                        <CardTitle>Deposit Management</CardTitle>
                        <CardDescription>Review and approve investor deposits</CardDescription>
                    </CardHeader>
                    <CardContent>
                        {deposits.length > 0 ? (
                            <div className="relative w-full overflow-auto">
                                <table className="w-full caption-bottom text-sm">
                                    <thead>
                                        <tr className="border-b">
                                            <th className="h-12 px-4 text-left align-middle font-medium text-gray-500">Date</th>
                                            <th className="h-12 px-4 text-left align-middle font-medium text-gray-500">Investor</th>
                                            <th className="h-12 px-4 text-left align-middle font-medium text-gray-500">Amount</th>
                                            <th className="h-12 px-4 text-left align-middle font-medium text-gray-500">Status</th>
                                            <th className="h-12 px-4 text-left align-middle font-medium text-gray-500">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {deposits.map((deposit) => (
                                            <tr key={deposit.id} className="border-b hover:bg-gray-50">
                                                <td className="p-4 align-middle text-sm">{new Date(deposit.created_at).toLocaleDateString()}</td>
                                                <td className="p-4 align-middle font-medium">{deposit.profile?.full_name || deposit.profile?.email || "Unknown"}</td>
                                                <td className="p-4 align-middle text-green-600">${(deposit.amount || 0).toLocaleString()}</td>
                                                <td className="p-4 align-middle">{getStatusBadge(deposit.status)}</td>
                                                <td className="p-4 align-middle">
                                                    {deposit.status === "pending" && (
                                                        <div className="flex gap-2">
                                                            <Button size="sm" onClick={() => handleApproveTransaction(deposit.id, "deposit")}>
                                                                Approve
                                                            </Button>
                                                            <Button size="sm" variant="destructive" onClick={() => handleRejectTransaction(deposit.id)}>
                                                                Reject
                                                            </Button>
                                                        </div>
                                                    )}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        ) : (
                            <p className="text-center text-gray-600 py-8">No deposits found</p>
                        )}
                    </CardContent>
                </Card>
            </TabsContent>

            {/* Withdrawals Tab */}
            <TabsContent value="withdrawals" className="space-y-6">
                <Card>
                    <CardHeader>
                        <CardTitle>Withdrawal Management</CardTitle>
                        <CardDescription>Review and approve investor withdrawals</CardDescription>
                    </CardHeader>
                    <CardContent>
                        {withdrawals.length > 0 ? (
                            <div className="relative w-full overflow-auto">
                                <table className="w-full caption-bottom text-sm">
                                    <thead>
                                        <tr className="border-b">
                                            <th className="h-12 px-4 text-left align-middle font-medium text-gray-500">Date</th>
                                            <th className="h-12 px-4 text-left align-middle font-medium text-gray-500">Investor</th>
                                            <th className="h-12 px-4 text-left align-middle font-medium text-gray-500">Amount</th>
                                            <th className="h-12 px-4 text-left align-middle font-medium text-gray-500">Status</th>
                                            <th className="h-12 px-4 text-left align-middle font-medium text-gray-500">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {withdrawals.map((withdrawal) => (
                                            <tr key={withdrawal.id} className="border-b hover:bg-gray-50">
                                                <td className="p-4 align-middle text-sm">{new Date(withdrawal.created_at).toLocaleDateString()}</td>
                                                <td className="p-4 align-middle font-medium">{withdrawal.profile?.full_name || withdrawal.profile?.email || "Unknown"}</td>
                                                <td className="p-4 align-middle text-red-600">${(withdrawal.amount || 0).toLocaleString()}</td>
                                                <td className="p-4 align-middle">{getStatusBadge(withdrawal.status)}</td>
                                                <td className="p-4 align-middle">
                                                    {withdrawal.status === "pending" && (
                                                        <div className="flex gap-2">
                                                            <Button size="sm" onClick={() => handleApproveTransaction(withdrawal.id, "withdrawal")}>
                                                                Approve
                                                            </Button>
                                                            <Button size="sm" variant="destructive" onClick={() => handleRejectTransaction(withdrawal.id)}>
                                                                Reject
                                                            </Button>
                                                        </div>
                                                    )}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        ) : (
                            <p className="text-center text-gray-600 py-8">No withdrawals found</p>
                        )}
                    </CardContent>
                </Card>
            </TabsContent>

            {/* Repayments Tab */}
            <TabsContent value="repayments" className="space-y-6">
                <Card>
                    <CardHeader>
                        <CardTitle>Repayment Processing</CardTitle>
                        <CardDescription>Review and distribute lender repayments</CardDescription>
                    </CardHeader>
                    <CardContent>
                        {repayments.length > 0 ? (
                            <div className="relative w-full overflow-auto">
                                <table className="w-full caption-bottom text-sm">
                                    <thead>
                                        <tr className="border-b">
                                            <th className="h-12 px-4 text-left align-middle font-medium text-gray-500">Date</th>
                                            <th className="h-12 px-4 text-left align-middle font-medium text-gray-500">Lender</th>
                                            <th className="h-12 px-4 text-left align-middle font-medium text-gray-500">Deal</th>
                                            <th className="h-12 px-4 text-left align-middle font-medium text-gray-500">Amount</th>
                                            <th className="h-12 px-4 text-left align-middle font-medium text-gray-500">Status</th>
                                            <th className="h-12 px-4 text-left align-middle font-medium text-gray-500">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {repayments.map((repayment) => (
                                            <tr key={repayment.id} className="border-b hover:bg-gray-50">
                                                <td className="p-4 align-middle text-sm">{new Date(repayment.created_at).toLocaleDateString()}</td>
                                                <td className="p-4 align-middle font-medium">{repayment.profile?.company_name || repayment.profile?.full_name || "Unknown"}</td>
                                                <td className="p-4 align-middle">{repayment.deals?.title || "Unknown"}</td>
                                                <td className="p-4 align-middle text-green-600">${(repayment.amount || 0).toLocaleString()}</td>
                                                <td className="p-4 align-middle">{getStatusBadge(repayment.status)}</td>
                                                <td className="p-4 align-middle">
                                                    {repayment.status === "pending" && (
                                                        <div className="flex gap-2">
                                                            <Button size="sm" onClick={() => handleApproveRepayment(repayment.id)}>
                                                                Approve & Distribute
                                                            </Button>
                                                            <Button size="sm" variant="destructive" onClick={() => handleRejectRepayment(repayment.id)}>
                                                                Reject
                                                            </Button>
                                                        </div>
                                                    )}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        ) : (
                            <p className="text-center text-gray-600 py-8">No repayments found</p>
                        )}
                    </CardContent>
                </Card>
            </TabsContent>

            {/* Notifications Tab */}
            <TabsContent value="notifications" className="space-y-6">
                <Card>
                    <CardHeader>
                        <div className="flex items-center justify-between">
                            <div>
                                <CardTitle>Notifications</CardTitle>
                                <CardDescription>System notifications and alerts</CardDescription>
                            </div>
                            {unreadNotifications.length > 0 && (
                                <Button variant="outline" size="sm" onClick={handleMarkAllNotificationsRead}>
                                    <MailOpen className="mr-2 size-4" />
                                    Mark All Read
                                </Button>
                            )}
                        </div>
                    </CardHeader>
                    <CardContent>
                        {notifications.length > 0 ? (
                            <div className="space-y-3">
                                {notifications.map((notification) => (
                                    <div
                                        key={notification.id}
                                        className={`flex items-start justify-between p-4 border rounded-lg ${!notification.read ? "bg-blue-50 border-blue-200" : "bg-white"}`}
                                    >
                                        <div className="flex items-start gap-3 flex-1">
                                            <div className={`mt-1 ${!notification.read ? "text-blue-600" : "text-gray-400"}`}>
                                                {!notification.read ? <Mail className="size-5" /> : <MailOpen className="size-5" />}
                                            </div>
                                            <div className="flex-1">
                                                <div className="flex items-center gap-2">
                                                    <p className={`font-medium ${!notification.read ? "text-gray-900" : "text-gray-700"}`}>
                                                        {notification.title}
                                                    </p>
                                                    {!notification.read && (
                                                        <span className="bg-blue-500 text-white rounded-full px-2 py-0.5 text-xs">New</span>
                                                    )}
                                                </div>
                                                <p className="text-sm text-gray-600 mt-1">{notification.message}</p>
                                                <p className="text-xs text-gray-500 mt-2">
                                                    {new Date(notification.created_at).toLocaleString()}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2 ml-4">
                                            {!notification.read && (
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => handleMarkNotificationRead(notification.id)}
                                                    title="Mark as read"
                                                >
                                                    <CheckCircle className="size-4" />
                                                </Button>
                                            )}
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => handleDeleteNotification(notification.id)}
                                                className="text-red-600 hover:text-red-700 hover:bg-red-50"
                                                title="Delete"
                                            >
                                                <Trash2 className="size-4" />
                                            </Button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-12">
                                <Bell className="size-12 text-gray-300 mx-auto mb-4" />
                                <p className="text-gray-600">No notifications</p>
                                <p className="text-sm text-gray-500 mt-1">You're all caught up!</p>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </TabsContent>
        </Tabs>
    )
}
