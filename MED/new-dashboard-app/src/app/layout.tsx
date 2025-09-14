import type { Metadata } from 'next'
import { QueryProvider } from '@/components/providers/query-provider'
import { AuthProvider } from '@/components/providers/auth-provider'
import { Analytics } from "@vercel/analytics/next"
import './globals.css'

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
      <body>
        <AuthProvider>
          <QueryProvider>
            {children}
          </QueryProvider>
        </AuthProvider>
      </body>
      <Analytics />
    </html>
  )
}