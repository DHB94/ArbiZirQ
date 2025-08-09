// DEX indexer service for fetching quotes across multiple chains and DEXs

import type { ScanRequest, Opportunity, Quote, Chain, TokenPair } from '@/lib/types'
import { CHAIN_DEXS, DEX_FEE_BPS } from '@/lib/constants'

/**
 * Scan markets for arbitrage opportunities
 */
export async function scanMarkets(request: ScanRequest): Promise<Opportunity[]> {
  const opportunities: Opportunity[] = []

  // Get quotes for each pair across all requested chains
  for (const pair of request.pairs) {
    const quotes = await fetchQuotesForPair(pair, request.chains)
    
    // Find arbitrage opportunities between different chains
    const pairOpportunities = findArbitrageOpportunities(quotes, request)
    opportunities.push(...pairOpportunities)
  }

  // Filter by minimum profit
  return opportunities.filter(opp => opp.grossPnlUsd >= request.minProfitUsd)
}

/**
 * Fetch quotes for a token pair across multiple chains
 */
async function fetchQuotesForPair(pair: TokenPair, chains: Chain[]): Promise<Quote[]> {
  const quotes: Quote[] = []

  // Fetch quotes from each chain
  const quotePromises = chains.map(chain => fetchChainQuotes(pair, chain))
  const chainQuotes = await Promise.all(quotePromises)

  // Flatten results
  for (const chainQuoteList of chainQuotes) {
    quotes.push(...chainQuoteList)
  }

  return quotes.filter(quote => quote.liquidity > 1000) // Min $1K liquidity
}

/**
 * Fetch quotes for a pair on a specific chain
 */
async function fetchChainQuotes(pair: TokenPair, chain: Chain): Promise<Quote[]> {
  const dexs = CHAIN_DEXS[chain] || []
  const quotes: Quote[] = []

  // Mock implementation - in production, this would call actual DEX APIs
  for (const dex of dexs) {
    try {
      const quote = await fetchDexQuote(pair, chain, dex)
      if (quote) {
        quotes.push(quote)
      }
    } catch (error) {
      console.error(`Failed to fetch quote from ${dex} on ${chain}:`, error)
    }
  }

  return quotes
}

/**
 * Fetch quote from a specific DEX (mock implementation)
 */
async function fetchDexQuote(
  pair: TokenPair,
  chain: Chain,
  dex: string
): Promise<Quote | null> {
  try {
    // Mock implementation - replace with actual DEX API calls
    const mockQuote = generateMockQuote(pair, chain, dex)
    
    // Add some randomness to simulate real market conditions
    const priceVariation = (Math.random() - 0.5) * 0.02 // ±1% variation
    const liquidityVariation = Math.random() * 0.5 + 0.5 // 50-100% of base
    
    mockQuote.price *= (1 + priceVariation)
    mockQuote.liquidity *= liquidityVariation

    return mockQuote
  } catch (error) {
    console.error(`Error fetching quote from ${dex}:`, error)
    return null
  }
}

/**
 * Generate mock quote for development/testing
 */
function generateMockQuote(pair: TokenPair, chain: Chain, dex: string): Quote {
  const basePrice = getBasePrice(pair)
  const baseLiquidity = getBaseLiquidity(pair, chain)
  
  return {
    dex,
    chain,
    pair,
    price: basePrice,
    liquidity: baseLiquidity,
    timestamp: Math.floor(Date.now() / 1000),
  }
}

/**
 * Get base price for a token pair (mock data)
 */
function getBasePrice(pair: TokenPair): number {
  const prices: Record<string, number> = {
    'USDC/USDT': 0.9995,
    'WETH/USDC': 2500,
    'WBTC/USDC': 45000,
    'MATIC/USDC': 0.8,
    'ARB/USDC': 1.2,
    'OP/USDC': 2.1,
  }
  
  const pairKey = `${pair.base}/${pair.quote}`
  return prices[pairKey] || 1.0
}

/**
 * Get base liquidity for a token pair on a chain (mock data)
 */
function getBaseLiquidity(pair: TokenPair, chain: Chain): number {
  const chainMultipliers: Record<Chain, number> = {
    ethereum: 1.0,
    polygon: 0.3,
    zircuit: 0.1,
    arbitrum: 0.4,
    optimism: 0.3,
  }
  
  const baseLiquidity = 50000 // $50K base liquidity
  const multiplier = chainMultipliers[chain] || 0.1
  
  return baseLiquidity * multiplier * (Math.random() * 0.5 + 0.75) // 75-125% variation
}

/**
 * Find arbitrage opportunities from quotes
 */
function findArbitrageOpportunities(
  quotes: Quote[],
  request: ScanRequest
): Opportunity[] {
  const opportunities: Opportunity[] = []

  // Group quotes by chain
  const quotesByChain = groupBy(quotes, quote => quote.chain)
  const chains = Object.keys(quotesByChain) as Chain[]

  // Find arbitrage between different chains
  for (let i = 0; i < chains.length; i++) {
    for (let j = i + 1; j < chains.length; j++) {
      const sourceChain = chains[i]
      const targetChain = chains[j]
      
      const sourceQuotes = quotesByChain[sourceChain] || []
      const targetQuotes = quotesByChain[targetChain] || []
      
      // Find best quotes on each chain
      const bestBuyQuote = findBestBuyQuote(sourceQuotes)
      const bestSellQuote = findBestSellQuote(targetQuotes)
      
      if (bestBuyQuote && bestSellQuote) {
        const opportunity = createOpportunity(
          bestBuyQuote,
          bestSellQuote,
          sourceChain,
          targetChain
        )
        
        if (opportunity && opportunity.grossPnlUsd > 0) {
          opportunities.push(opportunity)
        }
      }
      
      // Also check reverse direction
      const reverseBuyQuote = findBestBuyQuote(targetQuotes)
      const reverseSellQuote = findBestSellQuote(sourceQuotes)
      
      if (reverseBuyQuote && reverseSellQuote) {
        const reverseOpportunity = createOpportunity(
          reverseBuyQuote,
          reverseSellQuote,
          targetChain,
          sourceChain
        )
        
        if (reverseOpportunity && reverseOpportunity.grossPnlUsd > 0) {
          opportunities.push(reverseOpportunity)
        }
      }
    }
  }

  return opportunities
}

/**
 * Find the best quote for buying (lowest price)
 */
function findBestBuyQuote(quotes: Quote[]): Quote | null {
  if (quotes.length === 0) return null
  
  return quotes.reduce((best, current) => 
    current.price < best.price ? current : best
  )
}

/**
 * Find the best quote for selling (highest price)
 */
function findBestSellQuote(quotes: Quote[]): Quote | null {
  if (quotes.length === 0) return null
  
  return quotes.reduce((best, current) => 
    current.price > best.price ? current : best
  )
}

/**
 * Create arbitrage opportunity from buy and sell quotes
 */
function createOpportunity(
  buyQuote: Quote,
  sellQuote: Quote,
  sourceChain: Chain,
  targetChain: Chain
): Opportunity | null {
  const priceDiff = sellQuote.price - buyQuote.price
  if (priceDiff <= 0) return null
  
  // Calculate trade size based on available liquidity
  const maxTradeSize = Math.min(buyQuote.liquidity, sellQuote.liquidity)
  const tradeSize = Math.min(maxTradeSize, 10000) // Max $10K per trade
  
  const grossPnlUsd = (priceDiff / buyQuote.price) * tradeSize
  
  return {
    id: generateOpportunityId(buyQuote, sellQuote),
    pair: buyQuote.pair,
    sourceChain,
    targetChain,
    buyQuote,
    sellQuote,
    sizeDollar: tradeSize,
    grossPnlUsd,
    timestamp: Math.floor(Date.now() / 1000),
    status: 'new',
  }
}

/**
 * Generate unique ID for opportunity
 */
function generateOpportunityId(buyQuote: Quote, sellQuote: Quote): string {
  const pairStr = `${buyQuote.pair.base}-${buyQuote.pair.quote}`
  const routeStr = `${buyQuote.chain}-${sellQuote.chain}`
  const timestamp = Date.now()
  
  return `${pairStr}_${routeStr}_${timestamp}`
}

/**
 * Group array items by key function
 */
function groupBy<T, K extends string | number | symbol>(
  array: T[],
  keyFn: (item: T) => K
): Record<K, T[]> {
  const result = {} as Record<K, T[]>
  
  for (const item of array) {
    const key = keyFn(item)
    if (!result[key]) {
      result[key] = []
    }
    result[key].push(item)
  }
  
  return result
}
