import { z } from 'zod'

// Core types
export const ChainSchema = z.enum(['ethereum', 'polygon', 'zircuit', 'arbitrum', 'optimism'])
export type Chain = z.infer<typeof ChainSchema>

export const TokenPairSchema = z.object({
  base: z.string(),
  quote: z.string(),
})
export type TokenPair = z.infer<typeof TokenPairSchema>

export const QuoteSchema = z.object({
  dex: z.string(),
  chain: ChainSchema,
  pair: TokenPairSchema,
  price: z.number(),
  liquidity: z.number(),
  timestamp: z.number(),
})
export type Quote = z.infer<typeof QuoteSchema>

export const OpportunityStatusSchema = z.enum(['new', 'simulated', 'executing', 'executed', 'failed'])
export type OpportunityStatus = z.infer<typeof OpportunityStatusSchema>

export const OpportunitySchema = z.object({
  id: z.string(),
  pair: TokenPairSchema,
  sourceChain: ChainSchema,
  targetChain: ChainSchema,
  buyQuote: QuoteSchema,
  sellQuote: QuoteSchema,
  sizeDollar: z.number(),
  grossPnlUsd: z.number(),
  timestamp: z.number(),
  status: OpportunityStatusSchema.default('new'),
})
export type Opportunity = z.infer<typeof OpportunitySchema>

export const FeeBreakdownSchema = z.object({
  swapFees: z.number(),
  bridgeFees: z.number(),
  gasEstimate: z.number(),
  routingFees: z.number(),
  total: z.number(),
})
export type FeeBreakdown = z.infer<typeof FeeBreakdownSchema>

export const SimulationResultSchema = z.object({
  netPnlUsd: z.number(),
  ok: z.boolean(),
  breakdown: FeeBreakdownSchema,
  notes: z.array(z.string()),
  slippageImpact: z.number(),
})
export type SimulationResult = z.infer<typeof SimulationResultSchema>

export const ExecutionResultSchema = z.object({
  txHash: z.string(),
  receipts: z.array(z.any()),
  zircuitLatencyMs: z.number().optional(),
  actualPnlUsd: z.number().optional(),
})
export type ExecutionResult = z.infer<typeof ExecutionResultSchema>

export const HealthStatusSchema = z.object({
  ok: z.boolean(),
  zircuit: z.enum(['ready', 'down', 'error']),
  gud: z.enum(['ready', 'down', 'error']),
  bitte: z.enum(['ready', 'down', 'error']),
  timestamp: z.number(),
})
export type HealthStatus = z.infer<typeof HealthStatusSchema>

// Request schemas
export const ScanRequestSchema = z.object({
  pairs: z.array(TokenPairSchema),
  chains: z.array(ChainSchema),
  minProfitUsd: z.number().default(10),
  maxSlippageBps: z.number().default(100),
})
export type ScanRequest = z.infer<typeof ScanRequestSchema>

export const SimulateRequestSchema = OpportunitySchema.extend({
  maxSlippageBps: z.number().default(100),
})
export type SimulateRequest = z.infer<typeof SimulateRequestSchema>

export const ExecuteRequestSchema = OpportunitySchema.extend({
  dryRun: z.boolean().default(false),
  maxSlippageBps: z.number().default(100),
  userAddress: z.string().optional(),
})
export type ExecuteRequest = z.infer<typeof ExecuteRequestSchema>

// Response schemas
export const ScanResponseSchema = z.array(OpportunitySchema)
export type ScanResponse = z.infer<typeof ScanResponseSchema>
