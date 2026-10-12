import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "AuditPay • Protect Payouts & Recover Deduction Leakage",
  description: "Automated quick-commerce settlement and warehouse inward auditor for Indian D2C brands. Detect phantom RTV returns and recover lost margins from Blinkit, Zepto, and Instamart.",
};

import { AuditProvider } from "@/context/AuditContext";

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col" suppressHydrationWarning>
        <AuditProvider>
          {children}
        </AuditProvider>
      </body>
    </html>
  );
}
