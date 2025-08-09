import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { ToastProvider } from '@/components/ui/toast'
import { Web3Provider } from '@/components/Web3Provider'

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
        <Web3Provider>
          <ToastProvider>
            <div className="relative min-h-screen bg-background">
              {children}
            </div>
          </ToastProvider>
        </Web3Provider>
      </body>
    </html>
  )
}
