import { NextRequest, NextResponse } from 'next/server'
import { ExecuteRequestSchema, type ExecutionResult } from '@/lib/types'
import { executeViaGUD } from '@/lib/services/gud-client'
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

    // Check if dry run mode is enabled globally
    const dryRunMode = process.env.DRY_RUN_MODE === 'true'
    const isDryRun = executeRequest.dryRun || dryRunMode

    if (isDryRun) {
      // Return simulated execution result
      const mockResult: ExecutionResult = {
        txHash: '0x' + '0'.repeat(64), // Mock transaction hash
        receipts: [],
        zircuitLatencyMs: 2500,
        actualPnlUsd: executeRequest.grossPnlUsd * 0.95, // Assume 5% slippage
      }

      return NextResponse.json(mockResult)
    }

    // Execute the arbitrage via GUD Trading Engine
    const executionResult = await executeViaGUD(executeRequest)

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
