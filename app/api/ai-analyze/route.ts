import { NextRequest, NextResponse } from 'next/server'
import { OpportunitySchema } from '@/lib/types'
import { bitteClient } from '@/lib/services/bitte-client'

export async function POST(request: NextRequest) {
  try {
    // Parse and validate request body
    const body = await request.json()
    const parseResult = OpportunitySchema.safeParse(body)
    
    if (!parseResult.success) {
      return NextResponse.json(
        { 
          error: 'Invalid opportunity format',
          details: parseResult.error.errors,
        },
        { status: 400 }
      )
    }

    const opportunity = parseResult.data

    // Get AI analysis from Bitte
    const analysis = await bitteClient.analyzeOpportunity(opportunity)

    return NextResponse.json({
      opportunity,
      analysis,
      timestamp: Math.floor(Date.now() / 1000)
    })
  } catch (error) {
    console.error('AI analysis error:', error)
    
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function GET() {
  try {
    // Get general market insights
    const insights = await bitteClient.getMarketInsights()
    
    return NextResponse.json({
      insights,
      timestamp: Math.floor(Date.now() / 1000)
    })
  } catch (error) {
    console.error('Market insights error:', error)
    
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
