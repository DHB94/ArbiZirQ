import { NextRequest, NextResponse } from 'next/server'
import { SimulateRequestSchema, type SimulationResult } from '@/lib/types'
import { simulateArbitrage } from '@/lib/math'
import { validateOpportunity } from '@/lib/guards'

export async function POST(request: NextRequest) {
  try {
    // Parse and validate request body
    const body = await request.json()
    console.log('Simulation request body:', JSON.stringify(body, null, 2))
    
    const parseResult = SimulateRequestSchema.safeParse(body)
    
    if (!parseResult.success) {
      console.log('Validation errors:', parseResult.error.errors)
      return NextResponse.json(
        { 
          error: 'Invalid request format',
          details: parseResult.error.errors,
        },
        { status: 400 }
      )
    }

    const simulateRequest = parseResult.data
    console.log('Parsed simulation request:', JSON.stringify(simulateRequest, null, 2))
    console.log('Max slippage BPS from request:', simulateRequest.maxSlippageBps)

    // Validate opportunity data
    const validation = validateOpportunity(simulateRequest)
    if (!validation.isValid) {
      return NextResponse.json(
        { 
          error: 'Invalid opportunity data',
          details: validation.errors,
        },
        { status: 400 }
      )
    }

    // Run simulation
    const simulationResult = simulateArbitrage(
      simulateRequest,
      simulateRequest.maxSlippageBps
    )

    // Add validation warnings to simulation notes
    if (validation.warnings.length > 0) {
      simulationResult.notes.push(...validation.warnings)
    }

    const response: SimulationResult = simulationResult

    return NextResponse.json(response)
  } catch (error) {
    console.error('Simulation error:', error)
    
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
