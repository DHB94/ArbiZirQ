// Fee calculation utilities for arbitrage PnL analysis

import type { FeeBreakdown, SimulationResult, Opportunity } from './types'

/**
 * Calculate net PnL after all fees
 */
export function calculateNetPnL(
  grossPnlUsd: number,
  fees: FeeBreakdown
): number {
  return grossPnlUsd - fees.total
}

/**
 * Calculate total fees from breakdown
 */
export function calculateTotalFees(
  swapFees: number,
  bridgeFees: number,
  gasEstimate: number,
  routingFees: number
): number {
  return swapFees + bridgeFees + gasEstimate + routingFees
}

/**
 * Estimate GUD routing fees (typically 0.1-0.3% of trade size)
 */
export function estimateGudFees(tradeSizeUsd: number): number {
  const basisPoints = 20 // 0.2%
  return (tradeSizeUsd * basisPoints) / 10000
}

/**
 * Estimate bridge fees based on chains and trade size
 */
export function estimateBridgeFees(
  sourceChain: string,
  targetChain: string,
  tradeSizeUsd: number
): number {
  // Base bridge fee + percentage
  const baseFees: Record<string, number> = {
    ethereum: 15, // Higher gas
    polygon: 2,
    zircuit: 1,
    arbitrum: 3,
    optimism: 3,
  }
  
  const baseFee = (baseFees[sourceChain] || 5) + (baseFees[targetChain] || 5)
  const percentageFee = tradeSizeUsd * 0.001 // 0.1%
  
  return baseFee + percentageFee
}

/**
 * Estimate gas costs in USD for multi-chain operations
 */
export function estimateGasCosts(
  sourceChain: string,
  targetChain: string,
  tradeSizeUsd: number
): number {
  const gasMultipliers: Record<string, number> = {
    ethereum: 20,
    polygon: 0.1,
    zircuit: 0.5,
    arbitrum: 1,
    optimism: 1,
  }
  
  const sourceGas = gasMultipliers[sourceChain] || 2
  const targetGas = gasMultipliers[targetChain] || 2
  
  // Complex arbitrage typically requires 3-4 transactions
  return (sourceGas + targetGas) * 3
}

/**
 * Estimate DEX swap fees (typically 0.05-0.3% depending on DEX)
 */
export function estimateSwapFees(
  dexName: string,
  tradeSizeUsd: number
): number {
  const feeRates: Record<string, number> = {
    'uniswap-v3': 5, // 0.05%
    'uniswap-v2': 30, // 0.3%
    'sushiswap': 30,
    'quickswap': 25,
    'balancer': 10,
    'curve': 4,
  }
  
  const basisPoints = feeRates[dexName.toLowerCase()] || 25 // Default 0.25%
  return (tradeSizeUsd * basisPoints) / 10000
}

/**
 * Calculate slippage impact based on trade size and liquidity
 */
export function calculateSlippageImpact(
  tradeSizeUsd: number,
  liquidityUsd: number
): number {
  if (liquidityUsd === 0) return 10000 // 100% slippage if no liquidity
  
  const ratio = tradeSizeUsd / liquidityUsd
  
  // Approximate slippage curve: quadratic growth
  const slippageBps = Math.min(ratio * ratio * 10000, 10000)
  
  return Math.round(slippageBps)
}

/**
 * Check if opportunity passes guardrails
 */
export function passesGuardrails(
  opportunity: Opportunity,
  minProfitUsd: number,
  maxSlippageBps: number,
  maxQuoteAge: number = 30 // seconds
): { passes: boolean; reasons: string[] } {
  const reasons: string[] = []
  const now = Date.now() / 1000
  
  // Check quote freshness
  if (now - opportunity.buyQuote.timestamp > maxQuoteAge) {
    reasons.push('Buy quote too old')
  }
  if (now - opportunity.sellQuote.timestamp > maxQuoteAge) {
    reasons.push('Sell quote too old')
  }
  
  // Check minimum profit
  if (opportunity.grossPnlUsd < minProfitUsd) {
    reasons.push(`Gross PnL below minimum: $${opportunity.grossPnlUsd} < $${minProfitUsd}`)
  }
  
  // Check slippage for each quote
  const buySlippage = calculateSlippageImpact(
    opportunity.sizeDollar,
    opportunity.buyQuote.liquidity
  )
  const sellSlippage = calculateSlippageImpact(
    opportunity.sizeDollar,
    opportunity.sellQuote.liquidity
  )
  
  if (buySlippage > maxSlippageBps) {
    reasons.push(`Buy slippage too high: ${buySlippage} bps > ${maxSlippageBps} bps`)
  }
  if (sellSlippage > maxSlippageBps) {
    reasons.push(`Sell slippage too high: ${sellSlippage} bps > ${maxSlippageBps} bps`)
  }
  
  return {
    passes: reasons.length === 0,
    reasons,
  }
}

/**
 * Simulate complete arbitrage execution
 */
export function simulateArbitrage(
  opportunity: Opportunity,
  maxSlippageBps: number = 100
): SimulationResult {
  const { passes, reasons } = passesGuardrails(
    opportunity,
    1, // Min $1 profit for simulation
    maxSlippageBps
  )
  
  if (!passes) {
    return {
      netPnlUsd: 0,
      ok: false,
      breakdown: {
        swapFees: 0,
        bridgeFees: 0,
        gasEstimate: 0,
        routingFees: 0,
        total: 0,
      },
      notes: reasons,
      slippageImpact: 0,
    }
  }
  
  // Calculate fee breakdown
  const swapFees = 
    estimateSwapFees(opportunity.buyQuote.dex, opportunity.sizeDollar) +
    estimateSwapFees(opportunity.sellQuote.dex, opportunity.sizeDollar)
    
  const bridgeFees = estimateBridgeFees(
    opportunity.sourceChain,
    opportunity.targetChain,
    opportunity.sizeDollar
  )
  
  const gasEstimate = estimateGasCosts(
    opportunity.sourceChain,
    opportunity.targetChain,
    opportunity.sizeDollar
  )
  
  const routingFees = estimateGudFees(opportunity.sizeDollar)
  
  const breakdown: FeeBreakdown = {
    swapFees,
    bridgeFees,
    gasEstimate,
    routingFees,
    total: calculateTotalFees(swapFees, bridgeFees, gasEstimate, routingFees),
  }
  
  const netPnlUsd = calculateNetPnL(opportunity.grossPnlUsd, breakdown)
  
  const slippageImpact = Math.max(
    calculateSlippageImpact(opportunity.sizeDollar, opportunity.buyQuote.liquidity),
    calculateSlippageImpact(opportunity.sizeDollar, opportunity.sellQuote.liquidity)
  )
  
  const notes: string[] = []
  if (slippageImpact > 50) {
    notes.push(`High slippage risk: ${slippageImpact} bps`)
  }
  if (breakdown.total > opportunity.grossPnlUsd * 0.5) {
    notes.push('High fee ratio compared to gross profit')
  }
  
  return {
    netPnlUsd,
    ok: netPnlUsd > 0 && slippageImpact <= maxSlippageBps,
    breakdown,
    notes,
    slippageImpact,
  }
}
