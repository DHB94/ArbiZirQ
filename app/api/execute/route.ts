import { NextRequest, NextResponse } from 'next/server'
import { ExecuteRequestSchema, type ExecutionResult } from '@/lib/types'
import { executeViaGUD } from '@/lib/services/gud-client'
import { executeRealArbitrage } from '@/lib/services/real-arbitrage-executor'
import { validateOpportunity } from '@/lib/guards'

export async function POST(request: NextRequest) {
  try {
    // Parse and validate request body
    const body = await request.json()
    const parseResult = ExecuteRequestSchema.safeParse(body)
    
    if (!parseResult.success) {
      return NextResponse.json(
        { 
          error: 'Invalid request format',
          details: parseResult.error.errors,
        },
        { status: 400 }
      )
    }

    const executeRequest = parseResult.data

    // Validate opportunity data
    const validation = validateOpportunity(executeRequest)
    if (!validation.isValid) {
      return NextResponse.json(
        { 
          error: 'Invalid opportunity data',
          details: validation.errors,
        },
        { status: 400 }
      )
    }

    // Check execution mode - prioritize real execution
    const forceSimulation = process.env.FORCE_SIMULATION === 'true'
    const isDryRun = executeRequest.dryRun || forceSimulation

    if (isDryRun) {
      console.log('🧪 Running in simulation mode')
      // Return simulated execution result
      const mockResult: ExecutionResult = {
        txHash: '0x' + '0'.repeat(64), // Mock transaction hash
        receipts: [],
        zircuitLatencyMs: 2500,
        actualPnlUsd: executeRequest.grossPnlUsd * 0.95, // Assume 5% slippage
      }

      return NextResponse.json(mockResult)
    }

    console.log('🚀 Executing REAL arbitrage trade')
    
    // Execute the arbitrage using real DEX swaps
    const executionResult = await executeRealArbitrage(executeRequest)

    const response: ExecutionResult = executionResult

    return NextResponse.json(response)
  } catch (error) {
    console.error('Execution error:', error)
    
    // Don't expose internal error details in production
    const isDevelopment = process.env.NODE_ENV === 'development'
    const errorMessage = isDevelopment 
      ? error instanceof Error ? error.message : 'Unknown error'
      : 'Execution failed'
    
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    )
  }
}
