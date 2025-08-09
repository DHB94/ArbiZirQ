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

  try {
    // Convert chain names to chain IDs
    const srcChainId = getChainId(request.sourceChain)
    const destChainId = getChainId(request.targetChain)
    
    // Convert USD amount to token wei amount (assuming USDC with 6 decimals for now)
    // Fix: Ensure we're sending a proper integer string for srcAmountWei
    const amountInWei = Math.floor(request.sizeDollar * 1000000) // 6 decimals for USDC, rounded down
    const srcAmountWei = amountInWei.toString() // Convert to string without decimals

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

    console.log('GUD quote request:', JSON.stringify(quoteRequest, null, 2));

    const response = await fetch(`${apiUrl}/order/estimate`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(quoteRequest),
    })

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`GUD quote failed: ${response.status} ${response.statusText} - ${errorText}`);
    }

    const quoteResponse = await response.json();
    console.log('GUD quote response:', JSON.stringify(quoteResponse, null, 2));
    return quoteResponse;
  } catch (error) {
    console.error('Error getting GUD quote:', error);
    throw new Error(`GUD quote failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
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

  try {
    const buildRequest = {
      quoteId: quote.id,
      userAddress: request.userAddress || '0x0000000000000000000000000000000000000000',
    }

    console.log('GUD build request:', JSON.stringify(buildRequest, null, 2));

    const response = await fetch(`${apiUrl}/build`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(buildRequest),
    })

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`GUD build failed: ${response.status} ${response.statusText} - ${errorText}`);
    }

    const buildResponse = await response.json();
    console.log('GUD build response:', JSON.stringify(buildResponse, null, 2));
    return buildResponse;
  } catch (error) {
    console.error('Error building GUD transaction:', error);
    throw new Error(`GUD build failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
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

  try {
    const executeRequest = {
      txData: txData.data,
      gasLimit: txData.gasLimit,
      gasPrice: txData.gasPrice,
    }

    console.log('GUD execute request:', JSON.stringify(executeRequest, null, 2));

    const response = await fetch(`${apiUrl}/execute`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(executeRequest),
    })

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`GUD execution failed: ${response.status} ${response.statusText} - ${errorText}`);
    }

    const executeResponse = await response.json();
    console.log('GUD execute response:', JSON.stringify(executeResponse, null, 2));
    return executeResponse;
  } catch (error) {
    console.error('Error executing GUD transaction:', error);
    throw new Error(`GUD execution failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Wait for settlement on Zircuit L2
 */
async function waitForZircuitSettlement(txHash: string): Promise<any> {
  const zircuitRpc = process.env.ZIRCUIT_RPC_URL
  if (!zircuitRpc) {
    throw new Error('Zircuit RPC URL not configured')
  }

  try {
    const maxRetries = 30 // 30 seconds timeout
    let retries = 0

    console.log(`Waiting for transaction ${txHash} to be confirmed on Zircuit...`);
    
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

        if (!response.ok) {
          throw new Error(`RPC request failed: ${response.status} ${response.statusText}`);
        }

        const result = await response.json()
        
        if (result.result && result.result.status === '0x1') {
          console.log(`Transaction ${txHash} confirmed on Zircuit`);
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
  } catch (error) {
    console.error('Error waiting for Zircuit settlement:', error);
    throw new Error(`Zircuit settlement failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Calculate actual PnL based on execution results
 */
function calculateActualPnL(
  request: ExecuteRequest,
  result: GudExecutionResult
): number {
  try {
    // For now, return estimated PnL
    // In production, calculate based on actual amounts received
    const slippageFactor = 1 - (request.maxSlippageBps / 10000)
    return request.grossPnlUsd * slippageFactor
  } catch (error) {
    console.error('Error calculating PnL:', error);
    // Return a conservative estimate instead of failing
    return request.grossPnlUsd * 0.9; // 10% slippage as fallback
  }
}

/**
 * Get chain ID from chain name
 */
function getChainId(chain: string): number {
  const chainIds: Record<string, number> = {
    ethereum: 1,
    polygon: 137,
    zircuit: 48900,
    arbitrum: 42161,
    base: 8453,
    optimism: 10,
  }
  
  const chainId = chainIds[chain]
  if (!chainId) {
    throw new Error(`Unsupported chain: ${chain}`)
  }
  
  return chainId
}

/**
 * Get token contract address for a given chain
 */
function getTokenAddress(symbol: string, chain: string): string {
  // Proper token address mapping for supported chains
  const addresses: Record<string, Record<string, string>> = {
    ethereum: {
      USDC: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48', // Fixed
      USDT: '0xdAC17F958D2ee523a2206206994597C13D831ec7',
      WETH: '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2',
      WBTC: '0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599',
    },
    polygon: {
      USDC: '0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174',
      USDT: '0xc2132D05D31c914a87C6611C10748AEb04B58e8F',
      WETH: '0x7ceB23fD6bC0adD59E62ac25578270cFf1b9f619',
      WBTC: '0x1BFD67037B42Cf73acF2047067bd4F2C47D9BfD6',
    },
    zircuit: {
      USDC: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48', // Using Ethereum address as placeholder
      USDT: '0xdAC17F958D2ee523a2206206994597C13D831ec7', // Using Ethereum address as placeholder
      WETH: '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2', // Using Ethereum address as placeholder
      WBTC: '0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599', // Using Ethereum address as placeholder
    },
    arbitrum: {
      USDC: '0xaf88d065e77c8cC2239327C5EDb3A432268e5831', // Updated to correct address
      USDT: '0xFd086bC7CD5C481DCC9C85ebE478A1C0b69FCbb9',
      WETH: '0x82aF49447D8a07e3bd95BD0d56f35241523fBab1',
      WBTC: '0x2f2a2543B76A4166549F7aaB2e75Bef0aefC5B0f',
    },
    base: {
      USDC: '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913',
      USDT: '0xfde4C96c8593536E31F229EA8f37b2ADa2699bb2',
      WETH: '0x4200000000000000000000000000000000000006',
      WBTC: '0x1a35EE4640b0A3B87705B0A4B45D227Ba60Ca2ad',
    },
    optimism: {
      USDC: '0x7F5c764cBc14f9669B88837ca1490cCa17c31607',
      USDT: '0x94b008aA00579c1307B0EF2c499aD98a8ce58e58',
      WETH: '0x4200000000000000000000000000000000000006',
      WBTC: '0x68f180fcCe6836688e9084f035309E29Bf0A2095',
    },
  }

  if (!addresses[chain]) {
    throw new Error(`Chain ${chain} not supported`);
  }

  if (!addresses[chain][symbol]) {
    throw new Error(`Token ${symbol} not supported on chain ${chain}`);
  }

  return addresses[chain][symbol];
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