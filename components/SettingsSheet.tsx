"use client"

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import type { ScanRequest, Chain, TokenPair } from '@/lib/types'
import { SUPPORTED_CHAINS, DEFAULT_TOKEN_PAIRS } from '@/lib/constants'
import { X, Settings, Plus, Trash2 } from 'lucide-react'

interface SettingsSheetProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  scanRequest: ScanRequest
  onScanRequestChange: (request: ScanRequest) => void
  pollingEnabled: boolean
  onPollingEnabledChange: (enabled: boolean) => void
  pollingInterval: number
  onPollingIntervalChange: (interval: number) => void
}

export function SettingsSheet({
  open,
  onOpenChange,
  scanRequest,
  onScanRequestChange,
  pollingEnabled,
  onPollingEnabledChange,
  pollingInterval,
  onPollingIntervalChange,
}: SettingsSheetProps) {
  const [newTokenBase, setNewTokenBase] = useState('')
  const [newTokenQuote, setNewTokenQuote] = useState('')

  const addTokenPair = () => {
    if (newTokenBase && newTokenQuote) {
      const newPair: TokenPair = {
        base: newTokenBase.toUpperCase(),
        quote: newTokenQuote.toUpperCase(),
      }
      
      // Check if pair already exists
      const exists = scanRequest.pairs.some(
        p => p.base === newPair.base && p.quote === newPair.quote
      )
      
      if (!exists) {
        onScanRequestChange({
          ...scanRequest,
          pairs: [...scanRequest.pairs, newPair],
        })
      }
      
      setNewTokenBase('')
      setNewTokenQuote('')
    }
  }

  const removeTokenPair = (index: number) => {
    const newPairs = scanRequest.pairs.filter((_, i) => i !== index)
    onScanRequestChange({
      ...scanRequest,
      pairs: newPairs,
    })
  }

  const toggleChain = (chain: Chain) => {
    const currentChains = scanRequest.chains
    const newChains = currentChains.includes(chain)
      ? currentChains.filter(c => c !== chain)
      : [...currentChains, chain]
    
    // Ensure at least 2 chains are selected
    if (newChains.length >= 2) {
      onScanRequestChange({
        ...scanRequest,
        chains: newChains,
      })
    }
  }

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 bg-black/50">
      <div className="fixed right-0 top-0 h-full w-full max-w-md bg-background shadow-xl overflow-y-auto">
        <div className="p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <Settings className="h-5 w-5" />
              <h2 className="text-lg font-semibold">Settings</h2>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onOpenChange(false)}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>

          <div className="space-y-6">
            {/* Polling Settings */}
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Polling Settings</CardTitle>
                <CardDescription>Configure automatic market scanning</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Enable Polling</span>
                  <button
                    type="button"
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      pollingEnabled ? 'bg-blue-600' : 'bg-gray-200'
                    }`}
                    onClick={() => onPollingEnabledChange(!pollingEnabled)}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        pollingEnabled ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>
                
                <div>
                  <label className="text-sm font-medium mb-2 block">
                    Interval (seconds)
                  </label>
                  <Input
                    type="number"
                    value={pollingInterval / 1000}
                    onChange={(e) => onPollingIntervalChange(Number(e.target.value) * 1000)}
                    min="3"
                    max="60"
                    disabled={!pollingEnabled}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Profit Settings */}
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Profit Thresholds</CardTitle>
                <CardDescription>Set minimum profitability requirements</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">
                    Minimum Profit (USD)
                  </label>
                  <Input
                    type="number"
                    value={scanRequest.minProfitUsd}
                    onChange={(e) => onScanRequestChange({
                      ...scanRequest,
                      minProfitUsd: Number(e.target.value),
                    })}
                    min="1"
                    step="0.01"
                  />
                </div>
                
                <div>
                  <label className="text-sm font-medium mb-2 block">
                    Max Slippage (basis points)
                  </label>
                  <Input
                    type="number"
                    value={scanRequest.maxSlippageBps}
                    onChange={(e) => onScanRequestChange({
                      ...scanRequest,
                      maxSlippageBps: Number(e.target.value),
                    })}
                    min="1"
                    max="500"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Current: {(scanRequest.maxSlippageBps / 100).toFixed(2)}%
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Chain Selection */}
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Supported Chains</CardTitle>
                <CardDescription>Select chains to monitor (minimum 2)</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-2">
                  {SUPPORTED_CHAINS.map((chain) => (
                    <button
                      key={chain}
                      type="button"
                      onClick={() => toggleChain(chain)}
                      className={`p-2 rounded-md text-sm border transition-colors ${
                        scanRequest.chains.includes(chain)
                          ? 'bg-blue-100 border-blue-300 text-blue-800'
                          : 'bg-gray-50 border-gray-200 text-gray-600 hover:bg-gray-100'
                      }`}
                    >
                      {chain.charAt(0).toUpperCase() + chain.slice(1)}
                    </button>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Token Pairs */}
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Token Pairs</CardTitle>
                <CardDescription>Manage pairs to monitor for arbitrage</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Current Pairs */}
                <div className="space-y-2">
                  {scanRequest.pairs.map((pair, index) => (
                    <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                      <span className="text-sm font-medium">
                        {pair.base}/{pair.quote}
                      </span>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeTokenPair(index)}
                        className="h-6 w-6 p-0 text-red-500 hover:text-red-700"
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  ))}
                </div>

                {/* Add New Pair */}
                <div className="space-y-2">
                  <div className="grid grid-cols-2 gap-2">
                    <Input
                      placeholder="Base (e.g., USDC)"
                      value={newTokenBase}
                      onChange={(e) => setNewTokenBase(e.target.value)}
                    />
                    <Input
                      placeholder="Quote (e.g., USDT)"
                      value={newTokenQuote}
                      onChange={(e) => setNewTokenQuote(e.target.value)}
                    />
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={addTokenPair}
                    disabled={!newTokenBase || !newTokenQuote}
                    className="w-full"
                  >
                    <Plus className="h-3 w-3 mr-1" />
                    Add Pair
                  </Button>
                </div>

                {/* Quick Add Default Pairs */}
                <div>
                  <p className="text-xs text-muted-foreground mb-2">Quick add:</p>
                  <div className="flex flex-wrap gap-1">
                    {DEFAULT_TOKEN_PAIRS.map((pair, index) => {
                      const exists = scanRequest.pairs.some(
                        p => p.base === pair.base && p.quote === pair.quote
                      )
                      
                      if (exists) return null
                      
                      return (
                        <button
                          key={index}
                          type="button"
                          onClick={() => onScanRequestChange({
                            ...scanRequest,
                            pairs: [...scanRequest.pairs, pair],
                          })}
                          className="text-xs px-2 py-1 bg-gray-100 hover:bg-gray-200 rounded"
                        >
                          {pair.base}/{pair.quote}
                        </button>
                      )
                    })}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* API Status */}
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">API Status</CardTitle>
                <CardDescription>Service connectivity status</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Zircuit RPC</span>
                    <Badge variant="secondary" className="bg-green-100 text-green-800">
                      ✅ Connected
                    </Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">GUD Trading Engine</span>
                    <Badge variant="secondary" className="bg-green-100 text-green-800">
                      ✅ Connected
                    </Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Bitte Orchestrator</span>
                    <Badge variant="secondary" className="bg-green-100 text-green-800">
                      ✅ Connected
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
