// Guardrails and validation utilities

import type { Opportunity, ScanRequest } from './types'
import { DEFAULT_SETTINGS, GUARDRAILS } from './constants'

/**
 * Validate environment variables
 */
export function validateEnvironment(): {
  isValid: boolean
  missing: string[]
  warnings: string[]
} {
  const required = ['ZIRCUIT_RPC_URL', 'GUD_API_KEY', 'BITTE_API_KEY']
  const optional = ['ETHEREUM_RPC_URL', 'POLYGON_RPC_URL']
  
  const missing: string[] = []
  const warnings: string[] = []
  
  // Check required variables
  for (const key of required) {
    if (!process.env[key]) {
      missing.push(key)
    }
  }
  
  // Check optional variables
  for (const key of optional) {
    if (!process.env[key]) {
      warnings.push(`${key} not set, using default RPC`)
    }
  }
  
  return {
    isValid: missing.length === 0,
    missing,
    warnings,
  }
}

/**
 * Validate scan request parameters
 */
export function validateScanRequest(request: Partial<ScanRequest>): {
  isValid: boolean
  errors: string[]
} {
  const errors: string[] = []
  
  if (!request.pairs || request.pairs.length === 0) {
    errors.push('At least one token pair is required')
  }
  
  if (!request.chains || request.chains.length === 0) {
    errors.push('At least one chain is required')
  }
  
  if (request.chains && request.chains.length < 2) {
    errors.push('At least two chains are required for arbitrage')
  }
  
  if (request.minProfitUsd !== undefined && request.minProfitUsd < 0) {
    errors.push('Minimum profit must be non-negative')
  }
  
  if (request.maxSlippageBps !== undefined && request.maxSlippageBps < 0) {
    errors.push('Maximum slippage must be non-negative')
  }
  
  if (request.maxSlippageBps !== undefined && request.maxSlippageBps > GUARDRAILS.maxSlippageBps) {
    errors.push(`Maximum slippage cannot exceed ${GUARDRAILS.maxSlippageBps} bps`)
  }
  
  return {
    isValid: errors.length === 0,
    errors,
  }
}

/**
 * Validate opportunity before simulation
 */
export function validateOpportunity(opportunity: Opportunity): {
  isValid: boolean
  errors: string[]
  warnings: string[]
} {
  const errors: string[] = []
  const warnings: string[] = []
  const now = Date.now() / 1000
  
  // Required fields
  if (!opportunity.id) errors.push('Opportunity ID is required')
  if (!opportunity.pair) errors.push('Token pair is required')
  if (!opportunity.sourceChain) errors.push('Source chain is required')
  if (!opportunity.targetChain) errors.push('Target chain is required')
  
  // Chain validation
  if (opportunity.sourceChain === opportunity.targetChain) {
    errors.push('Source and target chains must be different')
  }
  
  // Quote validation
  if (!opportunity.buyQuote || !opportunity.sellQuote) {
    errors.push('Both buy and sell quotes are required')
  } else {
    // Quote freshness
    const buyAge = now - opportunity.buyQuote.timestamp
    const sellAge = now - opportunity.sellQuote.timestamp
    
    if (buyAge > GUARDRAILS.maxQuoteAgeSeconds) {
      warnings.push(`Buy quote is ${Math.round(buyAge)}s old`)
    }
    
    if (sellAge > GUARDRAILS.maxQuoteAgeSeconds) {
      warnings.push(`Sell quote is ${Math.round(sellAge)}s old`)
    }
    
    // Price sanity check
    if (opportunity.buyQuote.price <= 0) {
      errors.push('Buy quote price must be positive')
    }
    
    if (opportunity.sellQuote.price <= 0) {
      errors.push('Sell quote price must be positive')
    }
    
    // Liquidity check
    if (opportunity.buyQuote.liquidity < GUARDRAILS.minLiquidityUsd) {
      warnings.push(`Low buy liquidity: $${opportunity.buyQuote.liquidity}`)
    }
    
    if (opportunity.sellQuote.liquidity < GUARDRAILS.minLiquidityUsd) {
      warnings.push(`Low sell liquidity: $${opportunity.sellQuote.liquidity}`)
    }
  }
  
  // Trade size validation
  if (opportunity.sizeDollar <= 0) {
    errors.push('Trade size must be positive')
  }
  
  if (opportunity.sizeDollar > GUARDRAILS.maxTradeSize) {
    warnings.push(`Large trade size: $${opportunity.sizeDollar}`)
  }
  
  // PnL validation
  if (opportunity.grossPnlUsd < 0) {
    warnings.push('Negative gross PnL')
  }
  
  return {
    isValid: errors.length === 0,
    errors,
    warnings,
  }
}

/**
 * Check if opportunity meets minimum profitability requirements
 */
export function meetsMinimumProfit(
  opportunity: Opportunity,
  minProfitUsd: number = DEFAULT_SETTINGS.minProfitUsd
): boolean {
  return opportunity.grossPnlUsd >= minProfitUsd
}

/**
 * Check if opportunity has acceptable slippage
 */
export function hasAcceptableSlippage(
  opportunity: Opportunity,
  maxSlippageBps: number = DEFAULT_SETTINGS.maxSlippageBps
): boolean {
  const buySlippage = estimateSlippage(opportunity.sizeDollar, opportunity.buyQuote.liquidity)
  const sellSlippage = estimateSlippage(opportunity.sizeDollar, opportunity.sellQuote.liquidity)
  
  return Math.max(buySlippage, sellSlippage) <= maxSlippageBps
}

/**
 * Estimate slippage for a trade
 */
function estimateSlippage(tradeSizeUsd: number, liquidityUsd: number): number {
  if (liquidityUsd === 0) return 10000 // 100% slippage
  
  const ratio = tradeSizeUsd / liquidityUsd
  return Math.min(ratio * ratio * 10000, 10000) // Quadratic slippage model
}

/**
 * Check if quotes are fresh enough
 */
export function hasRecentQuotes(
  opportunity: Opportunity,
  maxAgeSeconds: number = GUARDRAILS.maxQuoteAgeSeconds
): boolean {
  const now = Date.now() / 1000
  const buyAge = now - opportunity.buyQuote.timestamp
  const sellAge = now - opportunity.sellQuote.timestamp
  
  return buyAge <= maxAgeSeconds && sellAge <= maxAgeSeconds
}

/**
 * Get overall opportunity health score (0-100)
 */
export function getOpportunityScore(opportunity: Opportunity): number {
  let score = 100
  const now = Date.now() / 1000
  
  // Deduct points for old quotes
  const maxAge = Math.max(
    now - opportunity.buyQuote.timestamp,
    now - opportunity.sellQuote.timestamp
  )
  
  if (maxAge > 30) score -= Math.min(30, maxAge - 30) // -1 per second after 30s
  
  // Deduct points for low liquidity
  const minLiquidity = Math.min(
    opportunity.buyQuote.liquidity,
    opportunity.sellQuote.liquidity
  )
  
  if (minLiquidity < 10000) {
    score -= (10000 - minLiquidity) / 200 // -0.5 per $100 below $10K
  }
  
  // Deduct points for high slippage
  const buySlippage = estimateSlippage(opportunity.sizeDollar, opportunity.buyQuote.liquidity)
  const sellSlippage = estimateSlippage(opportunity.sizeDollar, opportunity.sellQuote.liquidity)
  const maxSlippage = Math.max(buySlippage, sellSlippage)
  
  if (maxSlippage > 50) {
    score -= (maxSlippage - 50) / 10 // -0.1 per bp over 50bps
  }
  
  // Bonus points for high profit ratio
  const profitRatio = opportunity.grossPnlUsd / opportunity.sizeDollar
  if (profitRatio > 0.01) { // > 1%
    score += Math.min(20, profitRatio * 1000) // Up to +20 points
  }
  
  return Math.max(0, Math.min(100, Math.round(score)))
}

/**
 * Rate limit check for API calls
 */
export function checkRateLimit(
  key: string,
  maxRequests: number = 60,
  windowMs: number = 60000
): { allowed: boolean; remaining: number; resetTime: number } {
  // In a real implementation, this would use Redis or in-memory cache
  // For now, we'll implement a simple in-memory rate limiter
  
  const now = Date.now()
  const windowStart = now - windowMs
  
  // This is a simplified implementation
  // In production, use a proper rate limiting library
  return {
    allowed: true,
    remaining: maxRequests - 1,
    resetTime: now + windowMs,
  }
}

/**
 * Sanitize user input for logs and display
 */
export function sanitizeInput(input: string): string {
  return input
    .replace(/[<>]/g, '') // Remove potential HTML
    .replace(/javascript:/gi, '') // Remove JS URLs
    .trim()
    .slice(0, 1000) // Limit length
}
