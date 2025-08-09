"use client"

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Slider } from '@/components/ui/slider'
import { Switch } from '@/components/ui/switch'
import { 
  Play, 
  Settings, 
  TrendingUp, 
  Shield, 
  Clock, 
  Zap,
  AlertTriangle,
  CheckCircle
} from 'lucide-react'
import { formatUSD } from '@/lib/format'
import type { Chain, TokenPair } from '@/lib/types'
import { SUPPORTED_CHAINS, DEFAULT_TOKEN_PAIRS } from '@/lib/constants'

interface TradingConfig {
  autoExecute: boolean
  maxTradeSize: number
  maxSlippage: number
  minProfit: number
  selectedChains: Chain[]
  selectedPairs: TokenPair[]
  riskLevel: 'conservative' | 'moderate' | 'aggressive'
}

export function TradingInterface() {
  const [config, setConfig] = useState<TradingConfig>({
    autoExecute: false,
    maxTradeSize: 5000,
    maxSlippage: 200, // 2%
    minProfit: 20,
    selectedChains: ['ethereum', 'polygon', 'zircuit'],
    selectedPairs: DEFAULT_TOKEN_PAIRS.slice(0, 3),
    riskLevel: 'moderate'
  })

  const [isTrading, setIsTrading] = useState(false)
  const [tradingStats, setTradingStats] = useState({
    opportunitiesScanned: 0,
    tradesExecuted: 0,
    currentPnL: 0
  })

  const handleStartTrading = () => {
    setIsTrading(true)
    // In a real MVP, this would start the automated trading bot
    console.log('Starting automated trading with config:', config)
  }

  const handleStopTrading = () => {
    setIsTrading(false)
    console.log('Stopping automated trading')
  }

  const updateConfig = (key: keyof TradingConfig, value: any) => {
    setConfig(prev => ({ ...prev, [key]: value }))
  }

  const getRiskColor = (level: string) => {
    switch (level) {
      case 'conservative': return 'bg-green-100 text-green-800'
      case 'moderate': return 'bg-yellow-100 text-yellow-800'
      case 'aggressive': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <div className="space-y-6">
      {/* Trading Status */}
      <Card className={`border-2 ${isTrading ? 'border-green-500 bg-green-50' : 'border-gray-200'}`}>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={`w-3 h-3 rounded-full ${isTrading ? 'bg-green-500 animate-pulse' : 'bg-gray-400'}`} />
              <div>
                <CardTitle className="text-lg">
                  {isTrading ? 'Automated Trading Active' : 'Trading Stopped'}
                </CardTitle>
                <CardDescription>
                  {isTrading 
                    ? 'AI is actively scanning for and executing profitable arbitrage opportunities'
                    : 'Configure your strategy and start automated trading'
                  }
                </CardDescription>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              {isTrading ? (
                <Button 
                  variant="destructive" 
                  onClick={handleStopTrading}
                  className="bg-red-600 hover:bg-red-700"
                >
                  Stop Trading
                </Button>
              ) : (
                <Button 
                  onClick={handleStartTrading}
                  className="bg-green-600 hover:bg-green-700"
                >
                  <Play className="mr-2 h-4 w-4" />
                  Start Trading
                </Button>
              )}
            </div>
          </div>
        </CardHeader>
        
        {isTrading && (
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">{tradingStats.opportunitiesScanned}</div>
                <div className="text-sm text-muted-foreground">Opportunities Scanned</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">{tradingStats.tradesExecuted}</div>
                <div className="text-sm text-muted-foreground">Trades Executed</div>
              </div>
              <div className="text-center">
                <div className={`text-2xl font-bold ${tradingStats.currentPnL >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {formatUSD(tradingStats.currentPnL)}
                </div>
                <div className="text-sm text-muted-foreground">Session PnL</div>
              </div>
            </div>
          </CardContent>
        )}
      </Card>

      {/* Trading Configuration */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Risk & Limits */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Risk & Position Limits
            </CardTitle>
            <CardDescription>Configure your risk management settings</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <Label className="text-sm font-medium">Risk Level</Label>
              <Select 
                value={config.riskLevel} 
                onValueChange={(value: 'conservative' | 'moderate' | 'aggressive') => updateConfig('riskLevel', value)}
              >
                <SelectTrigger className="mt-2">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="conservative">Conservative</SelectItem>
                  <SelectItem value="moderate">Moderate</SelectItem>
                  <SelectItem value="aggressive">Aggressive</SelectItem>
                </SelectContent>
              </Select>
              <Badge variant="secondary" className={`mt-2 ${getRiskColor(config.riskLevel)}`}>
                {config.riskLevel.toUpperCase()}
              </Badge>
            </div>

            <div>
              <Label className="text-sm font-medium">
                Maximum Trade Size: {formatUSD(config.maxTradeSize, 0)}
              </Label>
              <Slider
                value={[config.maxTradeSize]}
                onValueChange={([value]: number[]) => updateConfig('maxTradeSize', value)}
                max={10000}
                min={100}
                step={100}
                className="mt-2"
              />
              <div className="flex justify-between text-xs text-muted-foreground mt-1">
                <span>$100</span>
                <span>$10,000</span>
              </div>
            </div>

            <div>
              <Label className="text-sm font-medium">
                Maximum Slippage: {(config.maxSlippage / 100).toFixed(2)}%
              </Label>
              <Slider
                value={[config.maxSlippage]}
                onValueChange={([value]: number[]) => updateConfig('maxSlippage', value)}
                max={1000}
                min={50}
                step={25}
                className="mt-2"
              />
              <div className="flex justify-between text-xs text-muted-foreground mt-1">
                <span>0.5%</span>
                <span>10%</span>
              </div>
            </div>

            <div>
              <Label className="text-sm font-medium">
                Minimum Profit: {formatUSD(config.minProfit)}
              </Label>
              <Slider
                value={[config.minProfit]}
                onValueChange={([value]: number[]) => updateConfig('minProfit', value)}
                max={100}
                min={5}
                step={5}
                className="mt-2"
              />
              <div className="flex justify-between text-xs text-muted-foreground mt-1">
                <span>$5</span>
                <span>$100</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Trading Strategy */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Trading Strategy
            </CardTitle>
            <CardDescription>Configure automated execution parameters</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <Label className="text-sm font-medium">Auto-Execute Trades</Label>
                <p className="text-xs text-muted-foreground mt-1">
                  Automatically execute profitable opportunities
                </p>
              </div>
              <Switch
                checked={config.autoExecute}
                onCheckedChange={(checked: boolean) => updateConfig('autoExecute', checked)}
              />
            </div>

            <div>
              <Label className="text-sm font-medium mb-2 block">Active Chains</Label>
              <div className="grid grid-cols-2 gap-2">
                {SUPPORTED_CHAINS.map((chain) => (
                  <div key={chain} className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id={chain}
                      checked={config.selectedChains.includes(chain)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          updateConfig('selectedChains', [...config.selectedChains, chain])
                        } else {
                          updateConfig('selectedChains', config.selectedChains.filter(c => c !== chain))
                        }
                      }}
                      className="rounded border-gray-300"
                    />
                    <Label htmlFor={chain} className="text-sm capitalize">
                      {chain}
                    </Label>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <Label className="text-sm font-medium mb-2 block">Active Token Pairs</Label>
              <div className="space-y-2">
                {DEFAULT_TOKEN_PAIRS.slice(0, 4).map((pair, index) => (
                  <div key={index} className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id={`pair-${index}`}
                      checked={config.selectedPairs.some(p => p.base === pair.base && p.quote === pair.quote)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          updateConfig('selectedPairs', [...config.selectedPairs, pair])
                        } else {
                          updateConfig('selectedPairs', config.selectedPairs.filter(p => 
                            !(p.base === pair.base && p.quote === pair.quote)
                          ))
                        }
                      }}
                      className="rounded border-gray-300"
                    />
                    <Label htmlFor={`pair-${index}`} className="text-sm">
                      {pair.base}/{pair.quote}
                    </Label>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Safety Features */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5" />
            Safety Features
          </CardTitle>
          <CardDescription>Built-in protections and circuit breakers</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="flex items-center gap-3 p-3 border rounded-lg">
              <CheckCircle className="h-5 w-5 text-green-600" />
              <div>
                <div className="font-medium text-sm">Slippage Protection</div>
                <div className="text-xs text-muted-foreground">Max {(config.maxSlippage / 100).toFixed(2)}%</div>
              </div>
            </div>
            
            <div className="flex items-center gap-3 p-3 border rounded-lg">
              <CheckCircle className="h-5 w-5 text-green-600" />
              <div>
                <div className="font-medium text-sm">Position Limits</div>
                <div className="text-xs text-muted-foreground">Max {formatUSD(config.maxTradeSize, 0)}</div>
              </div>
            </div>
            
            <div className="flex items-center gap-3 p-3 border rounded-lg">
              <CheckCircle className="h-5 w-5 text-green-600" />
              <div>
                <div className="font-medium text-sm">Profit Threshold</div>
                <div className="text-xs text-muted-foreground">Min {formatUSD(config.minProfit)}</div>
              </div>
            </div>
            
            <div className="flex items-center gap-3 p-3 border rounded-lg">
              <CheckCircle className="h-5 w-5 text-green-600" />
              <div>
                <div className="font-medium text-sm">Circuit Breaker</div>
                <div className="text-xs text-muted-foreground">Auto-stop on losses</div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
