import { NextRequest, NextResponse } from 'next/server'
import { ExecuteRequestSchema, type ExecutionResult } from '@/lib/types'
import { executeViaGUD } from '@/lib/services/gud-client'
import { executeRealArbitrage } from '@/lib/services/real-arbitrage-executor'
import { validateOpportunity } from '@/lib/guards'

// Generate a unique ID for request tracking
function generateRequestId(): string {
  // Use a simpler method than crypto.randomUUID() for better compatibility
  const timestamp = Date.now().toString(36);
  const randomPart = Math.random().toString(36).substring(2, 10);
  return `${timestamp}-${randomPart}`;
}

export async function POST(request: NextRequest) {
  const requestId = generateRequestId();
  const timestamp = new Date().toISOString();
  
  console.log(`[${requestId}] Processing execution request at ${timestamp}`);
  
  try {
    // Parse and validate request body
    let body;
    try {
      body = await request.json();
      console.log(`[${requestId}] Request body parsed successfully`);
    } catch (error) {
      console.error(`[${requestId}] Invalid JSON in request body:`, error);
      return NextResponse.json(
        { 
          error: 'Invalid JSON in request body',
          details: error instanceof Error ? error.message : 'JSON parse error',
          requestId,
          timestamp,
        },
        { status: 400 }
      );
    }
    
    const parseResult = ExecuteRequestSchema.safeParse(body);
    
    if (!parseResult.success) {
      console.error(`[${requestId}] Invalid request format:`, parseResult.error.errors);
      return NextResponse.json(
        { 
          error: 'Invalid request format',
          details: parseResult.error.errors,
          requestId,
          timestamp,
        },
        { status: 400 }
      );
    }

    const executeRequest = parseResult.data;
    console.log(`[${requestId}] Executing trade for opportunity ID: ${executeRequest.id}`);

    // Validate opportunity data
    const validation = validateOpportunity(executeRequest);
    if (!validation.isValid) {
      console.error(`[${requestId}] Invalid opportunity data:`, validation.errors);
      return NextResponse.json(
        { 
          error: 'Invalid opportunity data',
          details: validation.errors,
          requestId,
          timestamp,
        },
        { status: 400 }
      );
    }

    // Check execution mode - prioritize simulation in Vercel environment
    const forceSimulation = process.env.FORCE_SIMULATION === 'true' || process.env.VERCEL;
    const isDryRun = executeRequest.dryRun || forceSimulation;

    if (isDryRun) {
      console.log(`[${requestId}] 🧪 Running in simulation mode`);
      // Return simulated execution result
      const mockResult: ExecutionResult = {
        txHash: '0x' + '0'.repeat(64), // Mock transaction hash
        receipts: [],
        zircuitLatencyMs: 2500,
        actualPnlUsd: executeRequest.grossPnlUsd * 0.95, // Assume 5% slippage
      };

      return NextResponse.json({
        ...mockResult,
        requestId,
        timestamp,
        mode: 'simulation'
      });
    }

    console.log(`[${requestId}] 🚀 Executing REAL arbitrage trade`);
    
    // Try real arbitrage execution first (with server-side wallet support)
    try {
      console.log(`[${requestId}] Attempting real arbitrage execution`);
      const executionResult = await executeRealArbitrage(executeRequest);
      
      console.log(`[${requestId}] Real arbitrage execution successful`);
      return NextResponse.json({
        ...executionResult,
        requestId,
        timestamp,
        mode: 'real'
      });
    } catch (error) {
      console.error(`[${requestId}] Real arbitrage execution failed:`, error);
      
      // Try fallback to GUD execution if real execution fails
      console.log(`[${requestId}] ⚠️ Falling back to GUD execution`);
      try {
        const gudResult = await executeViaGUD(executeRequest);
        
        console.log(`[${requestId}] GUD execution successful`);
        return NextResponse.json({
          ...gudResult,
          requestId,
          timestamp,
          mode: 'gud',
          fallback: true
        });
      } catch (gudError) {
        console.error(`[${requestId}] GUD execution also failed:`, gudError);
        
        // In Vercel environment, return a simulated result instead of failing
        if (process.env.VERCEL) {
          console.log(`[${requestId}] Vercel environment detected - returning simulation as final fallback`);
          const fallbackResult: ExecutionResult = {
            txHash: '0x' + '0'.repeat(64), // Mock transaction hash
            receipts: [],
            zircuitLatencyMs: 2500,
            actualPnlUsd: executeRequest.grossPnlUsd * 0.9, // Assume 10% slippage
          };
          
          return NextResponse.json({
            ...fallbackResult,
            requestId,
            timestamp,
            mode: 'simulation',
            fallback: true,
            note: 'Execution failed in both real and GUD modes, falling back to simulation'
          });
        }
        
        return NextResponse.json(
          { 
            error: 'Execution failed in both modes',
            details: {
              realExecutionError: error instanceof Error ? error.message : 'Unknown error',
              gudExecutionError: gudError instanceof Error ? gudError.message : 'Unknown error',
            },
            requestId,
            timestamp,
          },
          { status: 500 }
        );
      }
    }
  } catch (error) {
    console.error(`[${requestId}] Unhandled execution error:`, error);
    
    // In Vercel environment, return a simulated result instead of failing
    if (process.env.VERCEL) {
      console.log(`[${requestId}] Vercel environment detected - returning simulation as final fallback`);
      const fallbackResult: ExecutionResult = {
        txHash: '0x' + '0'.repeat(64), // Mock transaction hash
        receipts: [],
        zircuitLatencyMs: 2500,
        actualPnlUsd: 0, // No profit in error case
      };
      
      return NextResponse.json({
        ...fallbackResult,
        requestId,
        timestamp,
        mode: 'simulation',
        fallback: true,
        note: 'Execution failed with an unhandled error, falling back to simulation'
      });
    }
    
    // Don't expose internal error details in production
    const isDevelopment = process.env.NODE_ENV === 'development';
    const errorMessage = isDevelopment 
      ? error instanceof Error ? error.message : 'Unknown error'
      : 'Execution failed';
    
    return NextResponse.json(
      { 
        error: errorMessage,
        requestId,
        timestamp,
      },
      { status: 500 }
    );
  }
}