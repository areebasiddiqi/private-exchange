import type { Metadata } from "next";
import { Inter, Outfit } from "next/font/google";
import "./globals.css";
import { cn } from "@/lib/utils";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const outfit = Outfit({ subsets: ["latin"], variable: "--font-outfit" });

export const metadata: Metadata = {
    title: "Private Money Exchange",
    description: "Capital marketplace for accredited investors and hard-money lenders.",
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en">
            <body className={cn("min-h-screen bg-background font-sans antialiased relative overflow-x-hidden", inter.variable, outfit.variable)}>
                <div className="fixed inset-0 -z-10 h-full w-full bg-background">
                    <div className="absolute top-0 z-[-2] h-screen w-screen bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(120,119,198,0.3),rgba(255,255,255,0))]"></div>
                    <div className="absolute bottom-0 left-0 z-[-2] h-[500px] w-[500px] rounded-full bg-primary/5 blur-[100px]"></div>
                    <div className="absolute top-0 right-0 z-[-2] h-[500px] w-[500px] rounded-full bg-secondary/10 blur-[100px]"></div>
                    <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-[-2] h-[300px] w-[300px] rounded-full bg-blue-500/5 blur-[100px]"></div>
                </div>
                {children}
            </body>
        </html>
    );
}
