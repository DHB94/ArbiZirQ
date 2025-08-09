"use client"

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import type { Opportunity } from '@/lib/types'
import { formatUSD, formatTimeAgo, formatRoute, getStatusColor, getPnLColor } from '@/lib/format'
import { Eye, Play, AlertCircle, Loader2 } from 'lucide-react'

interface OpportunityTableProps {
  opportunities: Opportunity[]
  isLoading: boolean
  error?: Error
  onSimulate: (opportunity: Opportunity) => void
  onExecute: (opportunity: Opportunity) => void
}

export function OpportunityTable({
  opportunities,
  isLoading,
  error,
  onSimulate,
  onExecute,
}: OpportunityTableProps) {
  const [processingIds, setProcessingIds] = useState<Set<string>>(new Set())

  const handleSimulate = async (opportunity: Opportunity) => {
    setProcessingIds(prev => new Set(prev).add(opportunity.id))
    try {
      await onSimulate(opportunity)
    } finally {
      setProcessingIds(prev => {
        const next = new Set(prev)
        next.delete(opportunity.id)
        return next
      })
    }
  }

  const handleExecute = async (opportunity: Opportunity) => {
    setProcessingIds(prev => new Set(prev).add(opportunity.id))
    try {
      await onExecute(opportunity)
    } finally {
      setProcessingIds(prev => {
        const next = new Set(prev)
        next.delete(opportunity.id)
        return next
      })
    }
  }

  if (error) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-8">
          <div className="text-center">
            <AlertCircle className="h-8 w-8 text-red-500 mx-auto mb-2" />
            <p className="text-sm text-muted-foreground">
              Failed to load opportunities: {error.message}
            </p>
            <Button 
              variant="outline" 
              size="sm" 
              className="mt-2"
              onClick={() => window.location.reload()}
            >
              Retry
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (isLoading) {
    return (
      <Card>
        <CardContent className="py-8">
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="flex items-center space-x-4">
                  <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                  <div className="h-4 bg-gray-200 rounded w-1/6"></div>
                  <div className="h-4 bg-gray-200 rounded w-1/6"></div>
                  <div className="h-4 bg-gray-200 rounded w-1/6"></div>
                  <div className="h-4 bg-gray-200 rounded w-1/6"></div>
                  <div className="h-8 bg-gray-200 rounded w-20"></div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  if (opportunities.length === 0) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-8">
          <div className="text-center">
            <div className="text-4xl mb-2">🔍</div>
            <p className="text-sm text-muted-foreground">
              No arbitrage opportunities found
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              Try adjusting your filters or wait for market conditions to change
            </p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="border-b">
            <th className="text-left py-3 px-4 font-medium">Pair</th>
            <th className="text-left py-3 px-4 font-medium">Route</th>
            <th className="text-left py-3 px-4 font-medium">Size</th>
            <th className="text-left py-3 px-4 font-medium">Gross PnL</th>
            <th className="text-left py-3 px-4 font-medium">Freshness</th>
            <th className="text-left py-3 px-4 font-medium">Status</th>
            <th className="text-left py-3 px-4 font-medium">Actions</th>
          </tr>
        </thead>
        <tbody>
          {opportunities.map((opportunity) => {
            const isProcessing = processingIds.has(opportunity.id)
            
            return (
              <tr key={opportunity.id} className="border-b hover:bg-muted/50">
                <td className="py-3 px-4">
                  <div className="font-medium">
                    {opportunity.pair.base}/{opportunity.pair.quote}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    ID: {opportunity.id.slice(-8)}
                  </div>
                </td>
                
                <td className="py-3 px-4">
                  <div className="text-sm">
                    {formatRoute(opportunity.sourceChain, opportunity.targetChain)}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {opportunity.buyQuote.dex} → {opportunity.sellQuote.dex}
                  </div>
                </td>
                
                <td className="py-3 px-4">
                  <div className="font-medium">
                    {formatUSD(opportunity.sizeDollar, 0)}
                  </div>
                </td>
                
                <td className="py-3 px-4">
                  <div className={`font-medium ${getPnLColor(opportunity.grossPnlUsd)}`}>
                    {formatUSD(opportunity.grossPnlUsd)}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {((opportunity.grossPnlUsd / opportunity.sizeDollar) * 100).toFixed(2)}%
                  </div>
                </td>
                
                <td className="py-3 px-4">
                  <div className="text-sm">
                    {formatTimeAgo(Math.max(
                      opportunity.buyQuote.timestamp,
                      opportunity.sellQuote.timestamp
                    ))}
                  </div>
                </td>
                
                <td className="py-3 px-4">
                  <Badge 
                    variant="secondary" 
                    className={getStatusColor(opportunity.status)}
                  >
                    {opportunity.status.toUpperCase()}
                  </Badge>
                </td>
                
                <td className="py-3 px-4">
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleSimulate(opportunity)}
                      disabled={isProcessing}
                    >
                      {isProcessing ? (
                        <Loader2 className="h-3 w-3 animate-spin" />
                      ) : (
                        <Eye className="h-3 w-3" />
                      )}
                      <span className="ml-1">Simulate</span>
                    </Button>
                    
                    {opportunity.status === 'simulated' && (
                      <Button
                        variant="default"
                        size="sm"
                        onClick={() => handleExecute(opportunity)}
                        disabled={isProcessing}
                      >
                        {isProcessing ? (
                          <Loader2 className="h-3 w-3 animate-spin" />
                        ) : (
                          <Play className="h-3 w-3" />
                        )}
                        <span className="ml-1">Execute</span>
                      </Button>
                    )}
                  </div>
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}
