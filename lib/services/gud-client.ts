// GUD Trading Engine client for executing cross-chain arbitrage

import type { ExecuteRequest, ExecutionResult } from '@/lib/types'

/**
 * Execute arbitrage via GUD Trading Engine
 */
export async function executeViaGUD(request: ExecuteRequest): Promise<ExecutionResult> {
  const startTime = Date.now()
  
  try {
    // Step 1: Get GUD quote for the cross-chain route
    const gudQuote = await getGudQuote(request)
    
    // Step 2: Build the transaction
    const txData = await buildGudTransaction(gudQuote, request)
    
    // Step 3: Execute the transaction
    const executionResult = await executeGudTransaction(txData)
    
    // Step 4: Wait for Zircuit settlement
    const zircuitReceipt = await waitForZircuitSettlement(executionResult.txHash)
    
    const endTime = Date.now()
    const zircuitLatencyMs = endTime - startTime
    
    return {
      txHash: executionResult.txHash,
      receipts: [...executionResult.receipts, zircuitReceipt],
      zircuitLatencyMs,
      actualPnlUsd: calculateActualPnL(request, executionResult),
    }
  } catch (error) {
    console.error('GUD execution error:', error)
    throw new Error(`Execution failed: ${error instanceof Error ? error.message : 'Unknown error'}`)
  }
}

/**
 * Get quote from GUD Trading Engine
 */
async function getGudQuote(request: ExecuteRequest): Promise<GudQuote> {
  const apiKey = process.env.GUD_API_KEY
  const apiUrl = process.env.GUD_API_URL || 'https://trading.ai.zircuit.com/api/engine/v1'
  
  if (!apiKey) {
    throw new Error('GUD API key not configured')
  }

  // Convert chain names to chain IDs
  const srcChainId = getChainId(request.sourceChain)
  const destChainId = getChainId(request.targetChain)
  
  // Convert USD amount to token wei amount (assuming USDC with 6 decimals for now)
  const srcAmountWei = (request.sizeDollar * 1000000).toString() // 6 decimals for USDC

  const quoteRequest = {
    srcChainId,
    destChainId,
    srcToken: getTokenAddress(request.pair.base, request.sourceChain),
    destToken: getTokenAddress(request.pair.quote, request.targetChain),
    srcAmountWei,
    slippageBps: request.maxSlippageBps,
    userAccount: request.userAddress || '0x0000000000000000000000000000000000000000',
    destReceiver: request.userAddress || '0x0000000000000000000000000000000000000000',
  }

  const response = await fetch(`${apiUrl}/order/estimate`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(quoteRequest),
  })

  if (!response.ok) {
    throw new Error(`GUD quote failed: ${response.status} ${response.statusText}`)
  }

  return response.json()
}

/**
 * Build transaction data via GUD
 */
async function buildGudTransaction(quote: GudQuote, request: ExecuteRequest): Promise<GudTxData> {
  const apiKey = process.env.GUD_API_KEY
  const apiUrl = process.env.GUD_API_URL || 'https://trading.ai.zircuit.com/api/engine/v1'
  
  if (!apiKey) {
    throw new Error('GUD API key not configured')
  }

  const buildRequest = {
    quoteId: quote.id,
    userAddress: request.userAddress,
  }

  const response = await fetch(`${apiUrl}/build`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(buildRequest),
  })

  if (!response.ok) {
    throw new Error(`GUD build failed: ${response.status} ${response.statusText}`)
  }

  return response.json()
}

/**
 * Execute the transaction via GUD
 */
async function executeGudTransaction(txData: GudTxData): Promise<GudExecutionResult> {
  const apiKey = process.env.GUD_API_KEY
  const apiUrl = process.env.GUD_API_URL || 'https://trading.ai.zircuit.com/api/engine/v1'
  
  if (!apiKey) {
    throw new Error('GUD API key not configured')
  }

  const executeRequest = {
    txData: txData.data,
    gasLimit: txData.gasLimit,
    gasPrice: txData.gasPrice,
  }

  const response = await fetch(`${apiUrl}/execute`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(executeRequest),
  })

  if (!response.ok) {
    throw new Error(`GUD execution failed: ${response.status} ${response.statusText}`)
  }

  return response.json()
}

/**
 * Wait for settlement on Zircuit L2
 */
async function waitForZircuitSettlement(txHash: string): Promise<any> {
  const zircuitRpc = process.env.ZIRCUIT_RPC_URL
  if (!zircuitRpc) {
    throw new Error('Zircuit RPC URL not configured')
  }

  const maxRetries = 30 // 30 seconds timeout
  let retries = 0

  while (retries < maxRetries) {
    try {
      const response = await fetch(zircuitRpc, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          jsonrpc: '2.0',
          method: 'eth_getTransactionReceipt',
          params: [txHash],
          id: 1,
        }),
      })

      const result = await response.json()
      
      if (result.result && result.result.status === '0x1') {
        return result.result
      }
      
      // Wait 1 second before retrying
      await new Promise(resolve => setTimeout(resolve, 1000))
      retries++
    } catch (error) {
      console.error('Error checking Zircuit settlement:', error)
      retries++
    }
  }

  throw new Error('Zircuit settlement timeout')
}

/**
 * Calculate actual PnL based on execution results
 */
function calculateActualPnL(
  request: ExecuteRequest,
  result: GudExecutionResult
): number {
  // For now, return estimated PnL
  // In production, calculate based on actual amounts received
  const slippageFactor = 1 - (request.maxSlippageBps / 10000)
  return request.grossPnlUsd * slippageFactor
}

/**
 * Get chain ID from chain name
 */
function getChainId(chain: string): number {
  const chainIds: Record<string, number> = {
    ethereum: 1,
    zircuit: 48900,
    arbitrum: 42161,
    base: 8453,
  }
  return chainIds[chain] || 1
}

/**
 * Get token address for a given symbol and chain
 */

/**
 * Get token contract address for a given chain
 */
function getTokenAddress(symbol: string, chain: string): string {
  // Proper token address mapping for supported chains
  const addresses: Record<string, Record<string, string>> = {
    ethereum: {
      USDC: '0xA0b86a33E6441A8FadAA7F69C02E74ee82b91',
      USDT: '0xdAC17F958D2ee523a2206206994597C13D831ec7',
      WETH: '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2',
    },
    zircuit: {
      USDC: '0xA0b86a33E6441A8FadAA7F69C02E74ee82b91',
      USDT: '0xdAC17F958D2ee523a2206206994597C13D831ec7',
      WETH: '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2',
    },
    arbitrum: {
      USDC: '0xaf88d065e77c8cC2239327C5EDb3A432268e5831',
      USDT: '0xFd086bC7CD5C481DCC9C85ebE478A1C0b69FCbb9',
      WETH: '0x82aF49447D8a07e3bd95BD0d56f35241523fBab1',
    },
    base: {
      USDC: '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913',
      USDT: '0xfde4C96c8593536E31F229EA8f37b2ADa2699bb2',
      WETH: '0x4200000000000000000000000000000000000006',
    },
  }

  return addresses[chain]?.[symbol] || '0x0000000000000000000000000000000000000000'
}

/**
 * Get the executor wallet address
 */
function getExecutorAddress(): string {
  // In production, this would be derived from the private key or wallet
  return process.env.EXECUTOR_ADDRESS || '0x742d35Cc6634C0532925a3b8D9C9FEe4FEAB6f'
}

// Type definitions for GUD API responses
interface GudQuote {
  id: string
  fromChain: string
  toChain: string
  fromToken: string
  toToken: string
  amountIn: string
  amountOut: string
  fees: {
    protocol: string
    gas: string
    bridge: string
  }
  route: Array<{
    dex: string
    chain: string
    percentage: number
  }>
  validUntil: number
}

interface GudTxData {
  data: string
  to: string
  value: string
  gasLimit: string
  gasPrice: string
  chainId: number
}

interface GudExecutionResult {
  txHash: string
  receipts: any[]
  status: 'pending' | 'success' | 'failed'
}
