// Bitte Protocol client for AI agent integration

import type { ScanRequest, ExecuteRequest, Opportunity } from '@/lib/types'

/**
 * Bitte Protocol client for AI-powered arbitrage
 */
export class BitteClient {
  private apiKey: string
  private baseUrl: string

  constructor() {
    this.apiKey = process.env.BITTE_API_KEY || ''
    this.baseUrl = process.env.BITTE_API_URL || 'https://api.bitte.ai'
  }

  /**
   * Register ArbiZirQ as a Bitte agent
   */
  async registerAgent(): Promise<void> {
    if (!this.apiKey) {
      throw new Error('Bitte API key not configured')
    }

    const agentConfig = {
      name: 'ArbiZirQ',
      description: 'Cross-chain arbitrage agent powered by Zircuit and GUD',
      version: '1.0.0',
      capabilities: [
        'arbitrage_scanning',
        'cross_chain_execution',
        'opportunity_analysis',
        'risk_management'
      ],
      endpoints: {
        scan: '/api/scan',
        simulate: '/api/simulate',
        execute: '/api/execute',
        health: '/api/health'
      }
    }

    const response = await fetch(`${this.baseUrl}/v1/agents/register`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(agentConfig),
    })

    if (!response.ok) {
      throw new Error(`Bitte agent registration failed: ${response.status} ${response.statusText}`)
    }

    const result = await response.json()
    console.log('Successfully registered with Bitte:', result)
  }

  /**
   * Send arbitrage opportunity to Bitte for AI analysis
   */
  async analyzeOpportunity(opportunity: Opportunity): Promise<{
    recommendation: 'execute' | 'skip' | 'monitor'
    confidence: number
    reasoning: string[]
    riskLevel: 'low' | 'medium' | 'high'
  }> {
    if (!this.apiKey) {
      // Return default analysis if no API key
      return {
        recommendation: 'monitor',
        confidence: 0.5,
        reasoning: ['Bitte API not configured'],
        riskLevel: 'medium'
      }
    }

    const response = await fetch(`${this.baseUrl}/v1/agents/analyze`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        type: 'arbitrage_opportunity',
        data: opportunity
      }),
    })

    if (!response.ok) {
      console.warn(`Bitte analysis failed: ${response.status} ${response.statusText}`)
      // Return fallback analysis
      return {
        recommendation: 'monitor',
        confidence: 0.5,
        reasoning: ['Bitte analysis unavailable'],
        riskLevel: 'medium'
      }
    }

    return response.json()
  }

  /**
   * Report execution results to Bitte
   */
  async reportExecution(executionId: string, result: {
    success: boolean
    netPnlUsd: number
    gasUsed?: number
    errorMessage?: string
  }): Promise<void> {
    if (!this.apiKey) return

    try {
      await fetch(`${this.baseUrl}/v1/agents/execution/${executionId}/report`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(result),
      })
    } catch (error) {
      console.warn('Failed to report execution to Bitte:', error)
    }
  }

  /**
   * Get AI-powered market insights from Bitte
   */
  async getMarketInsights(): Promise<{
    trends: string[]
    volatility: 'low' | 'medium' | 'high'
    recommendations: string[]
  }> {
    if (!this.apiKey) {
      return {
        trends: ['Bitte API not configured'],
        volatility: 'medium',
        recommendations: []
      }
    }

    try {
      const response = await fetch(`${this.baseUrl}/v1/insights/market`, {
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
        },
      })

      if (!response.ok) {
        throw new Error(`Failed to get market insights: ${response.status}`)
      }

      return response.json()
    } catch (error) {
      console.warn('Failed to get Bitte market insights:', error)
      return {
        trends: ['Market data unavailable'],
        volatility: 'medium',
        recommendations: []
      }
    }
  }

  /**
   * Get AI optimization suggestions for arbitrage parameters
   */
  async getOptimizationSuggestions(scanRequest: ScanRequest): Promise<{
    suggestedPairs: Array<{base: string, quote: string}>
    suggestedChains: string[]
    suggestedSlippage: number
    suggestedMinProfit: number
  }> {
    if (!this.apiKey) {
      return {
        suggestedPairs: [{ base: 'USDC', quote: 'USDT' }],
        suggestedChains: ['ethereum', 'zircuit'],
        suggestedSlippage: 100,
        suggestedMinProfit: 10
      }
    }

    try {
      const response = await fetch(`${this.baseUrl}/v1/agents/optimize`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          type: 'scan_parameters',
          current: scanRequest
        }),
      })

      if (!response.ok) {
        throw new Error(`Failed to get optimization suggestions: ${response.status}`)
      }

      return response.json()
    } catch (error) {
      console.warn('Failed to get Bitte optimization suggestions:', error)
      return {
        suggestedPairs: scanRequest.pairs,
        suggestedChains: scanRequest.chains,
        suggestedSlippage: scanRequest.maxSlippageBps || 100,
        suggestedMinProfit: scanRequest.minProfitUsd
      }
    }
  }
}

// Create singleton instance
export const bitteClient = new BitteClient()

// Utility functions
export async function initializeBitteIntegration(): Promise<void> {
  try {
    await bitteClient.registerAgent()
    console.log('Bitte integration initialized successfully')
  } catch (error) {
    console.warn('Failed to initialize Bitte integration:', error)
  }
}
