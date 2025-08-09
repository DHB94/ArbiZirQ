// Formatting utilities for UI display

import type { Chain, TokenPair, Opportunity } from './types'

/**
 * Format number as USD currency
 */
export function formatUSD(amount: number, decimals: number = 2): string {
  const formatter = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  })
  return formatter.format(amount)
}

/**
 * Format number as percentage
 */
export function formatPercent(ratio: number, decimals: number = 2): string {
  const formatter = new Intl.NumberFormat('en-US', {
    style: 'percent',
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  })
  return formatter.format(ratio)
}

/**
 * Format basis points as percentage
 */
export function formatBasisPoints(bps: number): string {
  return formatPercent(bps / 10000, 2)
}

/**
 * Format large numbers with K/M/B suffixes
 */
export function formatCompact(num: number): string {
  const formatter = new Intl.NumberFormat('en-US', {
    notation: 'compact',
    maximumFractionDigits: 1,
  })
  return formatter.format(num)
}

/**
 * Format timestamp as relative time
 */
export function formatTimeAgo(timestamp: number): string {
  const now = Date.now() / 1000
  const diff = now - timestamp
  
  if (diff < 60) return `${Math.floor(diff)}s ago`
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`
  return `${Math.floor(diff / 86400)}d ago`
}

/**
 * Format duration in milliseconds
 */
export function formatDuration(ms: number): string {
  if (ms < 1000) return `${ms}ms`
  if (ms < 60000) return `${(ms / 1000).toFixed(1)}s`
  return `${(ms / 60000).toFixed(1)}m`
}

/**
 * Format token pair display
 */
export function formatTokenPair(pair: TokenPair): string {
  return `${pair.base}/${pair.quote}`
}

/**
 * Format chain name for display
 */
export function formatChainName(chain: Chain): string {
  const chainNames: Record<Chain, string> = {
    ethereum: 'Ethereum',
    polygon: 'Polygon',
    zircuit: 'Zircuit',
    arbitrum: 'Arbitrum',
    optimism: 'Optimism',
  }
  return chainNames[chain] || chain
}

/**
 * Format route display (source → target)
 */
export function formatRoute(sourceChain: Chain, targetChain: Chain): string {
  return `${formatChainName(sourceChain)} → ${formatChainName(targetChain)}`
}

/**
 * Get chain color for UI theming
 */
export function getChainColor(chain: Chain): string {
  const colors: Record<Chain, string> = {
    ethereum: 'bg-blue-100 text-blue-800',
    polygon: 'bg-purple-100 text-purple-800',
    zircuit: 'bg-green-100 text-green-800',
    arbitrum: 'bg-orange-100 text-orange-800',
    optimism: 'bg-red-100 text-red-800',
  }
  return colors[chain] || 'bg-gray-100 text-gray-800'
}

/**
 * Get status color for opportunity status
 */
export function getStatusColor(status: string): string {
  const colors: Record<string, string> = {
    new: 'bg-blue-100 text-blue-800',
    simulated: 'bg-yellow-100 text-yellow-800',
    executing: 'bg-orange-100 text-orange-800',
    executed: 'bg-green-100 text-green-800',
    failed: 'bg-red-100 text-red-800',
  }
  return colors[status] || 'bg-gray-100 text-gray-800'
}

/**
 * Get PnL color based on profit/loss
 */
export function getPnLColor(pnl: number): string {
  if (pnl > 0) return 'text-green-600'
  if (pnl < 0) return 'text-red-600'
  return 'text-gray-600'
}

/**
 * Truncate text with ellipsis
 */
export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text
  return text.slice(0, maxLength - 3) + '...'
}

/**
 * Format opportunity title for display
 */
export function formatOpportunityTitle(opportunity: Opportunity): string {
  return `${formatTokenPair(opportunity.pair)} - ${formatRoute(opportunity.sourceChain, opportunity.targetChain)}`
}

/**
 * Format address for display (show first and last 4 characters)
 */
export function formatAddress(address: string): string {
  if (address.length < 10) return address
  return `${address.slice(0, 6)}...${address.slice(-4)}`
}

/**
 * Format transaction hash for display
 */
export function formatTxHash(hash: string): string {
  return formatAddress(hash)
}

/**
 * Get explorer URL for a transaction
 */
export function getExplorerUrl(chain: Chain, txHash: string): string {
  const explorers: Record<Chain, string> = {
    ethereum: 'https://etherscan.io/tx/',
    polygon: 'https://polygonscan.com/tx/',
    zircuit: 'https://explorer.zircuit.com/tx/',
    arbitrum: 'https://arbiscan.io/tx/',
    optimism: 'https://optimistic.etherscan.io/tx/',
  }
  
  const baseUrl = explorers[chain]
  return baseUrl ? `${baseUrl}${txHash}` : '#'
}

/**
 * Format file size in bytes
 */
export function formatBytes(bytes: number): string {
  const units = ['B', 'KB', 'MB', 'GB']
  let size = bytes
  let unitIndex = 0
  
  while (size >= 1024 && unitIndex < units.length - 1) {
    size /= 1024
    unitIndex++
  }
  
  return `${size.toFixed(1)} ${units[unitIndex]}`
}
