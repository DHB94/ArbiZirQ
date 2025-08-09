// Typed API client for ArbiZirQ
// This will be enhanced with OpenAPI-generated types after running the generate command

import type {
  ScanRequest,
  ScanResponse,
  SimulateRequest,
  SimulationResult,
  ExecuteRequest,
  ExecutionResult,
  HealthStatus,
  Opportunity,
} from './types'

import { API_ENDPOINTS } from './constants'

export class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
    public response?: Response
  ) {
    super(message)
    this.name = 'ApiError'
  }
}

/**
 * Base API client with error handling
 */
class BaseApiClient {
  private baseUrl: string

  constructor(baseUrl = '') {
    this.baseUrl = baseUrl
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`
    
    const response = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    })

    if (!response.ok) {
      const errorText = await response.text()
      throw new ApiError(
        `API request failed: ${response.status} ${response.statusText}`,
        response.status,
        response
      )
    }

    return response.json()
  }

  protected async get<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, { method: 'GET' })
  }

  protected async post<T>(endpoint: string, data?: unknown): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
    })
  }
}

/**
 * ArbiZirQ API client
 */
export class ArbiZirQApiClient extends BaseApiClient {
  /**
   * Check API health status
   */
  async getHealth(): Promise<HealthStatus> {
    return this.get<HealthStatus>(API_ENDPOINTS.health)
  }

  /**
   * Scan for arbitrage opportunities
   */
  async scanMarkets(request: ScanRequest): Promise<ScanResponse> {
    return this.post<ScanResponse>(API_ENDPOINTS.scan, request)
  }

  /**
   * Simulate arbitrage execution
   */
  async simulate(request: SimulateRequest): Promise<SimulationResult> {
    return this.post<SimulationResult>(API_ENDPOINTS.simulate, request)
  }

  /**
   * Execute arbitrage
   */
  async execute(request: ExecuteRequest): Promise<ExecutionResult> {
    return this.post<ExecutionResult>(API_ENDPOINTS.execute, request)
  }

  /**
   * Get AI-powered analysis of an opportunity (Bitte integration)
   */
  async analyzeOpportunity(opportunity: Opportunity): Promise<{
    opportunity: Opportunity
    analysis: {
      recommendation: 'execute' | 'skip' | 'monitor'
      confidence: number
      reasoning: string[]
      riskLevel: 'low' | 'medium' | 'high'
    }
    timestamp: number
  }> {
    return this.post(API_ENDPOINTS.aiAnalyze, opportunity)
  }

  /**
   * Get AI market insights (Bitte integration)
   */
  async getMarketInsights(): Promise<{
    insights: {
      trends: string[]
      volatility: 'low' | 'medium' | 'high'
      recommendations: string[]
    }
    timestamp: number
  }> {
    return this.get(API_ENDPOINTS.aiAnalyze)
  }

  /**
   * Get AI optimization suggestions (Bitte integration)
   */
  async getOptimizationSuggestions(scanRequest: ScanRequest): Promise<{
    current: ScanRequest
    suggestions: {
      suggestedPairs: Array<{base: string, quote: string}>
      suggestedChains: string[]
      suggestedSlippage: number
      suggestedMinProfit: number
    }
    timestamp: number
  }> {
    return this.post(API_ENDPOINTS.optimize, scanRequest)
  }
}

// Create singleton instance
export const apiClient = new ArbiZirQApiClient()

// Convenience functions for use with SWR
export const fetchers = {
  health: () => apiClient.getHealth(),
  scan: (request: ScanRequest) => apiClient.scanMarkets(request),
  simulate: (request: SimulateRequest) => apiClient.simulate(request),
  execute: (request: ExecuteRequest) => apiClient.execute(request),
  analyzeOpportunity: (opportunity: Opportunity) => apiClient.analyzeOpportunity(opportunity),
  marketInsights: () => apiClient.getMarketInsights(),
  optimize: (request: ScanRequest) => apiClient.getOptimizationSuggestions(request),
}

// SWR keys for cache invalidation
export const swrKeys = {
  health: 'health',
  scan: (request: ScanRequest) => ['scan', request],
  opportunities: 'opportunities',
} as const

/**
 * Wrapper for API calls with error handling
 */
export async function withErrorHandling<T>(
  apiCall: () => Promise<T>,
  errorMessage = 'An error occurred'
): Promise<{ data?: T; error?: string }> {
  try {
    const data = await apiCall()
    return { data }
  } catch (error) {
    console.error('API Error:', error)
    
    if (error instanceof ApiError) {
      return { error: `${errorMessage}: ${error.message}` }
    }
    
    return { error: errorMessage }
  }
}

/**
 * Batch API calls with concurrent execution
 */
export async function batchApiCalls<T>(
  calls: Array<() => Promise<T>>
): Promise<Array<{ data?: T; error?: string }>> {
  const promises = calls.map(call => withErrorHandling(call))
  return Promise.all(promises)
}

/**
 * Retry API call with exponential backoff
 */
export async function retryApiCall<T>(
  apiCall: () => Promise<T>,
  maxRetries = 3,
  baseDelay = 1000
): Promise<T> {
  let lastError: Error

  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      return await apiCall()
    } catch (error) {
      lastError = error as Error
      
      if (attempt === maxRetries - 1) {
        throw lastError
      }
      
      // Exponential backoff with jitter
      const delay = baseDelay * Math.pow(2, attempt) + Math.random() * 1000
      await new Promise(resolve => setTimeout(resolve, delay))
    }
  }

  throw lastError!
}
