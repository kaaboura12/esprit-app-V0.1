import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Esprit",
  description: "Plateforme éducative ESPRIT - HONORIS UNITED UNIVERSITIES",
  icons: {
    icon: '/app/favicon.ico',
    shortcut: '/app/favicon.ico',
    apple: '/app/favicon.ico',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>{children}</body>
    </html>
  )
} 