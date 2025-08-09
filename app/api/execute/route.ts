import { NextRequest, NextResponse } from 'next/server'
import { ExecuteRequestSchema, type ExecutionResult } from '@/lib/types'
import { executeViaGUD } from '@/lib/services/gud-client'
import { executeRealArbitrage } from '@/lib/services/real-arbitrage-executor'
import { validateOpportunity } from '@/lib/guards'

export async function POST(request: NextRequest) {
  try {
    // Parse and validate request body
    let body;
    try {
      body = await request.json();
    } catch (error) {
      return NextResponse.json(
        { 
          error: 'Invalid JSON in request body',
          details: error instanceof Error ? error.message : 'JSON parse error',
        },
        { status: 400 }
      );
    }
    
    const parseResult = ExecuteRequestSchema.safeParse(body);
    
    if (!parseResult.success) {
      return NextResponse.json(
        { 
          error: 'Invalid request format',
          details: parseResult.error.errors,
        },
        { status: 400 }
      );
    }

    const executeRequest = parseResult.data;

    // Validate opportunity data
    const validation = validateOpportunity(executeRequest);
    if (!validation.isValid) {
      return NextResponse.json(
        { 
          error: 'Invalid opportunity data',
          details: validation.errors,
        },
        { status: 400 }
      );
    }

    // Check execution mode - prioritize real execution
    const forceSimulation = process.env.FORCE_SIMULATION === 'true';
    const isDryRun = executeRequest.dryRun || forceSimulation;

    if (isDryRun) {
      console.log('🧪 Running in simulation mode');
      // Return simulated execution result
      const mockResult: ExecutionResult = {
        txHash: '0x' + '0'.repeat(64), // Mock transaction hash
        receipts: [],
        zircuitLatencyMs: 2500,
        actualPnlUsd: executeRequest.grossPnlUsd * 0.95, // Assume 5% slippage
      };

      return NextResponse.json(mockResult);
    }

    console.log('🚀 Executing REAL arbitrage trade');
    
    // Execute the arbitrage using real DEX swaps
    let executionResult: ExecutionResult;
    
    try {
      executionResult = await executeRealArbitrage(executeRequest);
    } catch (error) {
      console.error('Real arbitrage execution failed:', error);
      
      // Try fallback to GUD execution if real execution fails
      console.log('⚠️ Falling back to GUD execution');
      try {
        executionResult = await executeViaGUD(executeRequest);
      } catch (gudError) {
        console.error('GUD execution also failed:', gudError);
        return NextResponse.json(
          { 
            error: 'Execution failed in both modes',
            details: {
              realExecutionError: error instanceof Error ? error.message : 'Unknown error',
              gudExecutionError: gudError instanceof Error ? gudError.message : 'Unknown error',
            }
          },
          { status: 500 }
        );
      }
    }

    return NextResponse.json(executionResult);
  } catch (error) {
    console.error('Execution error:', error);
    
    // Don't expose internal error details in production
    const isDevelopment = process.env.NODE_ENV === 'development';
    const errorMessage = isDevelopment 
      ? error instanceof Error ? error.message : 'Unknown error'
      : 'Execution failed';
    
    return NextResponse.json(
      { 
        error: errorMessage,
        requestId: crypto.randomUUID(), // Add a request ID for tracking
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}