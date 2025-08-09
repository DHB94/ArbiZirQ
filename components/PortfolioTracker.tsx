"use client"

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  BarChart3, 
  Clock, 
  Target,
  Wallet,
  Activity
} from 'lucide-react'
import { formatUSD, formatTimeAgo } from '@/lib/format'

interface TradeHistory {
  id: string
  pair: string
  route: string
  size: number
  grossPnl: number
  netPnl: number
  fees: number
  timestamp: number
  status: 'completed' | 'failed' | 'pending'
}

interface PortfolioStats {
  totalPnl: number
  totalTrades: number
  successRate: number
  bestTrade: number
  worstTrade: number
  avgTradeSize: number
  totalVolume: number
  activeTrades: number
}

const MOCK_TRADES: TradeHistory[] = [
  {
    id: '1',
    pair: 'ETH/USDC',
    route: 'ethereum → arbitrum',
    size: 2150,
    grossPnl: 42.30,
    netPnl: 18.45,
    fees: 23.85,
    timestamp: Date.now() - 3600000,
    status: 'completed'
  },
  {
    id: '2',
    pair: 'USDC/USDT',
    route: 'polygon → zircuit',
    size: 5000,
    grossPnl: 15.60,
    netPnl: -8.20,
    fees: 23.80,
    timestamp: Date.now() - 7200000,
    status: 'completed'
  },
  {
    id: '3',
    pair: 'ETH/USDC',
    route: 'arbitrum → ethereum',
    size: 1800,
    grossPnl: 28.90,
    netPnl: 12.15,
    fees: 16.75,
    timestamp: Date.now() - 10800000,
    status: 'completed'
  }
]

export function PortfolioTracker() {
  const [trades, setTrades] = useState<TradeHistory[]>(MOCK_TRADES)
  const [stats, setStats] = useState<PortfolioStats | null>(null)

  useEffect(() => {
    // Calculate portfolio stats
    const completedTrades = trades.filter(t => t.status === 'completed')
    const totalPnl = completedTrades.reduce((sum, t) => sum + t.netPnl, 0)
    const totalVolume = completedTrades.reduce((sum, t) => sum + t.size, 0)
    const successfulTrades = completedTrades.filter(t => t.netPnl > 0)
    
    setStats({
      totalPnl,
      totalTrades: completedTrades.length,
      successRate: completedTrades.length > 0 ? (successfulTrades.length / completedTrades.length) * 100 : 0,
      bestTrade: Math.max(...completedTrades.map(t => t.netPnl), 0),
      worstTrade: Math.min(...completedTrades.map(t => t.netPnl), 0),
      avgTradeSize: completedTrades.length > 0 ? totalVolume / completedTrades.length : 0,
      totalVolume,
      activeTrades: trades.filter(t => t.status === 'pending').length
    })
  }, [trades])

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800'
      case 'failed': return 'bg-red-100 text-red-800'
      case 'pending': return 'bg-yellow-100 text-yellow-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getPnlColor = (pnl: number) => {
    return pnl >= 0 ? 'text-green-600' : 'text-red-600'
  }

  if (!stats) return null

  return (
    <div className="space-y-6">
      {/* Portfolio Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total PnL</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${getPnlColor(stats.totalPnl)}`}>
              {formatUSD(stats.totalPnl)}
            </div>
            <p className="text-xs text-muted-foreground">
              Across {stats.totalTrades} trades
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Success Rate</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats.successRate.toFixed(1)}%
            </div>
            <p className="text-xs text-muted-foreground">
              Profitable trades
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Volume</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatUSD(stats.totalVolume, 0)}
            </div>
            <p className="text-xs text-muted-foreground">
              Avg: {formatUSD(stats.avgTradeSize, 0)}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Best Trade</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {formatUSD(stats.bestTrade)}
            </div>
            <p className="text-xs text-muted-foreground">
              Highest profit
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Tabs */}
      <Card>
        <Tabs defaultValue="trades" className="w-full">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Trading Activity</CardTitle>
                <CardDescription>Your arbitrage trading history and performance</CardDescription>
              </div>
              <TabsList className="grid w-full max-w-md grid-cols-3">
                <TabsTrigger value="trades">Recent Trades</TabsTrigger>
                <TabsTrigger value="performance">Performance</TabsTrigger>
                <TabsTrigger value="analytics">Analytics</TabsTrigger>
              </TabsList>
            </div>
          </CardHeader>

          <CardContent>
            <TabsContent value="trades" className="space-y-4">
              <div className="space-y-3">
                {trades.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <Activity className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>No trades executed yet</p>
                    <p className="text-sm">Start by scanning for opportunities</p>
                  </div>
                ) : (
                  trades.map((trade) => (
                    <div key={trade.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50">
                      <div className="flex items-center gap-4">
                        <div className="text-sm">
                          <div className="font-medium">{trade.pair}</div>
                          <div className="text-muted-foreground">{trade.route}</div>
                        </div>
                        <Badge variant="secondary" className={getStatusColor(trade.status)}>
                          {trade.status.toUpperCase()}
                        </Badge>
                      </div>
                      
                      <div className="text-right text-sm">
                        <div className="font-medium">{formatUSD(trade.size, 0)}</div>
                        <div className="text-muted-foreground">Trade Size</div>
                      </div>
                      
                      <div className="text-right text-sm">
                        <div className={`font-medium ${getPnlColor(trade.netPnl)}`}>
                          {formatUSD(trade.netPnl)}
                        </div>
                        <div className="text-muted-foreground">Net PnL</div>
                      </div>
                      
                      <div className="text-right text-sm text-muted-foreground">
                        <div>{formatTimeAgo(trade.timestamp)}</div>
                        <div>Fees: {formatUSD(trade.fees)}</div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </TabsContent>

            <TabsContent value="performance" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Performance Metrics</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex justify-between">
                      <span>Total Trades:</span>
                      <span className="font-medium">{stats.totalTrades}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Success Rate:</span>
                      <span className="font-medium">{stats.successRate.toFixed(1)}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Best Trade:</span>
                      <span className="font-medium text-green-600">{formatUSD(stats.bestTrade)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Worst Trade:</span>
                      <span className="font-medium text-red-600">{formatUSD(stats.worstTrade)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Avg Trade Size:</span>
                      <span className="font-medium">{formatUSD(stats.avgTradeSize, 0)}</span>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Risk Metrics</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex justify-between">
                      <span>Risk Score:</span>
                      <Badge variant="secondary" className="bg-green-100 text-green-800">Low</Badge>
                    </div>
                    <div className="flex justify-between">
                      <span>Max Drawdown:</span>
                      <span className="font-medium">{formatUSD(Math.abs(stats.worstTrade))}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Avg Fee Ratio:</span>
                      <span className="font-medium">1.2%</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Active Positions:</span>
                      <span className="font-medium">{stats.activeTrades}</span>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="analytics" className="space-y-4">
              <div className="text-center py-8 text-muted-foreground">
                <BarChart3 className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Advanced analytics coming soon</p>
                <p className="text-sm">Charts, trends, and detailed performance insights</p>
              </div>
            </TabsContent>
          </CardContent>
        </Tabs>
      </Card>
    </div>
  )
}
