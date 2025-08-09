"use client"

import { useState, useEffect } from 'react'
import useSWR from 'swr'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { OpportunityTable } from '@/components/OpportunityTable'
import { SimulateDrawer } from '@/components/SimulateDrawer'
import { ExecuteDialog } from '@/components/ExecuteDialog'
import { SettingsSheet } from '@/components/SettingsSheet'
import { GuardrailsBanner } from '@/components/GuardrailsBanner'
import { Toast } from '@/components/Toast'
import { apiClient, swrKeys } from '@/lib/api'
import type { Opportunity, ScanRequest } from '@/lib/types'
import { DEFAULT_TOKEN_PAIRS, SUPPORTED_CHAINS, DEFAULT_SETTINGS } from '@/lib/constants'
import { Settings, RefreshCw, Activity } from 'lucide-react'

export default function Dashboard() {
  const [scanRequest, setScanRequest] = useState<ScanRequest>({
    pairs: DEFAULT_TOKEN_PAIRS.slice(0, 2), // Start with 2 pairs
    chains: ['ethereum', 'polygon', 'zircuit'],
    minProfitUsd: DEFAULT_SETTINGS.minProfitUsd,
    maxSlippageBps: DEFAULT_SETTINGS.maxSlippageBps,
  })

  const [selectedOpportunity, setSelectedOpportunity] = useState<Opportunity | null>(null)
  const [showSimulateDrawer, setShowSimulateDrawer] = useState(false)
  const [showExecuteDialog, setShowExecuteDialog] = useState(false)
  const [showSettingsSheet, setShowSettingsSheet] = useState(false)
  const [pollingEnabled, setPollingEnabled] = useState(true)
  const [pollingInterval, setPollingInterval] = useState(5000)
  const [toastMessage, setToastMessage] = useState<string | null>(null)
  const [toastType, setToastType] = useState<'success' | 'error' | 'warning'>('success')

  // Fetch opportunities with SWR polling
  const { data: opportunities, error, isLoading, mutate } = useSWR(
    swrKeys.scan(scanRequest),
    () => apiClient.scanMarkets(scanRequest),
    {
      refreshInterval: pollingEnabled ? pollingInterval : 0,
      revalidateOnFocus: false,
    }
  )

  // Health check
  const { data: health } = useSWR(
    swrKeys.health,
    () => apiClient.getHealth(),
    { refreshInterval: 30000 } // Check every 30 seconds
  )

  const showToast = (message: string, type: 'success' | 'error' | 'warning' = 'success') => {
    setToastMessage(message)
    setToastType(type)
    setTimeout(() => setToastMessage(null), 3000)
  }

  const handleSimulate = (opportunity: Opportunity) => {
    setSelectedOpportunity(opportunity)
    setShowSimulateDrawer(true)
  }

  const handleExecute = (opportunity: Opportunity) => {
    setSelectedOpportunity(opportunity)
    setShowExecuteDialog(true)
  }

  const handleSimulationComplete = (success: boolean, message: string) => {
    setShowSimulateDrawer(false)
    if (success) {
      showToast(message, 'success')
      setShowExecuteDialog(true)
    } else {
      showToast(message, 'error')
    }
  }

  const handleExecutionComplete = (success: boolean, message: string) => {
    setShowExecuteDialog(false)
    showToast(message, success ? 'success' : 'error')
    if (success) {
      mutate() // Refresh opportunities
    }
  }

  const handleRefresh = () => {
    mutate()
    showToast('Refreshing opportunities...', 'success')
  }

  const isHealthy = health?.ok ?? false
  const hasOpportunities = opportunities && opportunities.length > 0

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">ArbiZirQ</h1>
            <p className="text-muted-foreground">
              Flash Arbitrage Executor - Zircuit × Bitte
            </p>
          </div>
          
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="icon"
              onClick={handleRefresh}
              disabled={isLoading}
            >
              <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
            </Button>
            
            <Button
              variant="outline"
              size="icon"
              onClick={() => setShowSettingsSheet(true)}
            >
              <Settings className="h-4 w-4" />
            </Button>
            
            <div className="flex items-center gap-2">
              <div 
                className={`h-2 w-2 rounded-full ${
                  isHealthy ? 'bg-green-500' : 'bg-red-500'
                }`} 
              />
              <span className="text-sm text-muted-foreground">
                {isHealthy ? 'Healthy' : 'Issues'}
              </span>
            </div>
          </div>
        </div>

        {/* Guardrails Banner */}
        <GuardrailsBanner health={health} />

        {/* Main Content */}
        <div className="grid gap-6">
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Opportunities Found
                </CardTitle>
                <Activity className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {opportunities?.length ?? 0}
                </div>
                <p className="text-xs text-muted-foreground">
                  Active opportunities
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Best Opportunity
                </CardTitle>
                <Activity className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  ${opportunities?.[0]?.grossPnlUsd.toFixed(2) ?? '0.00'}
                </div>
                <p className="text-xs text-muted-foreground">
                  Gross PnL (USD)
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Polling Status
                </CardTitle>
                <Activity className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {pollingEnabled ? 'ON' : 'OFF'}
                </div>
                <p className="text-xs text-muted-foreground">
                  {pollingInterval / 1000}s interval
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  System Status
                </CardTitle>
                <Activity className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {isHealthy ? '✅' : '⚠️'}
                </div>
                <p className="text-xs text-muted-foreground">
                  All systems
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Opportunities Table */}
          <Card>
            <CardHeader>
              <CardTitle>Arbitrage Opportunities</CardTitle>
              <CardDescription>
                Real-time cross-chain arbitrage opportunities sorted by profitability
              </CardDescription>
            </CardHeader>
            <CardContent>
              <OpportunityTable
                opportunities={opportunities ?? []}
                isLoading={isLoading}
                error={error}
                onSimulate={handleSimulate}
                onExecute={handleExecute}
              />
            </CardContent>
          </Card>
        </div>

        {/* Modals and Drawers */}
        {selectedOpportunity && (
          <>
            <SimulateDrawer
              opportunity={selectedOpportunity}
              open={showSimulateDrawer}
              onOpenChange={setShowSimulateDrawer}
              onComplete={handleSimulationComplete}
            />
            
            <ExecuteDialog
              opportunity={selectedOpportunity}
              open={showExecuteDialog}
              onOpenChange={setShowExecuteDialog}
              onComplete={handleExecutionComplete}
            />
          </>
        )}

        <SettingsSheet
          open={showSettingsSheet}
          onOpenChange={setShowSettingsSheet}
          scanRequest={scanRequest}
          onScanRequestChange={setScanRequest}
          pollingEnabled={pollingEnabled}
          onPollingEnabledChange={setPollingEnabled}
          pollingInterval={pollingInterval}
          onPollingIntervalChange={setPollingInterval}
        />

        {/* Toast Notifications */}
        {toastMessage && (
          <Toast
            message={toastMessage}
            type={toastType}
            onClose={() => setToastMessage(null)}
          />
        )}
      </div>
    </div>
  )
}
