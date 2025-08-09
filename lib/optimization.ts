// Arbitrage Optimization Tips

export interface OptimizationSuggestion {
  type: 'slippage' | 'size' | 'timing' | 'profit'
  message: string
  suggestedValue?: number
  impact?: string
}

/**
 * Analyze arbitrage opportunity and provide optimization suggestions
 */
export function getOptimizationSuggestions(
  opportunity: any,
  maxSlippageBps: number = 500
): OptimizationSuggestion[] {
  const suggestions: OptimizationSuggestion[] = []
  
  // Calculate slippage
  const buySlippage = calculateSlippageImpact(
    opportunity.sizeDollar,
    opportunity.buyQuote.liquidity
  )
  const sellSlippage = calculateSlippageImpact(
    opportunity.sizeDollar,
    opportunity.sellQuote.liquidity
  )
  
  // Slippage optimization
  if (buySlippage > maxSlippageBps || sellSlippage > maxSlippageBps) {
    const maxSlippage = Math.max(buySlippage, sellSlippage)
    const optimalSize = Math.min(
      Math.sqrt(maxSlippageBps / 10000) * opportunity.buyQuote.liquidity,
      Math.sqrt(maxSlippageBps / 10000) * opportunity.sellQuote.liquidity
    )
    
    suggestions.push({
      type: 'slippage',
      message: `High slippage detected (${maxSlippage} bps). Consider reducing trade size.`,
      suggestedValue: Math.round(optimalSize),
      impact: `Reduces slippage to ~${maxSlippageBps} bps`
    })
  }
  
  // Size optimization
  const minLiquidity = Math.min(opportunity.buyQuote.liquidity, opportunity.sellQuote.liquidity)
  if (opportunity.sizeDollar > minLiquidity * 0.1) {
    suggestions.push({
      type: 'size', 
      message: 'Trade size is large relative to liquidity. Consider splitting into smaller trades.',
      suggestedValue: Math.round(minLiquidity * 0.05),
      impact: 'Reduces market impact and slippage'
    })
  }
  
  // Timing optimization
  const now = Date.now() / 1000
  const buyAge = now - opportunity.buyQuote.timestamp
  const sellAge = now - opportunity.sellQuote.timestamp
  
  if (buyAge > 15 || sellAge > 15) {
    suggestions.push({
      type: 'timing',
      message: 'Quote data is getting stale. Execute soon or refresh quotes.',
      impact: 'Prevents execution on outdated prices'
    })
  }
  
  // Profit optimization
  const profitMargin = (opportunity.grossPnlUsd / opportunity.sizeDollar) * 100
  if (profitMargin < 0.5) {
    suggestions.push({
      type: 'profit',
      message: `Low profit margin (${profitMargin.toFixed(2)}%). Consider waiting for better opportunities.`,
      impact: 'Improves risk-adjusted returns'
    })
  }
  
  return suggestions
}

function calculateSlippageImpact(tradeSizeUsd: number, liquidityUsd: number): number {
  if (liquidityUsd === 0) return 10000 // 100% slippage if no liquidity
  
  const ratio = tradeSizeUsd / liquidityUsd
  
  // Approximate slippage curve: quadratic growth
  const slippageBps = Math.min(ratio * ratio * 10000, 10000)
  
  return Math.round(slippageBps)
}
