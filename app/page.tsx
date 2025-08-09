"use client"

import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { WalletConnectButton } from '@/components/WalletConnectButton'
import { 
  ArrowRight, 
  Zap, 
  Shield, 
  TrendingUp, 
  Network, 
  DollarSign, 
  Activity,
  BarChart3,
  Lock,
  Gauge
} from 'lucide-react'

export default function LandingPage() {

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Navigation */}
      <nav className="flex items-center justify-between p-6 bg-white/80 backdrop-blur-sm border-b">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
            <Zap className="h-5 w-5 text-white" />
          </div>
          <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            ArbiZirQ
          </span>
        </div>
        <div className="flex items-center gap-4">
          <Link href="/dashboard">
            <Button variant="outline">Dashboard</Button>
          </Link>
          <WalletConnectButton className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
            Connect Wallet
          </WalletConnectButton>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="container mx-auto px-6 py-20">
        <div className="text-center max-w-4xl mx-auto">
          <Badge className="mb-6 bg-gradient-to-r from-blue-100 to-purple-100 text-blue-800">
            ⚡ Flash Arbitrage • Zircuit × Bitte Protocol
          </Badge>
          
          <h1 className="text-5xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-blue-600 via-purple-600 to-blue-800 bg-clip-text text-transparent">
            Real Cross-Chain Arbitrage
            <br />
            Execution Platform
          </h1>
          
          <p className="text-xl text-gray-600 mb-8 leading-relaxed">
            <strong>Execute real arbitrage trades</strong> across Ethereum, Polygon, Arbitrum, Base, and Zircuit 
            with AI-powered optimization, live DEX integration, and comprehensive risk management.
          </p>
          
          <div className="flex items-center justify-center gap-6 mb-8">
            <Badge className="bg-green-100 text-green-800 px-4 py-2">
              🔴 LIVE TRADING
            </Badge>
            <Badge className="bg-blue-100 text-blue-800 px-4 py-2">
              ⚡ Real DEX Swaps
            </Badge>
            <Badge className="bg-purple-100 text-purple-800 px-4 py-2">
              🌉 Cross-Chain Bridges
            </Badge>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
            <WalletConnectButton 
              size="lg"
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-lg px-8 py-3"
            >
              Start Trading
            </WalletConnectButton>
            <Link href="/dashboard">
              <Button size="lg" variant="outline" className="text-lg px-8 py-3">
                View Dashboard
              </Button>
            </Link>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-2xl mx-auto">
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-600">5+</div>
              <div className="text-sm text-gray-600">Supported Chains</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-purple-600">10+</div>
              <div className="text-sm text-gray-600">DEX Integrations</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-600">&lt;5s</div>
              <div className="text-sm text-gray-600">Execution Time</div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="container mx-auto px-6 py-20">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold mb-4">Powerful Features</h2>
          <p className="text-gray-600 text-lg">Everything you need for professional arbitrage trading</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 card-hover border-l-4 border-l-green-500">
            <CardHeader>
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
                <DollarSign className="h-6 w-6 text-green-600" />
              </div>
              <CardTitle>Real DEX Execution</CardTitle>
              <CardDescription>
                Execute actual swaps on Uniswap, QuickSwap, SushiSwap, and other major DEXs with real funds
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 card-hover">
            <CardHeader>
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                <Network className="h-6 w-6 text-blue-600" />
              </div>
              <CardTitle>Cross-Chain Bridges</CardTitle>
              <CardDescription>
                Real cross-chain arbitrage with bridge integration for seamless token transfers
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 card-hover">
            <CardHeader>
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
                <Zap className="h-6 w-6 text-purple-600" />
              </div>
              <CardTitle>AI-Powered Optimization</CardTitle>
              <CardDescription>
                Bitte Protocol AI agents optimize routes and maximize profits automatically
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 card-hover">
            <CardHeader>
              <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center mb-4">
                <Shield className="h-6 w-6 text-orange-600" />
              </div>
              <CardTitle>Advanced Safety</CardTitle>
              <CardDescription>
                Real-time slippage protection, transaction monitoring, and comprehensive risk management
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 card-hover">
            <CardHeader>
              <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center mb-4">
                <TrendingUp className="h-6 w-6 text-red-600" />
              </div>
              <CardTitle>Live Market Data</CardTitle>
              <CardDescription>
                Real-time price feeds and liquidity analysis across all supported chains and DEXs
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 card-hover">
            <CardHeader>
              <div className="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center mb-4">
                <Activity className="h-6 w-6 text-indigo-600" />
              </div>
              <CardTitle>Dual Execution Modes</CardTitle>
              <CardDescription>
                Choose between real execution for profits or simulation mode for testing strategies
              </CardDescription>
            </CardHeader>
          </Card>
        </div>
      </section>

      {/* How It Works */}
      <section className="bg-white py-20">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold mb-4">How It Works</h2>
            <p className="text-gray-600 text-lg">Simple 3-step process to start earning</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-white font-bold text-xl">1</span>
              </div>
              <h3 className="text-xl font-bold mb-4">Scan Markets</h3>
              <p className="text-gray-600">
                Our AI continuously scans DEXs across multiple chains to find profitable arbitrage opportunities
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-white font-bold text-xl">2</span>
              </div>
              <h3 className="text-xl font-bold mb-4">Choose Execution Mode</h3>
              <p className="text-gray-600">
                Select real execution for live trading or simulation mode for testing. Review fees, slippage, and profit estimates
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-green-600 rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-white font-bold text-xl">3</span>
              </div>
              <h3 className="text-xl font-bold mb-4">Execute Real Trades</h3>
              <p className="text-gray-600">
                Execute real DEX swaps and cross-chain bridges with your connected wallet. Monitor live transaction status
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-gradient-to-r from-blue-600 to-purple-600 py-20">
        <div className="container mx-auto px-6 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">
            Ready to Start Earning?
          </h2>
          <p className="text-blue-100 text-lg mb-8 max-w-2xl mx-auto">
            Join the future of decentralized arbitrage trading with ArbiZirQ's 
            professional-grade platform built for Zircuit ecosystem.
          </p>
          <WalletConnectButton 
            size="lg"
            className="bg-white text-blue-600 hover:bg-gray-100 text-lg px-8 py-3"
          >
            Get Started Now
          </WalletConnectButton>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                  <Zap className="h-5 w-5 text-white" />
                </div>
                <span className="text-xl font-bold">ArbiZirQ</span>
              </div>
              <p className="text-gray-400">
                Professional cross-chain arbitrage trading platform powered by Zircuit and Bitte Protocol.
              </p>
            </div>

            <div>
              <h4 className="font-semibold mb-4">Platform</h4>
              <ul className="space-y-2 text-gray-400">
                <li><Link href="/dashboard" className="hover:text-white">Dashboard</Link></li>
                <li><Link href="/analytics" className="hover:text-white">Analytics</Link></li>
                <li><Link href="/api" className="hover:text-white">API Docs</Link></li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold mb-4">Resources</h4>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white">Documentation</a></li>
                <li><a href="#" className="hover:text-white">Discord</a></li>
                <li><a href="#" className="hover:text-white">GitHub</a></li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold mb-4">Partners</h4>
              <ul className="space-y-2 text-gray-400">
                <li><a href="https://zircuit.com" className="hover:text-white">Zircuit</a></li>
                <li><a href="https://bitte.ai" className="hover:text-white">Bitte Protocol</a></li>
                <li><a href="https://gud.finance" className="hover:text-white">GUD Finance</a></li>
              </ul>
            </div>
          </div>

          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; 2025 ArbiZirQ. All rights reserved. Educational and research purposes only.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
