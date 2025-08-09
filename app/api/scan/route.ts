import { NextRequest, NextResponse } from 'next/server'
import { ScanRequestSchema, type ScanResponse } from '@/lib/types'
import { scanMarkets } from '@/lib/services/dex-indexer'
import { validateBitteAuth } from '@/lib/services/auth'

export async function POST(request: NextRequest) {
  try {
    // Validate Bitte authentication
    const authResult = validateBitteAuth(request)
    if (!authResult.valid) {
      return NextResponse.json(
        { error: 'Invalid authentication' },
        { status: 401 }
      )
    }

    // Parse and validate request body
    const body = await request.json()
    const parseResult = ScanRequestSchema.safeParse(body)
    
    if (!parseResult.success) {
      return NextResponse.json(
        { 
          error: 'Invalid request format',
          details: parseResult.error.errors,
        },
        { status: 400 }
      )
    }

    const scanRequest = parseResult.data

    // Scan markets for opportunities
    const opportunities = await scanMarkets(scanRequest)

    // Sort by gross PnL descending
    const sortedOpportunities = opportunities.sort(
      (a, b) => b.grossPnlUsd - a.grossPnlUsd
    )

    const response: ScanResponse = sortedOpportunities

    return NextResponse.json(response)
  } catch (error) {
    console.error('Scan markets error:', error)
    
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
