import { NextRequest, NextResponse } from 'next/server'
import { ScanRequestSchema } from '@/lib/types'
import { bitteClient } from '@/lib/services/bitte-client'

export async function POST(request: NextRequest) {
  try {
    // Parse and validate request body
    const body = await request.json()
    const parseResult = ScanRequestSchema.safeParse(body)
    
    if (!parseResult.success) {
      return NextResponse.json(
        { 
          error: 'Invalid scan request format',
          details: parseResult.error.errors,
        },
        { status: 400 }
      )
    }

    const scanRequest = parseResult.data

    // Get AI optimization suggestions from Bitte
    const suggestions = await bitteClient.getOptimizationSuggestions(scanRequest)

    return NextResponse.json({
      current: scanRequest,
      suggestions,
      timestamp: Math.floor(Date.now() / 1000)
    })
  } catch (error) {
    console.error('Optimization error:', error)
    
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
