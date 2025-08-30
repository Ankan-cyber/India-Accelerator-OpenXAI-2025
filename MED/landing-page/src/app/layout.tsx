import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import { Analytics } from "@vercel/analytics/next"
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'PillPal - Your Medication Companion',
  description: 'A user-friendly medication tracking app designed for seniors with AI-powered health tips and smart reminders.',
  keywords: 'medication tracking, pill reminder, health app, seniors, AI health tips',
  openGraph: {
    title: 'PillPal - Your Medication Companion',
    description: 'A user-friendly medication tracking app designed for seniors with AI-powered health tips and smart reminders.',
    type: 'website',
  },
  icons: {
    icon: '/favicon.svg',
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
      <Analytics />
    </html>
  )
}