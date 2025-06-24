import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import NavigationSimple from '@/components/NavigationSimple'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Sunbeam Capital Management',
  description: 'Crypto portfolio management system for Sunbeam Capital',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <NavigationSimple />
        <main className="min-h-screen">
          {children}
        </main>
      </body>
    </html>
  )
}