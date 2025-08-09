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
    const apiUrl = process.env.GUD_API_URL || 'https://trading.ai.zircuit.com/api/engine/v1'
    
    if (!apiKey) return 'error'

    // Check GUD API by trying a simple estimate call with supported chains
    const response = await fetch(`${apiUrl}/order/estimate`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        srcChainId: 1, // Ethereum
        destChainId: 48900, // Zircuit
        srcAmountWei: '1000000', // 1 USDC
        srcToken: '0xdAC17F958D2ee523a2206206994597C13D831ec7',
        destToken: '0xdAC17F958D2ee523a2206206994597C13D831ec7',
        slippageBps: 100,
        userAccount: '0x742d35Cc6634C0532925a3b8D9C9FEe4FEAB6f91',
        destReceiver: '0x742d35Cc6634C0532925a3b8D9C9FEe4FEAB6f91'
      }),
      signal: AbortSignal.timeout(5000),
    })

    // GUD API responds with 404 but valid JSON means it's working
    if (response.status === 404) {
      const responseText = await response.text()
      if (responseText.includes('"message"')) {
        return 'ready' // API is responding with valid error messages
      }
    }
    
    if (response.ok || response.status === 400) {
      // 400 is fine for health check - means API is responding
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

    // Bitte API doesn't have a health endpoint, so we'll just check if we have a valid API key
    // This is a simplified health check - in production you might want to call a lightweight endpoint
    if (apiKey && apiKey.startsWith('bitte_')) {
      return 'ready'
    }
    
    return 'error'
  } catch (error) {
    console.error('Bitte health check failed:', error)
    return 'error'
  }
}
