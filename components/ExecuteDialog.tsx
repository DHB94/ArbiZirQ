"use client"

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import type { Opportunity, ExecutionResult } from '@/lib/types'
import { formatUSD, getExplorerUrl } from '@/lib/format'
import { apiClient } from '@/lib/api'
import { Loader2, Zap, ExternalLink, CheckCircle, AlertTriangle, DollarSign, Activity } from 'lucide-react'

interface ExecuteDialogProps {
  opportunity: Opportunity
  open: boolean
  onOpenChange: (open: boolean) => void
  onComplete: (success: boolean, message: string) => void
}

export function ExecuteDialog({
  opportunity,
  open,
  onOpenChange,
  onComplete,
}: ExecuteDialogProps) {
  const [isExecuting, setIsExecuting] = useState(false)
  const [executionResult, setExecutionResult] = useState<ExecutionResult | null>(null)
  const [maxSlippage, setMaxSlippage] = useState(100) // 1% in basis points
  const [realExecution, setRealExecution] = useState(true) // Default to REAL execution
  const [confirmed, setConfirmed] = useState(false)

  const handleExecute = async () => {
    if (!confirmed) return

    setIsExecuting(true)
    try {
      console.log(realExecution ? '🚀 Executing REAL arbitrage trade' : '🧪 Running simulation')
      
      const result = await apiClient.execute({
        ...opportunity,
        maxSlippageBps: maxSlippage,
        dryRun: !realExecution, // Invert: realExecution=true means dryRun=false
      })
      
      setExecutionResult(result)
      onComplete(
        true, 
        realExecution 
          ? `🎉 REAL EXECUTION SUCCESSFUL! Tx: ${result.txHash}` 
          : `Simulation completed successfully`
      )
    } catch (error) {
      onComplete(false, `Execution failed: ${error instanceof Error ? error.message : 'Unknown error'}`)
    } finally {
      setIsExecuting(false)
    }
  }

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
      <Card className="w-full max-w-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5" />
            Execute Arbitrage
          </CardTitle>
          <CardDescription>
            Confirm execution parameters
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-4">
          {!executionResult ? (
            <>
              {/* Execution Summary */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm">Execution Summary</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Pair:</span>
                    <span>{opportunity.pair.base}/{opportunity.pair.quote}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Route:</span>
                    <span>{opportunity.sourceChain} → {opportunity.targetChain}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Trade Size:</span>
                    <span>{formatUSD(opportunity.sizeDollar, 0)}</span>
                  </div>
                  <div className="flex justify-between text-sm font-medium">
                    <span>Expected PnL:</span>
                    <span className="text-green-600">
                      {formatUSD(opportunity.grossPnlUsd)}
                    </span>
                  </div>
                </CardContent>
              </Card>

              {/* Execution Mode Selector */}
              <div>
                <label className="text-sm font-medium mb-3 block">
                  Execution Mode
                </label>
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <input
                      type="radio"
                      id="real"
                      name="executionMode"
                      checked={realExecution}
                      onChange={() => setRealExecution(true)}
                    />
                    <label htmlFor="real" className="text-sm flex items-center gap-2">
                      <DollarSign className="h-4 w-4 text-green-600" />
                      <span className="font-medium">Real Execution</span>
                      <Badge variant="default" className="bg-green-100 text-green-800">LIVE</Badge>
                    </label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <input
                      type="radio"
                      id="simulation"
                      name="executionMode"
                      checked={!realExecution}
                      onChange={() => setRealExecution(false)}
                    />
                    <label htmlFor="simulation" className="text-sm flex items-center gap-2">
                      <Activity className="h-4 w-4 text-blue-600" />
                      <span className="font-medium">Simulation Only</span>
                      <Badge variant="outline" className="border-blue-200 text-blue-600">TEST</Badge>
                    </label>
                  </div>
                </div>
                <p className="text-xs text-muted-foreground mt-2">
                  {realExecution 
                    ? '⚠️ Real execution will use actual funds and execute trades on-chain'
                    : '🧪 Simulation mode will only test the execution without spending funds'
                  }
                </p>
              </div>

              {/* Slippage Setting */}
              <div>
                <label className="text-sm font-medium mb-2 block">
                  Maximum Slippage (basis points)
                </label>
                <Input
                  type="number"
                  value={maxSlippage}
                  onChange={(e) => setMaxSlippage(Number(e.target.value))}
                  min="1"
                  max="500"
                  placeholder="100"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Current: {(maxSlippage / 100).toFixed(2)}% ({maxSlippage} bps)
                </p>
              </div>

              {/* Confirmation Checkbox */}
              <div className="flex items-start space-x-2">
                <input
                  type="checkbox"
                  id="confirm"
                  checked={confirmed}
                  onChange={(e) => setConfirmed(e.target.checked)}
                  className="mt-1"
                />
                <label htmlFor="confirm" className="text-sm">
                  I understand that market conditions can change and this 
                  execution may result in losses. I accept the risks.
                </label>
              </div>

              {/* Risk Warning */}
              <Card className={realExecution ? "border-red-200 bg-red-50" : "border-blue-200 bg-blue-50"}>
                <CardContent className="pt-4">
                  <div className="flex items-start gap-2">
                    <AlertTriangle className={`h-4 w-4 mt-0.5 ${realExecution ? 'text-red-600' : 'text-blue-600'}`} />
                    <div className="text-sm">
                      <p className={`font-medium ${realExecution ? 'text-red-800' : 'text-blue-800'}`}>
                        {realExecution ? '🚨 REAL EXECUTION WARNING' : '🧪 Simulation Mode'}
                      </p>
                      <p className={`mt-1 ${realExecution ? 'text-red-700' : 'text-blue-700'}`}>
                        {realExecution 
                          ? 'This will execute REAL trades with REAL funds using DEX swaps and cross-chain bridges. You may lose money due to slippage, failed transactions, or market changes.'
                          : 'This is a simulation and will not execute real trades or spend any funds. Use this to test strategy without risk.'
                        }
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </>
          ) : (
            /* Execution Result */
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  Execution Complete
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span>Transaction Hash:</span>
                  <a
                    href={getExplorerUrl(opportunity.targetChain, executionResult.txHash)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1 text-blue-600 hover:text-blue-800"
                  >
                    {executionResult.txHash.slice(0, 10)}...
                    <ExternalLink className="h-3 w-3" />
                  </a>
                </div>
                
                {executionResult.zircuitLatencyMs && (
                  <div className="flex justify-between text-sm">
                    <span>Settlement Time:</span>
                    <span>{executionResult.zircuitLatencyMs}ms</span>
                  </div>
                )}
                
                {executionResult.actualPnlUsd && (
                  <div className="flex justify-between text-sm font-medium">
                    <span>Actual PnL:</span>
                    <span className={executionResult.actualPnlUsd > 0 ? 'text-green-600' : 'text-red-600'}>
                      {formatUSD(executionResult.actualPnlUsd)}
                    </span>
                  </div>
                )}
                
                <div className="text-xs text-muted-foreground">
                  Execution completed successfully. Settlement on Zircuit L2.
                </div>
              </CardContent>
            </Card>
          )}

          {/* Actions */}
          <div className="flex justify-between">
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isExecuting}
            >
              {executionResult ? 'Close' : 'Cancel'}
            </Button>
            
            {!executionResult && (
              <Button
                onClick={handleExecute}
                disabled={isExecuting || !confirmed}
                className={realExecution 
                  ? "bg-red-600 hover:bg-red-700 text-white" 
                  : "bg-blue-600 hover:bg-blue-700 text-white"
                }
              >
                {isExecuting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    {realExecution ? 'Executing Real Trade...' : 'Running Simulation...'}
                  </>
                ) : (
                  <>
                    {realExecution ? (
                      <>
                        <DollarSign className="h-4 w-4 mr-2" />
                        Execute REAL Arbitrage
                      </>
                    ) : (
                      <>
                        <Activity className="h-4 w-4 mr-2" />
                        Run Simulation
                      </>
                    )}
                  </>
                )}
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
