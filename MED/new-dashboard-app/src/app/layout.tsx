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

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="no-scroll-x">
      <head>
        <meta name="format-detection" content="telephone=no" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
      </head>
      <body className="no-scroll-x mobile-safe-area">
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