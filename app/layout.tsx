import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'ArbiZirQ - Flash Arbitrage Executor',
  description: 'Zircuit × Bitte Flash Arbitrage Executor - Real-time cross-chain arbitrage opportunities',
  keywords: ['arbitrage', 'zircuit', 'bitte', 'defi', 'crypto', 'trading'],
  authors: [{ name: 'ArbiZirQ Team' }],
}

export const viewport = {
  width: 'device-width',
  initialScale: 1,
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <div className="relative min-h-screen bg-background">
          {children}
        </div>
      </body>
    </html>
  )
}
