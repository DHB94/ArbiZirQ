// Constants used throughout the application

import type { Chain, TokenPair } from './types'

// Supported chains
export const SUPPORTED_CHAINS: Chain[] = [
  'ethereum',
  'polygon', 
  'zircuit',
  'arbitrum',
  'optimism'
]

// Default token pairs to monitor
export const DEFAULT_TOKEN_PAIRS: TokenPair[] = [
  { base: 'USDC', quote: 'USDT' },
  { base: 'WETH', quote: 'USDC' },
  { base: 'WBTC', quote: 'USDC' },
  { base: 'MATIC', quote: 'USDC' },
  { base: 'ARB', quote: 'USDC' },
  { base: 'OP', quote: 'USDC' },
]

// Chain RPC endpoints (fallbacks if env vars not set)
export const DEFAULT_RPC_URLS: Record<Chain, string> = {
  ethereum: 'https://ethereum.publicnode.com',
  polygon: 'https://polygon.rpc.blxrbdn.com',
  zircuit: 'https://mainnet.zircuit.com',
  arbitrum: 'https://arbitrum.public-rpc.com',
  optimism: 'https://optimism.public-rpc.com',
}

// Popular DEXs by chain
export const CHAIN_DEXS: Record<Chain, string[]> = {
  ethereum: ['uniswap-v3', 'uniswap-v2', 'sushiswap', 'balancer', 'curve'],
  polygon: ['quickswap', 'sushiswap', 'uniswap-v3', 'balancer', 'curve'],
  zircuit: ['zircuit-dex'], // Placeholder for Zircuit native DEXs
  arbitrum: ['uniswap-v3', 'sushiswap', 'balancer', 'curve', 'camelot'],
  optimism: ['uniswap-v3', 'sushiswap', 'balancer', 'curve', 'velodrome'],
}

// Fee estimates (in basis points)
export const DEX_FEE_BPS: Record<string, number> = {
  'uniswap-v3': 5,   // 0.05%
  'uniswap-v2': 30,  // 0.30%
  'sushiswap': 30,   // 0.30%
  'quickswap': 25,   // 0.25%
  'balancer': 10,    // 0.10%
  'curve': 4,        // 0.04%
  'camelot': 20,     // 0.20%
  'velodrome': 5,    // 0.05%
  'zircuit-dex': 25, // 0.25% (estimated)
}

// Default application settings
export const DEFAULT_SETTINGS = {
  minProfitUsd: 10,
  maxSlippageBps: 500, // 5% - More realistic for cross-chain arbitrage
  pollingIntervalMs: 5000,
  maxQuoteAgeSeconds: 30,
  dryRunMode: false,
} as const

// API endpoints
export const API_ENDPOINTS = {
  health: '/api/health',
  scan: '/api/scan',
  simulate: '/api/simulate',
  execute: '/api/execute',
  aiAnalyze: '/api/ai-analyze',
  optimize: '/api/optimize',
} as const

// UI polling intervals (in milliseconds)
export const POLLING_INTERVALS = {
  fast: 3000,
  medium: 5000,
  slow: 10000,
} as const

// Maximum number of opportunities to display
export const MAX_OPPORTUNITIES = 50

// Toast notification timeouts
export const TOAST_TIMEOUT = {
  success: 3000,
  error: 5000,
  warning: 4000,
} as const

// Opportunity status display names
export const STATUS_LABELS: Record<string, string> = {
  new: 'New',
  simulated: 'Simulated',
  executing: 'Executing',
  executed: 'Executed',
  failed: 'Failed',
}

// Guardrail thresholds
export const GUARDRAILS = {
  maxSlippageBps: 500,     // 5% max slippage
  minLiquidityUsd: 1000,   // $1K min liquidity
  maxTradeSize: 100000,    // $100K max trade size
  maxQuoteAgeSeconds: 60,  // 1 minute max quote age
} as const

// Gas price multipliers for different chains
export const GAS_MULTIPLIERS: Record<Chain, number> = {
  ethereum: 20,
  polygon: 0.1,
  zircuit: 0.5,
  arbitrum: 1,
  optimism: 1,
}

// Bridge fee estimates (base fees in USD)
export const BRIDGE_BASE_FEES: Record<Chain, number> = {
  ethereum: 15,
  polygon: 2,
  zircuit: 1,
  arbitrum: 3,
  optimism: 3,
}

// Token addresses for popular tokens (for contract calls)
export const TOKEN_ADDRESSES: Record<Chain, Record<string, string>> = {
  ethereum: {
    USDC: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48', // Fixed address
    USDT: '0xdAC17F958D2ee523a2206206994597C13D831ec7',
    WETH: '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2',
    WBTC: '0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599',
  },
  polygon: {
    USDC: '0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174',
    USDT: '0xc2132D05D31c914a87C6611C10748AEb04B58e8F',
    WETH: '0x7ceB23fD6bC0adD59E62ac25578270cFf1b9f619',
    WMATIC: '0x0d500B1d8E8eF31E21C99d1Db9A6444d3ADf1270',
  },
  zircuit: {
    // Placeholder addresses - using Ethereum addresses as placeholders for testing
    USDC: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48',
    USDT: '0xdAC17F958D2ee523a2206206994597C13D831ec7',
    WETH: '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2',
    WBTC: '0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599',
  },
  arbitrum: {
    USDC: '0xaf88d065e77c8cC2239327C5EDb3A432268e5831', // Updated to correct address
    USDT: '0xFd086bC7CD5C481DCC9C85ebE478A1C0b69FCbb9',
    WETH: '0x82aF49447D8a07e3bd95BD0d56f35241523fBab1',
    WBTC: '0x2f2a2543B76A4166549F7aaB2e75Bef0aefC5B0f',
  },
  optimism: {
    USDC: '0x7F5c764cBc14f9669B88837ca1490cCa17c31607',
    USDT: '0x94b008aA00579c1307B0EF2c499aD98a8ce58e58',
    WETH: '0x4200000000000000000000000000000000000006',
    WBTC: '0x68f180fcCe6836688e9084f035309E29Bf0A2095',
  },
}

// Environment variable keys
export const ENV_KEYS = {
  ZIRCUIT_RPC_URL: 'ZIRCUIT_RPC_URL',
  GUD_API_KEY: 'GUD_API_KEY',
  BITTE_API_KEY: 'BITTE_API_KEY',
  ETHEREUM_RPC_URL: 'ETHEREUM_RPC_URL',
  POLYGON_RPC_URL: 'POLYGON_RPC_URL',
  DRY_RUN_MODE: 'DRY_RUN_MODE',
} as const
