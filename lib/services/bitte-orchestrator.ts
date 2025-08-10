// Bitte Open Agents orchestration service

import type { ScanRequest, Opportunity, SimulationResult, ExecutionResult } from '@/lib/types'

/**
 * Register ArbiZirQ API with Bitte runtime
 */
export async function registerWithBitte(): Promise<void> {
  const apiKey = process.env.BITTE_API_KEY
  if (!apiKey) {
    throw new Error('Bitte API key not configured')
  }

  const registrationPayload = {
    name: 'ArbiZirQ',
    description: 'Flash Arbitrage Executor for Zircuit × Bitte',
    version: '1.0.0',
    openapi_spec_url: `${getBaseUrl()}/api/openapi.yaml`,
    endpoints: [
      {
        path: '/api/scan',
        method: 'POST',
        description: 'Scan for arbitrage opportunities',
      },
      {
        path: '/api/simulate',
        method: 'POST', 
        description: 'Simulate arbitrage execution',
      },
      {
        path: '/api/execute',
        method: 'POST',
        description: 'Execute arbitrage via GUD + Zircuit',
      },
    ],
  }

  try {
    const response = await fetch('https://api.bitte.ai/v1/agents/register', {
      method: 'POST',
      headers: {
        'X-Bitte-Key': apiKey,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(registrationPayload),
    })

    if (!response.ok) {
      throw new Error(`Bitte registration failed: ${response.status} ${response.statusText}`)
    }

    const result = await response.json()
    console.log('Successfully registered with Bitte:', result)
  } catch (error) {
    console.error('Bitte registration error:', error)
    throw error
  }
}

/**
 * Execute complete arbitrage workflow via Bitte orchestration
 */
export async function executeArbitrageWorkflow(
  request: ScanRequest
): Promise<WorkflowResult> {
  const workflow: WorkflowStep[] = []
  
  try {
    // Step 1: Scan for opportunities
    workflow.push({ step: 'scan', status: 'running', timestamp: Date.now() })
    const opportunities = await scanMarketsStep(request)
    workflow[workflow.length - 1].status = 'completed'
    workflow[workflow.length - 1].result = { count: opportunities.length }

    if (opportunities.length === 0) {
      return {
        success: false,
        message: 'No arbitrage opportunities found',
        workflow,
      }
    }

    // Step 2: Simulate best opportunity
    const bestOpportunity = opportunities[0] // Already sorted by PnL
    workflow.push({ step: 'simulate', status: 'running', timestamp: Date.now() })
    const simulation = await simulateStep(bestOpportunity)
    workflow[workflow.length - 1].status = 'completed'
    workflow[workflow.length - 1].result = simulation

    if (!simulation.ok) {
      return {
        success: false,
        message: 'Simulation failed: ' + simulation.notes.join(', '),
        workflow,
        opportunity: bestOpportunity,
        simulation,
      }
    }

    // Step 3: Execute if profitable
    workflow.push({ step: 'execute', status: 'running', timestamp: Date.now() })
    const execution = await executeStep(bestOpportunity)
    workflow[workflow.length - 1].status = 'completed'
    workflow[workflow.length - 1].result = execution

    return {
      success: true,
      message: 'Arbitrage executed successfully',
      workflow,
      opportunity: bestOpportunity,
      simulation,
      execution,
    }
  } catch (error) {
    // Mark current step as failed
    if (workflow.length > 0) {
      workflow[workflow.length - 1].status = 'failed'
      workflow[workflow.length - 1].error = error instanceof Error ? error.message : 'Unknown error'
    }

    return {
      success: false,
      message: 'Workflow failed: ' + (error instanceof Error ? error.message : 'Unknown error'),
      workflow,
    }
  }
}

/**
 * Scan markets step (calls local API)
 */
async function scanMarketsStep(request: ScanRequest): Promise<Opportunity[]> {
  const response = await fetch(`${getBaseUrl()}/api/scan`, {
    method: 'POST',
    headers: {
      'X-Bitte-Key': process.env.BITTE_API_KEY!,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(request),
  })

  if (!response.ok) {
    throw new Error(`Scan failed: ${response.status} ${response.statusText}`)
  }

  return response.json()
}

/**
 * Simulate step (calls local API)
 */
async function simulateStep(opportunity: Opportunity): Promise<SimulationResult> {
  const response = await fetch(`${getBaseUrl()}/api/simulate`, {
    method: 'POST',
    headers: {
      'X-Bitte-Key': process.env.BITTE_API_KEY!,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(opportunity),
  })

  if (!response.ok) {
    throw new Error(`Simulation failed: ${response.status} ${response.statusText}`)
  }

  return response.json()
}

/**
 * Execute step (calls local API)
 */
async function executeStep(opportunity: Opportunity): Promise<ExecutionResult> {
  const response = await fetch(`${getBaseUrl()}/api/execute`, {
    method: 'POST',
    headers: {
      'X-Bitte-Key': process.env.BITTE_API_KEY!,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(opportunity),
  })

  if (!response.ok) {
    throw new Error(`Execution failed: ${response.status} ${response.statusText}`)
  }

  return response.json()
}

/**
 * Get base URL for API calls
 */
function getBaseUrl(): string {
  if (process.env.NODE_ENV === 'development') {
    return 'http://localhost:3000'
  }
  
  // In production, use the actual domain
  return process.env.NEXT_PUBLIC_BASE_URL || 'https://arbizirq.vercel.app'
}

/**
 * Schedule periodic arbitrage scans
 */
export async function schedulePeriodicScans(intervalMs: number = 30000): Promise<void> {
  console.log(`Starting periodic arbitrage scans every ${intervalMs}ms`)
  
  const defaultScanRequest: ScanRequest = {
    pairs: [
      { base: 'USDC', quote: 'USDT' },
      { base: 'WETH', quote: 'USDC' },
    ],
    chains: ['ethereum', 'polygon', 'zircuit'],
    minProfitUsd: 10,
    maxSlippageBps: 100,
  }

  setInterval(async () => {
    try {
      const result = await executeArbitrageWorkflow(defaultScanRequest)
      console.log('Periodic scan result:', {
        success: result.success,
        message: result.message,
        opportunity: result.opportunity?.id,
      })
    } catch (error) {
      console.error('Periodic scan error:', error)
    }
  }, intervalMs)
}

/**
 * Send status update to Bitte monitoring
 */
export async function reportStatusToBitte(status: AgentStatus): Promise<void> {
  const apiKey = process.env.BITTE_API_KEY
  if (!apiKey) return

  try {
    await fetch('https://api.bitte.ai/v1/agents/status', {
      method: 'POST',
      headers: {
        'X-Bitte-Key': apiKey,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        agent_id: 'bitte-defi',
        status: status.status,
        message: status.message,
        timestamp: Date.now(),
        metrics: status.metrics,
      }),
    })
  } catch (error) {
    console.error('Failed to report status to Bitte:', error)
  }
}

// Type definitions
interface WorkflowStep {
  step: 'scan' | 'simulate' | 'execute'
  status: 'running' | 'completed' | 'failed'
  timestamp: number
  result?: any
  error?: string
}

interface WorkflowResult {
  success: boolean
  message: string
  workflow: WorkflowStep[]
  opportunity?: Opportunity
  simulation?: SimulationResult
  execution?: ExecutionResult
}

interface AgentStatus {
  status: 'healthy' | 'degraded' | 'down'
  message: string
  metrics?: {
    opportunitiesFound: number
    successfulExecutions: number
    totalPnl: number
  }
}
