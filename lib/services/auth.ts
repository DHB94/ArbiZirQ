// Authentication utilities for Bitte API integration

import type { NextRequest } from 'next/server'

export interface AuthResult {
  valid: boolean
  reason?: string
}

/**
 * Validate Bitte API authentication header
 */
export function validateBitteAuth(request: NextRequest): AuthResult {
  const expectedKey = process.env.BITTE_API_KEY
  
  if (!expectedKey) {
    return {
      valid: false,
      reason: 'Bitte API key not configured',
    }
  }

  const authHeader = request.headers.get('X-Bitte-Key')
  
  if (!authHeader) {
    return {
      valid: false,
      reason: 'Missing X-Bitte-Key header',
    }
  }

  if (authHeader !== expectedKey) {
    return {
      valid: false,
      reason: 'Invalid API key',
    }
  }

  return { valid: true }
}

/**
 * Validate request origin for CORS
 */
export function validateOrigin(request: NextRequest): AuthResult {
  const origin = request.headers.get('origin')
  
  // Allow same-origin requests
  if (!origin) return { valid: true }
  
  const allowedOrigins = [
    'http://localhost:3000',
    'http://localhost:3001',
    'https://arbizirq.vercel.app',
    // Add your production domains here
  ]
  
  if (allowedOrigins.includes(origin)) {
    return { valid: true }
  }
  
  return {
    valid: false,
    reason: 'Origin not allowed',
  }
}

/**
 * Rate limiting by IP address
 */
export function checkRateLimit(request: NextRequest): AuthResult {
  const ip = request.ip || request.headers.get('x-forwarded-for') || 'unknown'
  
  // In a real implementation, you would use Redis or a similar store
  // For now, we'll implement a simple in-memory rate limiter
  
  const now = Date.now()
  const windowMs = 60 * 1000 // 1 minute
  const maxRequests = 100
  
  // This is a simplified implementation
  // In production, use a proper rate limiting library like @upstash/ratelimit
  
  return { valid: true } // Allow all requests for now
}

/**
 * Validate API key format
 */
export function isValidApiKeyFormat(key: string): boolean {
  // Bitte API keys typically follow a specific format
  return /^bitte_[A-Za-z0-9]{24,}$/.test(key)
}

/**
 * Extract client info from request headers
 */
export function getClientInfo(request: NextRequest) {
  return {
    ip: request.ip || request.headers.get('x-forwarded-for') || 'unknown',
    userAgent: request.headers.get('user-agent') || 'unknown',
    origin: request.headers.get('origin') || 'unknown',
    timestamp: new Date().toISOString(),
  }
}

/**
 * Log authentication attempts (for security monitoring)
 */
export function logAuthAttempt(
  request: NextRequest,
  result: AuthResult,
  endpoint: string
) {
  const clientInfo = getClientInfo(request)
  
  console.log('Auth attempt:', {
    endpoint,
    success: result.valid,
    reason: result.reason,
    client: clientInfo,
  })
  
  // In production, you might want to send this to a logging service
  // or security monitoring system
}
