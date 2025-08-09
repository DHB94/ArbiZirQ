import { describe, it, expect, vi, beforeEach } from 'vitest'
import { calculateNetPnL, simulateArbitrage, passesGuardrails } from '@/lib/math'
import type { Opportunity, FeeBreakdown } from '@/lib/types'

describe('Math Utilities', () => {
  describe('calculateNetPnL', () => {
    it('should calculate net PnL correctly', () => {
      const grossPnl = 100
      const fees: FeeBreakdown = {
        swapFees: 10,
        bridgeFees: 5,
        gasEstimate: 15,
        routingFees: 5,
        total: 35,
      }

      const result = calculateNetPnL(grossPnl, fees)
      expect(result).toBe(65)
    })

    it('should handle negative net PnL', () => {
      const grossPnl = 20
      const fees: FeeBreakdown = {
        swapFees: 15,
        bridgeFees: 10,
        gasEstimate: 20,
        routingFees: 5,
        total: 50,
      }

      const result = calculateNetPnL(grossPnl, fees)
      expect(result).toBe(-30)
    })
  })

  describe('simulateArbitrage', () => {
    const mockOpportunity: Opportunity = {
      id: 'test-opportunity',
      pair: { base: 'USDC', quote: 'USDT' },
      sourceChain: 'ethereum',
      targetChain: 'polygon',
      buyQuote: {
        dex: 'uniswap-v3',
        chain: 'ethereum',
        pair: { base: 'USDC', quote: 'USDT' },
        price: 0.9995,
        liquidity: 1000000, // $1M liquidity for low slippage
        timestamp: Math.floor(Date.now() / 1000) - 10, // 10 seconds ago
      },
      sellQuote: {
        dex: 'quickswap',
        chain: 'polygon',
        pair: { base: 'USDC', quote: 'USDT' },
        price: 1.0005,
        liquidity: 1000000, // $1M liquidity for low slippage
        timestamp: Math.floor(Date.now() / 1000) - 5, // 5 seconds ago
      },
      sizeDollar: 10000,
      grossPnlUsd: 200, // Higher profit to cover fees
      timestamp: Math.floor(Date.now() / 1000),
      status: 'new',
    }

    it('should simulate successful arbitrage', () => {
      const result = simulateArbitrage(mockOpportunity, 100)
      
      // Debug logging
      console.log('Simulation result:', {
        ok: result.ok,
        netPnlUsd: result.netPnlUsd,
        breakdown: result.breakdown,
        slippageImpact: result.slippageImpact,
        notes: result.notes,
      })
      console.log('Input opportunity:', {
        grossPnlUsd: mockOpportunity.grossPnlUsd,
        sizeDollar: mockOpportunity.sizeDollar,
      })
      
      expect(result.ok).toBe(true)
      expect(result.netPnlUsd).toBeGreaterThan(0)
      expect(result.breakdown.total).toBeGreaterThan(0)
      expect(result.slippageImpact).toBeLessThan(100) // Less than 1%
    })

    it('should reject arbitrage with insufficient liquidity', () => {
      const lowLiquidityOpportunity = {
        ...mockOpportunity,
        buyQuote: {
          ...mockOpportunity.buyQuote,
          liquidity: 100, // Very low liquidity
        },
        sizeDollar: 50000, // Large trade size
      }

      const result = simulateArbitrage(lowLiquidityOpportunity, 100)
      
      expect(result.ok).toBe(false)
      expect(result.notes.length).toBeGreaterThan(0)
    })
  })

  describe('passesGuardrails', () => {
    const mockOpportunity: Opportunity = {
      id: 'test-opportunity',
      pair: { base: 'USDC', quote: 'USDT' },
      sourceChain: 'ethereum',
      targetChain: 'polygon',
      buyQuote: {
        dex: 'uniswap-v3',
        chain: 'ethereum',
        pair: { base: 'USDC', quote: 'USDT' },
        price: 0.9995,
        liquidity: 1000000, // $1M liquidity for low slippage
        timestamp: Math.floor(Date.now() / 1000) - 10,
      },
      sellQuote: {
        dex: 'quickswap',
        chain: 'polygon',
        pair: { base: 'USDC', quote: 'USDT' },
        price: 1.0005,
        liquidity: 1000000, // $1M liquidity for low slippage
        timestamp: Math.floor(Date.now() / 1000) - 5,
      },
      sizeDollar: 10000,
      grossPnlUsd: 50, // Good profit
      timestamp: Math.floor(Date.now() / 1000),
      status: 'new',
    }

    it('should pass all guardrails for good opportunity', () => {
      const result = passesGuardrails(mockOpportunity, 10, 100, 30)
      
      expect(result.passes).toBe(true)
      expect(result.reasons).toHaveLength(0)
    })

    it('should fail guardrails for low profit', () => {
      const lowProfitOpportunity = {
        ...mockOpportunity,
        grossPnlUsd: 5, // Below minimum
      }

      const result = passesGuardrails(lowProfitOpportunity, 10, 100, 30)
      
      expect(result.passes).toBe(false)
      expect(result.reasons.some(r => r.includes('Gross PnL below minimum'))).toBe(true)
    })

    it('should fail guardrails for old quotes', () => {
      const oldQuoteOpportunity = {
        ...mockOpportunity,
        buyQuote: {
          ...mockOpportunity.buyQuote,
          timestamp: Math.floor(Date.now() / 1000) - 60, // 60 seconds ago
        },
      }

      const result = passesGuardrails(oldQuoteOpportunity, 10, 100, 30)
      
      expect(result.passes).toBe(false)
      expect(result.reasons.some(r => r.includes('Buy quote too old'))).toBe(true)
    })
  })
})
