import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { CheckCircle, TrendingUp, Shield, Clock, BarChart3, FileText, Users, Lock } from "lucide-react"

export default function Home() {
    return (
        <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
            {/* Hero Section */}
            <section className="relative overflow-hidden bg-gradient-to-r from-blue-600 to-blue-800 text-white">
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-white/5 to-transparent bg-[size:20px_20px]" />
                <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
                    <div className="text-center space-y-8">
                        <h1 className="text-5xl md:text-6xl font-bold tracking-tight">
                            Private Money Exchange
                        </h1>
                        <p className="text-xl md:text-2xl text-blue-100 max-w-3xl mx-auto">
                            Where private capital meets verified hard money lenders
                        </p>
                        <p className="text-lg text-blue-50 max-w-4xl mx-auto leading-relaxed">
                            Private Money Exchange is a brokerage-style marketplace connecting private investors with verified hard money lenders for real estate deals.
                            Investors keep control of capital until allocated per deal. Lenders gain scalable deal capital without raising a pooled fund.
                        </p>

                        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-8">
                            <Button
                                size="lg"
                                variant="secondary"
                                className="w-full sm:w-auto text-lg px-8 py-6"
                                asChild
                            >
                                <Link href="/login">Investor Login</Link>
                            </Button>
                            <Button
                                size="lg"
                                variant="outline"
                                className="w-full sm:w-auto text-lg px-8 py-6 bg-white/10 hover:bg-white/20 text-white border-white/30"
                                asChild
                            >
                                <Link href="/login">Lender Login</Link>
                            </Button>
                        </div>
                    </div>
                </div>
            </section>

            {/* What This Platform Is */}
            <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
                <div className="max-w-3xl mx-auto text-center space-y-6">
                    <h2 className="text-3xl md:text-4xl font-bold text-gray-900">
                        A Broker Marketplace, Not a Fund
                    </h2>
                    <p className="text-lg text-gray-600 leading-relaxed">
                        Unlike traditional pooled funds where investors lose control of their capital, Private Money Exchange operates as a transparent brokerage platform.
                        Your funds remain in your wallet until you choose to allocate them to specific deals. Each investment is tracked independently with clear,
                        deal-by-deal performance reporting.
                    </p>
                    <p className="text-lg text-gray-600 leading-relaxed">
                        We connect verified hard money lending companies with private investors who want exposure to real estate lending opportunities.
                        Our admin team reviews every lender, approves every deal, and ensures all repayments are properly distributed.
                    </p>
                </div>
            </section>

            {/* How It Works */}
            <section className="bg-gray-50 py-20">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl md:text-4xl font-bold text-gray-900">
                            How It Works
                        </h2>
                        <p className="text-lg text-gray-600 mt-4">
                            Simple, transparent, and secure from start to finish
                        </p>
                    </div>

                    <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
                        {[
                            {
                                step: 1,
                                title: "Investors Deposit Capital",
                                description: "Investors deposit capital into secure on-platform wallets. Funds remain under investor control and are not pooled."
                            },
                            {
                                step: 2,
                                title: "Lenders Submit Deals",
                                description: "Verified hard money lenders submit deal requests with full documentation: appraisal, title, rehab budget, and exit strategy."
                            },
                            {
                                step: 3,
                                title: "Admin Reviews & Approves",
                                description: "Platform admin verifies lender credentials (KYB) and reviews deal documentation. Only approved deals move forward."
                            },
                            {
                                step: 4,
                                title: "Capital Allocation",
                                description: "Admin manually matches investor capital to approved deals based on investor preferences and available balance."
                            },
                            {
                                step: 5,
                                title: "Deal Funding",
                                description: "Platform authorizes funding and releases capital to lender. Same-day simulated transfer with full audit trail."
                            },
                            {
                                step: 6,
                                title: "Lender Repayment",
                                description: "Lender services the loan and submits interest, points, or payoff payments back to the platform with proof."
                            },
                            {
                                step: 7,
                                title: "Automated Distribution",
                                description: "Platform automatically distributes returns to investors based on allocation percentages and takes a 1% broker fee."
                            },
                        ].map((item) => (
                            <Card key={item.step} className="relative border-2 hover:border-blue-200 transition-colors">
                                <div className="absolute -top-4 left-4 w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold">
                                    {item.step}
                                </div>
                                <CardHeader className="pt-8">
                                    <CardTitle className="text-lg">{item.title}</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <p className="text-gray-600">{item.description}</p>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </div>
            </section>

            {/* Benefits for Investors */}
            <section className="py-20">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl md:text-4xl font-bold text-gray-900">
                            Benefits for Investors
                        </h2>
                        <p className="text-lg text-gray-600 mt-4">
                            Transparent, controlled, and high-yield opportunities
                        </p>
                    </div>

                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {[
                            {
                                icon: <FileText className="size-8 text-blue-600" />,
                                title: "Deal-by-Deal Transparency",
                                description: "See exactly where your capital is allocated. Review full deal documentation including appraisals, title commitments, and exit strategies before any commitment."
                            },
                            {
                                icon: <TrendingUp className="size-8 text-blue-600" />,
                                title: "Yield Potential from Interest + Points",
                                description: "Earn returns from both interest payments and origination points. Typical returns range from 11-15% annually on real estate secured lending."
                            },
                            {
                                icon: <Lock className="size-8 text-blue-600" />,
                                title: "Capital Control (Not Pooled)",
                                description: "Your funds stay in your wallet until you choose to allocate. Unlike pooled funds, you maintain full visibility and control over your capital."
                            },
                            {
                                icon: <BarChart3 className="size-8 text-blue-600" />,
                                title: "Diversification Across Deals",
                                description: "Spread your capital across multiple deals, lenders, property types, and markets to reduce concentration risk."
                            },
                            {
                                icon: <CheckCircle className="size-8 text-blue-600" />,
                                title: "Automatic Return Distribution",
                                description: "Receive proportional returns automatically as lenders make payments. No manual tracking or payment collection required."
                            },
                            {
                                icon: <Clock className="size-8 text-blue-600" />,
                                title: "Withdraw Available Funds Anytime",
                                description: "Request withdrawal of available (non-reserved) capital anytime. Admin-approved withdrawals processed promptly."
                            },
                        ].map((benefit, index) => (
                            <Card key={index} className="border-2 hover:border-blue-200 hover:shadow-lg transition-all">
                                <CardHeader>
                                    <div className="mb-4">{benefit.icon}</div>
                                    <CardTitle className="text-xl">{benefit.title}</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <p className="text-gray-600">{benefit.description}</p>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </div>
            </section>

            {/* Benefits for Lenders */}
            <section className="bg-gray-50 py-20">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl md:text-4xl font-bold text-gray-900">
                            Benefits for Lenders
                        </h2>
                        <p className="text-lg text-gray-600 mt-4">
                            Scale your lending business with reliable private capital
                        </p>
                    </div>

                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {[
                            {
                                icon: <Users className="size-8 text-blue-600" />,
                                title: "Reliable Deal Capital for Scale",
                                description: "Access a pool of verified private investors ready to fund quality deals. Grow your lending volume without traditional capital constraints."
                            },
                            {
                                icon: <Clock className="size-8 text-blue-600" />,
                                title: "Fast Funding After Approval",
                                description: "Once admin approves your deal and allocates capital, funding is executed same-day (simulated). No lengthy capital raise process."
                            },
                            {
                                icon: <FileText className="size-8 text-blue-600" />,
                                title: "Deal-Based Borrowing",
                                description: "Submit deals individually with specific terms. Not participating in a fund structure - you're accessing capital deal-by-deal on your terms."
                            },
                            {
                                icon: <Shield className="size-8 text-blue-600" />,
                                title: "Single Documentation Workflow",
                                description: "One standardized platform for submitting deals, uploading docs, and processing repayments. No separate investor onboarding per deal."
                            },
                            {
                                icon: <TrendingUp className="size-8 text-blue-600" />,
                                title: "Recurring Private Capital Access",
                                description: "Build a track record on the platform. Lenders with strong performance gain faster approvals and larger allocations over time."
                            },
                            {
                                icon: <BarChart3 className="size-8 text-blue-600" />,
                                title: "Professional Back-Office Tracking",
                                description: "Dashboard shows deal status, repayment history, and investor allocation details. Full audit trail for compliance and reporting."
                            },
                        ].map((benefit, index) => (
                            <Card key={index} className="border-2 hover:border-blue-200 hover:shadow-lg transition-all">
                                <CardHeader>
                                    <div className="mb-4">{benefit.icon}</div>
                                    <CardTitle className="text-xl">{benefit.title}</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <p className="text-gray-600">{benefit.description}</p>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </div>
            </section>

            {/* Safety & Compliance */}
            <section className="py-20">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl md:text-4xl font-bold text-gray-900">
                            Safety, Verification & Compliance
                        </h2>
                        <p className="text-lg text-gray-600 mt-4">
                            Trust through transparency and verification
                        </p>
                    </div>

                    <div className="grid md:grid-cols-2 gap-12 max-w-5xl mx-auto">
                        <Card className="border-2">
                            <CardHeader>
                                <Shield className="size-12 text-blue-600 mb-4" />
                                <CardTitle className="text-2xl">Investor Protection</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="flex items-start gap-3">
                                    <CheckCircle className="size-5 text-green-600 mt-1 flex-shrink-0" />
                                    <p className="text-gray-600">All investors complete KYC (Know Your Customer) verification</p>
                                </div>
                                <div className="flex items-start gap-3">
                                    <CheckCircle className="size-5 text-green-600 mt-1 flex-shrink-0" />
                                    <p className="text-gray-600">Capital remains in investor wallets until deal allocation</p>
                                </div>
                                <div className="flex items-start gap-3">
                                    <CheckCircle className="size-5 text-green-600 mt-1 flex-shrink-0" />
                                    <p className="text-gray-600">Full visibility into deal documentation and terms</p>
                                </div>
                                <div className="flex items-start gap-3">
                                    <CheckCircle className="size-5 text-green-600 mt-1 flex-shrink-0" />
                                    <p className="text-gray-600">Platform brokers capital and does not guarantee returns</p>
                                </div>
                                <div className="flex items-start gap-3">
                                    <CheckCircle className="size-5 text-green-600 mt-1 flex-shrink-0" />
                                    <p className="text-gray-600">Investors choose exposure per deal individually</p>
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="border-2">
                            <CardHeader>
                                <Users className="size-12 text-blue-600 mb-4" />
                                <CardTitle className="text-2xl">Lender Verification</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="flex items-start gap-3">
                                    <CheckCircle className="size-5 text-green-600 mt-1 flex-shrink-0" />
                                    <p className="text-gray-600">All lenders complete KYB (Know Your Business) verification</p>
                                </div>
                                <div className="flex items-start gap-3">
                                    <CheckCircle className="size-5 text-green-600 mt-1 flex-shrink-0" />
                                    <p className="text-gray-600">Admin reviews lender credentials and operating history</p>
                                </div>
                                <div className="flex items-start gap-3">
                                    <CheckCircle className="size-5 text-green-600 mt-1 flex-shrink-0" />
                                    <p className="text-gray-600">Every deal reviewed for complete documentation</p>
                                </div>
                                <div className="flex items-start gap-3">
                                    <CheckCircle className="size-5 text-green-600 mt-1 flex-shrink-0" />
                                    <p className="text-gray-600">Repayment processing requires admin approval</p>
                                </div>
                                <div className="flex items-start gap-3">
                                    <CheckCircle className="size-5 text-green-600 mt-1 flex-shrink-0" />
                                    <p className="text-gray-600">Full audit trail for compliance and transparency</p>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    <div className="mt-12 max-w-3xl mx-auto bg-blue-50 border-2 border-blue-200 rounded-lg p-8">
                        <p className="text-center text-gray-700 leading-relaxed">
                            <strong className="text-blue-900">Important:</strong> Private Money Exchange is a brokerage platform that connects investors and lenders.
                            We do not guarantee returns, and all investments carry risk. Investors should conduct their own due diligence.
                            Past performance does not guarantee future results. This platform is for accredited investors and qualified lending professionals.
                        </p>
                    </div>
                </div>
            </section>

            {/* Final CTA */}
            <section className="bg-gradient-to-r from-blue-600 to-blue-800 text-white py-20">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                    <h2 className="text-3xl md:text-4xl font-bold mb-6">
                        Ready to Get Started?
                    </h2>
                    <p className="text-xl text-blue-100 mb-12 max-w-2xl mx-auto">
                        Join verified investors and lenders on the leading private money marketplace for real estate lending
                    </p>

                    <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                        <Button
                            size="lg"
                            variant="secondary"
                            className="w-full sm:w-auto text-lg px-8 py-6"
                            asChild
                        >
                            <Link href="/signup?type=investor">Start as Investor</Link>
                        </Button>
                        <Button
                            size="lg"
                            variant="outline"
                            className="w-full sm:w-auto text-lg px-8 py-6 bg-white/10 hover:bg-white/20 text-white border-white/30"
                            asChild
                        >
                            <Link href="/signup?type=lender">Start as Lender</Link>
                        </Button>
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="bg-gray-900 text-gray-300 py-12">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid md:grid-cols-4 gap-8 mb-8">
                        <div>
                            <h3 className="font-bold text-white mb-4">Private Money Exchange</h3>
                            <p className="text-sm">
                                Connecting private capital with verified hard money lenders
                            </p>
                        </div>
                        <div>
                            <h4 className="font-semibold text-white mb-4">Platform</h4>
                            <ul className="space-y-2 text-sm">
                                <li><Link href="/signup?type=investor" className="hover:text-white">For Investors</Link></li>
                                <li><Link href="/signup?type=lender" className="hover:text-white">For Lenders</Link></li>
                                <li><Link href="#how-it-works" className="hover:text-white">How It Works</Link></li>
                            </ul>
                        </div>
                        <div>
                            <h4 className="font-semibold text-white mb-4">Company</h4>
                            <ul className="space-y-2 text-sm">
                                <li><Link href="#" className="hover:text-white">About</Link></li>
                                <li><Link href="#" className="hover:text-white">Contact</Link></li>
                                <li><Link href="#" className="hover:text-white">Careers</Link></li>
                            </ul>
                        </div>
                        <div>
                            <h4 className="font-semibold text-white mb-4">Legal</h4>
                            <ul className="space-y-2 text-sm">
                                <li><Link href="#" className="hover:text-white">Terms of Service</Link></li>
                                <li><Link href="#" className="hover:text-white">Privacy Policy</Link></li>
                                <li><Link href="#" className="hover:text-white">Compliance</Link></li>
                            </ul>
                        </div>
                    </div>
                    <div className="border-t border-gray-800 pt-8 text-center text-sm">
                        <p>&copy; 2024 Private Money Exchange. All rights reserved.</p>
                        <p className="mt-2 text-gray-500">
                            For accredited investors and qualified lending professionals only
                        </p>
                    </div>
                </div>
            </footer>
        </div>
    )
}
