"use client"

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  BarChart3, 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  Activity,
  Clock,
  Target,
  Zap,
  Globe
} from 'lucide-react'
import { formatUSD, formatTimeAgo } from '@/lib/format'

export default function AnalyticsPage() {
  const [timeRange, setTimeRange] = useState('24h')

  // Mock data for analytics
  const metrics = {
    totalPnL: 156.78,
    totalTrades: 23,
    successRate: 78.3,
    avgTradeSize: 2847,
    totalVolume: 65481,
    bestTrade: 68.45,
    avgExecutionTime: 4.2,
    activeChains: 5
  }

  const chainData = [
    { name: 'Ethereum', trades: 8, volume: 24560, pnl: 89.32, color: 'bg-blue-500' },
    { name: 'Arbitrum', trades: 6, volume: 18920, pnl: 45.12, color: 'bg-purple-500' },
    { name: 'Polygon', trades: 5, volume: 12450, pnl: 32.18, color: 'bg-orange-500' },
    { name: 'Zircuit', trades: 3, volume: 7891, pnl: -8.24, color: 'bg-green-500' },
    { name: 'Optimism', trades: 1, volume: 1660, pnl: -1.60, color: 'bg-red-500' }
  ]

  const pairData = [
    { pair: 'ETH/USDC', trades: 12, volume: 32100, pnl: 98.45 },
    { pair: 'USDC/USDT', trades: 8, volume: 21300, pnl: 34.67 },
    { pair: 'WBTC/USDC', trades: 2, volume: 8900, pnl: 15.32 },
    { pair: 'DAI/USDC', trades: 1, volume: 3181, pnl: 8.34 }
  ]

  const recentActivity = [
    { time: '2 min ago', action: 'Trade executed', pair: 'ETH/USDC', pnl: 15.67, success: true },
    { time: '8 min ago', action: 'Opportunity scanned', pair: 'USDC/USDT', pnl: 0, success: true },
    { time: '12 min ago', action: 'Trade failed', pair: 'WBTC/USDC', pnl: -2.34, success: false },
    { time: '18 min ago', action: 'High profit alert', pair: 'ETH/USDC', pnl: 42.18, success: true },
    { time: '25 min ago', action: 'System health check', pair: '-', pnl: 0, success: true }
  ]

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Analytics</h1>
            <p className="text-muted-foreground">
              Comprehensive trading performance and market insights
            </p>
          </div>
          
          <div className="flex items-center gap-2">
            {['1h', '24h', '7d', '30d'].map((range) => (
              <Button
                key={range}
                variant={timeRange === range ? "default" : "outline"}
                size="sm"
                onClick={() => setTimeRange(range)}
              >
                {range}
              </Button>
            ))}
          </div>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total PnL</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className={`text-2xl font-bold ${metrics.totalPnL >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {formatUSD(metrics.totalPnL)}
              </div>
              <p className="text-xs text-muted-foreground">
                +12.4% from last {timeRange}
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
                {metrics.successRate.toFixed(1)}%
              </div>
              <p className="text-xs text-muted-foreground">
                {metrics.totalTrades} total trades
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Avg Execution</CardTitle>
              <Zap className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {metrics.avgExecutionTime}s
              </div>
              <p className="text-xs text-muted-foreground">
                Lightning fast
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
                {formatUSD(metrics.totalVolume, 0)}
              </div>
              <p className="text-xs text-muted-foreground">
                Avg: {formatUSD(metrics.avgTradeSize, 0)}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Detailed Analytics */}
        <Tabs defaultValue="performance" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="performance">Performance</TabsTrigger>
            <TabsTrigger value="chains">Chain Analysis</TabsTrigger>
            <TabsTrigger value="pairs">Token Pairs</TabsTrigger>
            <TabsTrigger value="activity">Recent Activity</TabsTrigger>
          </TabsList>

          <TabsContent value="performance" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Profit Distribution</CardTitle>
                  <CardDescription>PnL breakdown over time</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Positive Trades</span>
                      <div className="flex items-center gap-2">
                        <div className="w-32 h-2 bg-muted rounded-full overflow-hidden">
                          <div className="w-4/5 h-full bg-green-500"></div>
                        </div>
                        <span className="text-sm font-medium">78%</span>
                      </div>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Break-even</span>
                      <div className="flex items-center gap-2">
                        <div className="w-32 h-2 bg-muted rounded-full overflow-hidden">
                          <div className="w-1/5 h-full bg-yellow-500"></div>
                        </div>
                        <span className="text-sm font-medium">9%</span>
                      </div>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Negative Trades</span>
                      <div className="flex items-center gap-2">
                        <div className="w-32 h-2 bg-muted rounded-full overflow-hidden">
                          <div className="w-1/6 h-full bg-red-500"></div>
                        </div>
                        <span className="text-sm font-medium">13%</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Risk Metrics</CardTitle>
                  <CardDescription>Trading risk assessment</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between">
                    <span>Max Drawdown:</span>
                    <span className="font-medium text-red-600">-$23.45</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Sharpe Ratio:</span>
                    <span className="font-medium">2.34</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Win/Loss Ratio:</span>
                    <span className="font-medium">3.2:1</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Risk Score:</span>
                    <Badge variant="secondary" className="bg-green-100 text-green-800">Low</Badge>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="chains" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Chain Performance</CardTitle>
                <CardDescription>Trading activity across different blockchain networks</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {chainData.map((chain, index) => (
                    <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className={`w-3 h-3 rounded-full ${chain.color}`}></div>
                        <div>
                          <div className="font-medium">{chain.name}</div>
                          <div className="text-sm text-muted-foreground">
                            {chain.trades} trades • {formatUSD(chain.volume, 0)} volume
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className={`font-medium ${chain.pnl >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                          {formatUSD(chain.pnl)}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {((chain.pnl / chain.volume) * 100).toFixed(2)}% ROI
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="pairs" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Token Pair Performance</CardTitle>
                <CardDescription>Most traded pairs and their profitability</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {pairData.map((pair, index) => (
                    <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                      <div>
                        <div className="font-medium">{pair.pair}</div>
                        <div className="text-sm text-muted-foreground">
                          {pair.trades} trades • {formatUSD(pair.volume, 0)} volume
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-medium text-green-600">
                          {formatUSD(pair.pnl)}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {((pair.pnl / pair.volume) * 100).toFixed(2)}% ROI
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="activity" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Recent Activity</CardTitle>
                <CardDescription>Latest trading actions and system events</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {recentActivity.map((activity, index) => (
                    <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center gap-3">
                        {activity.success ? (
                          <TrendingUp className="h-4 w-4 text-green-600" />
                        ) : (
                          <TrendingDown className="h-4 w-4 text-red-600" />
                        )}
                        <div>
                          <div className="font-medium text-sm">{activity.action}</div>
                          <div className="text-sm text-muted-foreground">
                            {activity.pair !== '-' && `${activity.pair} • `}{activity.time}
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        {activity.pnl !== 0 && (
                          <div className={`font-medium ${activity.pnl >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                            {formatUSD(activity.pnl)}
                          </div>
                        )}
                        <Badge 
                          variant="secondary" 
                          className={activity.success ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}
                        >
                          {activity.success ? 'Success' : 'Failed'}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
