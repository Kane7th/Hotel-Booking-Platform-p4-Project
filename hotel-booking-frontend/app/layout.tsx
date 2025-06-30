import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "ChateauCore: Hotel Booking System",
  description: "A modern hotel booking and management system",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body 
        className={inter.className}
        suppressHydrationWarning
        data-gramm="false" 
        data-gramm_editor="false"
        data-new-gr-c-s-check-loaded="false"
        data-gr-ext-installed="false"
      >
        {children}
      </body>
    </html>
  )
}
