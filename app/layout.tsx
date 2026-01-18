import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { AuthProvider } from "@/hooks/use-auth"
import { TranslationProvider } from "@/hooks/use-translation"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "UserFeedback",
  description: "Complete system for collecting and analyzing user feedback",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <TranslationProvider>
          <AuthProvider>{children}</AuthProvider>
        </TranslationProvider>
      </body>
    </html>
  )
}
