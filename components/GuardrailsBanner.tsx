"use client"

import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import type { HealthStatus } from '@/lib/types'
import { AlertTriangle, Shield, CheckCircle } from 'lucide-react'

interface GuardrailsBannerProps {
  health?: HealthStatus
}

export function GuardrailsBanner({ health }: GuardrailsBannerProps) {
  if (!health) return null

  const hasIssues = !health.ok
  const issues: string[] = []
  
  if (health.zircuit !== 'ready') {
    issues.push('Zircuit connectivity issues')
  }
  
  if (health.gud !== 'ready') {
    issues.push('GUD Trading Engine unavailable')
  }
  
  if (health.bitte !== 'ready') {
    issues.push('Bitte orchestrator offline')
  }

  return (
    <Card className={`mb-6 ${hasIssues ? 'border-red-200 bg-red-50' : 'border-green-200 bg-green-50'}`}>
      <CardContent className="pt-4">
        <div className="flex items-start gap-3">
          {hasIssues ? (
            <AlertTriangle className="h-5 w-5 text-red-600 mt-0.5" />
          ) : (
            <Shield className="h-5 w-5 text-green-600 mt-0.5" />
          )}
          
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <h3 className={`font-medium ${hasIssues ? 'text-red-800' : 'text-green-800'}`}>
                System Guardrails
              </h3>
              <Badge 
                variant="secondary" 
                className={hasIssues ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'}
              >
                {hasIssues ? 'Issues Detected' : 'All Clear'}
              </Badge>
            </div>
            
            {hasIssues ? (
              <div>
                <p className="text-sm text-red-700 mb-2">
                  The following issues may affect arbitrage execution:
                </p>
                <ul className="text-sm text-red-600 space-y-1">
                  {issues.map((issue, index) => (
                    <li key={index} className="flex items-center gap-2">
                      <span className="w-1 h-1 bg-red-500 rounded-full" />
                      {issue}
                    </li>
                  ))}
                </ul>
              </div>
            ) : (
              <div className="space-y-2">
                <p className="text-sm text-green-700">
                  All systems operational. Active guardrails:
                </p>
                <div className="flex flex-wrap gap-2">
                  <div className="flex items-center gap-1 text-xs text-green-600">
                    <CheckCircle className="h-3 w-3" />
                    Quote freshness monitoring
                  </div>
                  <div className="flex items-center gap-1 text-xs text-green-600">
                    <CheckCircle className="h-3 w-3" />
                    Slippage protection
                  </div>
                  <div className="flex items-center gap-1 text-xs text-green-600">
                    <CheckCircle className="h-3 w-3" />
                    Minimum liquidity checks
                  </div>
                  <div className="flex items-center gap-1 text-xs text-green-600">
                    <CheckCircle className="h-3 w-3" />
                    Cross-chain validation
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
