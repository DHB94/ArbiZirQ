"use client"

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import type { Opportunity, SimulationResult } from '@/lib/types'
import { formatUSD, formatBasisPoints } from '@/lib/format'
import { apiClient } from '@/lib/api'
import { DEFAULT_SETTINGS } from '@/lib/constants'
import { Loader2, TrendingUp, AlertTriangle } from 'lucide-react'

interface SimulateDrawerProps {
  opportunity: Opportunity
  open: boolean
  onOpenChange: (open: boolean) => void
  onComplete: (success: boolean, message: string) => void
}

export function SimulateDrawer({
  opportunity,
  open,
  onOpenChange,
  onComplete,
}: SimulateDrawerProps) {
  const [isSimulating, setIsSimulating] = useState(false)
  const [simulationResult, setSimulationResult] = useState<SimulationResult | null>(null)
  const [maxSlippage, setMaxSlippage] = useState<number>(DEFAULT_SETTINGS.maxSlippageBps)

  const handleSimulate = async () => {
    setIsSimulating(true)
    try {
      const result = await apiClient.simulate({
        ...opportunity,
        maxSlippageBps: maxSlippage, // Use configurable slippage
      })
      
      setSimulationResult(result)
      
      if (result.ok) {
        onComplete(true, `Simulation successful: ${formatUSD(result.netPnlUsd)} net PnL`)
      } else {
        onComplete(false, `Simulation failed: ${result.notes.join(', ')}`)
      }
    } catch (error) {
      onComplete(false, `Simulation error: ${error instanceof Error ? error.message : 'Unknown error'}`)
    } finally {
      setIsSimulating(false)
    }
  }

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Preview Arbitrage Opportunity
          </CardTitle>
          <CardDescription>
            Review opportunity details and test execution parameters
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-6">
          {/* Opportunity Details */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <h4 className="font-medium mb-2">Token Pair</h4>
              <p className="text-sm text-muted-foreground">
                {opportunity.pair.base}/{opportunity.pair.quote}
              </p>
            </div>
            
            <div>
              <h4 className="font-medium mb-2">Route</h4>
              <p className="text-sm text-muted-foreground">
                {opportunity.sourceChain} → {opportunity.targetChain}
              </p>
            </div>
            
            <div>
              <h4 className="font-medium mb-2">Trade Size</h4>
              <p className="text-sm text-muted-foreground">
                {formatUSD(opportunity.sizeDollar, 0)}
              </p>
            </div>
            
            <div>
              <h4 className="font-medium mb-2">Gross PnL</h4>
              <p className="text-sm font-medium text-green-600">
                {formatUSD(opportunity.grossPnlUsd)}
              </p>
            </div>
          </div>

          {/* Quote Details */}
          <div className="grid grid-cols-2 gap-4">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm">Buy Quote</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>DEX:</span>
                  <span>{opportunity.buyQuote.dex}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Price:</span>
                  <span>{opportunity.buyQuote.price.toFixed(6)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Liquidity:</span>
                  <span>{formatUSD(opportunity.buyQuote.liquidity, 0)}</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm">Sell Quote</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>DEX:</span>
                  <span>{opportunity.sellQuote.dex}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Price:</span>
                  <span>{opportunity.sellQuote.price.toFixed(6)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Liquidity:</span>
                  <span>{formatUSD(opportunity.sellQuote.liquidity, 0)}</span>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Simulation Result */}
          {simulationResult && (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm flex items-center gap-2">
                  {simulationResult.ok ? (
                    <div className="h-2 w-2 bg-green-500 rounded-full" />
                  ) : (
                    <AlertTriangle className="h-4 w-4 text-red-500" />
                  )}
                  Simulation Result
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="font-medium">Net PnL:</span>
                  <span className={`font-bold ${simulationResult.netPnlUsd > 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {formatUSD(simulationResult.netPnlUsd)}
                  </span>
                </div>
                
                <div className="space-y-2">
                  <h5 className="font-medium text-sm">Fee Breakdown:</h5>
                  <div className="space-y-1 text-sm">
                    <div className="flex justify-between">
                      <span>Swap Fees:</span>
                      <span>{formatUSD(simulationResult.breakdown.swapFees)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Bridge Fees:</span>
                      <span>{formatUSD(simulationResult.breakdown.bridgeFees)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Gas Estimate:</span>
                      <span>{formatUSD(simulationResult.breakdown.gasEstimate)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Routing Fees:</span>
                      <span>{formatUSD(simulationResult.breakdown.routingFees)}</span>
                    </div>
                    <div className="flex justify-between font-medium border-t pt-1">
                      <span>Total Fees:</span>
                      <span>{formatUSD(simulationResult.breakdown.total)}</span>
                    </div>
                  </div>
                </div>

                {simulationResult.notes.length > 0 && (
                  <div>
                    <h5 className="font-medium text-sm mb-1">Notes:</h5>
                    <ul className="text-sm text-muted-foreground space-y-1">
                      {simulationResult.notes.map((note, index) => (
                        <li key={index} className="flex items-start gap-1">
                          <span className="text-yellow-500 text-xs mt-1">▪</span>
                          {note}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                <div className="flex justify-between text-sm">
                  <span>Slippage Impact:</span>
                  <span>{formatBasisPoints(simulationResult.slippageImpact)}</span>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Slippage Settings */}
          {!simulationResult && (
            <Card>
              <CardContent className="pt-6">
                <div className="space-y-2">
                  <label className="text-sm font-medium">
                    Max Slippage Tolerance
                  </label>
                  <div className="flex items-center gap-2">
                    <Input
                      type="number"
                      value={maxSlippage}
                      onChange={(e) => setMaxSlippage(Number(e.target.value))}
                      min="1"
                      max="2000"
                      step="10"
                      className="w-24"
                    />
                    <span className="text-sm text-muted-foreground">
                      bps ({(maxSlippage / 100).toFixed(1)}%)
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Higher values allow more slippage but increase execution success rate
                  </p>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Actions */}
          <div className="flex justify-between">
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isSimulating}
            >
              Cancel
            </Button>
            
            <div className="flex gap-2">
              {!simulationResult && (
                <Button
                  onClick={handleSimulate}
                  disabled={isSimulating}
                >
                  {isSimulating ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                      Testing...
                    </>
                  ) : (
                    'Test Parameters'
                  )}
                </Button>
              )}
              
              {simulationResult?.ok && (
                <Button
                  onClick={() => {
                    onOpenChange(false)
                    // This will trigger the execute dialog
                  }}
                >
                  Proceed to Execute
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
