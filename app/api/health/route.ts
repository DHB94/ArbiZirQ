import { NextResponse } from 'next/server'
import type { HealthStatus } from '@/lib/types'

export async function GET() {
  try {
    const timestamp = Math.floor(Date.now() / 1000)
    
    // Check each service
    const [zircuitStatus, gudStatus, bitteStatus] = await Promise.allSettled([
      checkZircuitHealth(),
      checkGudHealth(),
      checkBitteHealth(),
    ])

    const health: HealthStatus = {
      ok: true,
      zircuit: zircuitStatus.status === 'fulfilled' ? zircuitStatus.value : 'error',
      gud: gudStatus.status === 'fulfilled' ? gudStatus.value : 'error',
      bitte: bitteStatus.status === 'fulfilled' ? bitteStatus.value : 'error',
      timestamp,
    }

    // Overall health is OK if all services are ready
    health.ok = health.zircuit === 'ready' && health.gud === 'ready' && health.bitte === 'ready'

    return NextResponse.json(health)
  } catch (error) {
    console.error('Health check failed:', error)
    
    return NextResponse.json(
      {
        ok: false,
        zircuit: 'error',
        gud: 'error', 
        bitte: 'error',
        timestamp: Math.floor(Date.now() / 1000),
      } as HealthStatus,
      { status: 500 }
    )
  }
}

async function checkZircuitHealth(): Promise<'ready' | 'down' | 'error'> {
  try {
    const rpcUrl = process.env.ZIRCUIT_RPC_URL
    if (!rpcUrl) return 'error'

    // Simple RPC health check
    const response = await fetch(rpcUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        jsonrpc: '2.0',
        method: 'eth_blockNumber',
        params: [],
        id: 1,
      }),
      signal: AbortSignal.timeout(5000), // 5 second timeout
    })

    if (response.ok) {
      const data = await response.json()
      return data.result ? 'ready' : 'error'
    }
    
    return 'down'
  } catch (error) {
    console.error('Zircuit health check failed:', error)
    return 'error'
  }
}

async function checkGudHealth(): Promise<'ready' | 'down' | 'error'> {
  try {
    const apiKey = process.env.GUD_API_KEY
    if (!apiKey) return 'error'

    // Check GUD API health endpoint
    // Note: Replace with actual GUD health endpoint when available
    const response = await fetch('https://api.gud.finance/health', {
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      signal: AbortSignal.timeout(5000),
    })

    if (response.ok) {
      return 'ready'
    } else if (response.status === 401) {
      return 'error' // Invalid API key
    }
    
    return 'down'
  } catch (error) {
    console.error('GUD health check failed:', error)
    return 'error'
  }
}

async function checkBitteHealth(): Promise<'ready' | 'down' | 'error'> {
  try {
    const apiKey = process.env.BITTE_API_KEY
    if (!apiKey) return 'error'

    // Check Bitte API health
    // Note: Replace with actual Bitte health endpoint when available
    const response = await fetch('https://api.bitte.ai/health', {
      headers: {
        'X-Bitte-Key': apiKey,
        'Content-Type': 'application/json',
      },
      signal: AbortSignal.timeout(5000),
    })

    if (response.ok) {
      return 'ready'
    } else if (response.status === 401) {
      return 'error' // Invalid API key
    }
    
    return 'down'
  } catch (error) {
    console.error('Bitte health check failed:', error)
    return 'error'
  }
}
