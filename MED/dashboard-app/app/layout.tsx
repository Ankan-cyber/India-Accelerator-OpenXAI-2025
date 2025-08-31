import './globals.css'
import { Inter, Open_Sans } from 'next/font/google'
import { Toaster } from '@/components/ui/toaster'
import { QueryProvider } from '@/components/providers/query-provider'

const openSans = Open_Sans({
  subsets: ['latin'],
  variable: '--font-sans',
})

export const metadata = {
  title: 'PillPal - Your Medication Companion',
  description: 'A user-friendly medication tracking app designed for seniors with AI-powered health tips',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={openSans.variable}>
      <body className={openSans.className}>
        <QueryProvider>
          {children}
          <Toaster />
        </QueryProvider>
      </body>
    </html>
  )
}