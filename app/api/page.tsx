"use client"

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { 
  Code, 
  Copy, 
  ExternalLink, 
  Play, 
  CheckCircle,
  Book,
  Zap,
  Shield
} from 'lucide-react'

export default function APIPage() {
  const [apiKey, setApiKey] = useState('')
  const [testResponse, setTestResponse] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
  }

  const testEndpoint = async (endpoint: string, method: string, body?: any) => {
    setIsLoading(true)
    try {
      const response = await fetch(`/api/${endpoint}`, {
        method,
        headers: {
          'Content-Type': 'application/json',
          ...(apiKey && { 'Authorization': `Bearer ${apiKey}` })
        },
        ...(body && { body: JSON.stringify(body) })
      })
      const data = await response.json()
      setTestResponse(JSON.stringify(data, null, 2))
    } catch (error) {
      setTestResponse(`Error: ${error}`)
    }
    setIsLoading(false)
  }

  const endpoints = [
    {
      name: 'Health Check',
      method: 'GET',
      path: '/api/health',
      description: 'Check the status of all integrated services',
      example: `curl -X GET http://localhost:3000/api/health`,
      response: `{
  "ok": true,
  "timestamp": 1640995200000,
  "services": {
    "zircuit": "ready",
    "gud": "ready", 
    "bitte": "ready"
  }
}`
    },
    {
      name: 'Scan Markets',
      method: 'POST',
      path: '/api/scan',
      description: 'Scan for arbitrage opportunities across chains',
      example: `curl -X POST http://localhost:3000/api/scan \\
  -H "Content-Type: application/json" \\
  -d '{
    "pairs": [{"base": "ETH", "quote": "USDC"}],
    "chains": ["ethereum", "arbitrum"],
    "minProfitUsd": 10,
    "maxSlippageBps": 500
  }'`,
      response: `[
  {
    "id": "ETH-USDC_ethereum-arbitrum_1640995200",
    "pair": {"base": "ETH", "quote": "USDC"},
    "sourceChain": "ethereum",
    "targetChain": "arbitrum",
    "sizeDollar": 2150.30,
    "grossPnlUsd": 42.15,
    "timestamp": 1640995200
  }
]`
    },
    {
      name: 'Simulate Trade',
      method: 'POST',
      path: '/api/simulate',
      description: 'Simulate arbitrage execution with detailed fee breakdown',
      example: `curl -X POST http://localhost:3000/api/simulate \\
  -H "Content-Type: application/json" \\
  -d '{
    "id": "ETH-USDC_ethereum-arbitrum_1640995200",
    "pair": {"base": "ETH", "quote": "USDC"},
    "sourceChain": "ethereum",
    "targetChain": "arbitrum",
    "sizeDollar": 2150.30,
    "grossPnlUsd": 42.15,
    "maxSlippageBps": 500
  }'`,
      response: `{
  "ok": true,
  "netPnlUsd": 18.45,
  "breakdown": {
    "swapFees": 8.60,
    "bridgeFees": 12.50,
    "gasEstimate": 45,
    "routingFees": 2.60,
    "total": 23.70
  },
  "slippageImpact": 225
}`
    },
    {
      name: 'Execute Trade',
      method: 'POST',
      path: '/api/execute',
      description: 'Execute arbitrage trade (requires authentication)',
      example: `curl -X POST http://localhost:3000/api/execute \\
  -H "Content-Type: application/json" \\
  -H "Authorization: Bearer YOUR_API_KEY" \\
  -d '{
    "id": "ETH-USDC_ethereum-arbitrum_1640995200",
    "maxSlippageBps": 500,
    "confirmSimulation": true
  }'`,
      response: `{
  "ok": true,
  "transactionHash": "0x123...abc",
  "executionId": "exec_1640995200",
  "estimatedCompletion": 1640995260
}`
    }
  ]

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto p-6">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight mb-2">ArbiZirQ API</h1>
          <p className="text-muted-foreground text-lg">
            Programmatic access to cross-chain arbitrage opportunities and execution
          </p>
        </div>

        {/* Quick Start */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Zap className="h-5 w-5" />
              Quick Start
            </CardTitle>
            <CardDescription>Get started with the ArbiZirQ API in minutes</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="api-key">API Key (Optional for testing)</Label>
              <div className="flex gap-2 mt-2">
                <Input
                  id="api-key"
                  placeholder="Enter your API key for authenticated endpoints"
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                />
                <Button variant="outline">
                  <ExternalLink className="h-4 w-4 mr-2" />
                  Get Key
                </Button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="flex items-center gap-3 p-3 border rounded-lg">
                <CheckCircle className="h-5 w-5 text-green-600" />
                <div>
                  <div className="font-medium text-sm">Base URL</div>
                  <div className="text-xs text-muted-foreground">http://localhost:3000</div>
                </div>
              </div>
              
              <div className="flex items-center gap-3 p-3 border rounded-lg">
                <Shield className="h-5 w-5 text-blue-600" />
                <div>
                  <div className="font-medium text-sm">Rate Limits</div>
                  <div className="text-xs text-muted-foreground">100 req/min</div>
                </div>
              </div>
              
              <div className="flex items-center gap-3 p-3 border rounded-lg">
                <Book className="h-5 w-5 text-purple-600" />
                <div>
                  <div className="font-medium text-sm">Response Format</div>
                  <div className="text-xs text-muted-foreground">JSON</div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* API Documentation */}
        <Tabs defaultValue="endpoints" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="endpoints">Endpoints</TabsTrigger>
            <TabsTrigger value="playground">API Playground</TabsTrigger>
            <TabsTrigger value="examples">Code Examples</TabsTrigger>
          </TabsList>

          <TabsContent value="endpoints" className="space-y-6">
            <div className="space-y-6">
              {endpoints.map((endpoint, index) => (
                <Card key={index}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle className="text-lg">{endpoint.name}</CardTitle>
                        <CardDescription>{endpoint.description}</CardDescription>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant={endpoint.method === 'GET' ? 'secondary' : 'default'}>
                          {endpoint.method}
                        </Badge>
                        <code className="text-sm bg-muted px-2 py-1 rounded">
                          {endpoint.path}
                        </code>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <Label className="text-sm font-medium mb-2 block">Request Example</Label>
                      <div className="relative">
                        <pre className="bg-muted p-4 rounded-lg text-sm overflow-x-auto">
                          <code>{endpoint.example}</code>
                        </pre>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="absolute top-2 right-2"
                          onClick={() => copyToClipboard(endpoint.example)}
                        >
                          <Copy className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>

                    <div>
                      <Label className="text-sm font-medium mb-2 block">Response Example</Label>
                      <div className="relative">
                        <pre className="bg-muted p-4 rounded-lg text-sm overflow-x-auto">
                          <code>{endpoint.response}</code>
                        </pre>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="absolute top-2 right-2"
                          onClick={() => copyToClipboard(endpoint.response)}
                        >
                          <Copy className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>

                    <Button
                      onClick={() => testEndpoint(endpoint.path.replace('/api/', ''), endpoint.method)}
                      disabled={isLoading}
                      className="w-full"
                    >
                      <Play className="h-4 w-4 mr-2" />
                      Test Endpoint
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="playground" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>API Playground</CardTitle>
                <CardDescription>Test API endpoints directly from your browser</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {testResponse && (
                  <div>
                    <Label className="text-sm font-medium mb-2 block">Response</Label>
                    <div className="relative">
                      <pre className="bg-muted p-4 rounded-lg text-sm overflow-x-auto max-h-96">
                        <code>{testResponse}</code>
                      </pre>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="absolute top-2 right-2"
                        onClick={() => copyToClipboard(testResponse)}
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                )}
                
                <div className="grid grid-cols-2 gap-4">
                  <Button 
                    onClick={() => testEndpoint('health', 'GET')}
                    disabled={isLoading}
                  >
                    Test Health Check
                  </Button>
                  <Button 
                    onClick={() => testEndpoint('scan', 'POST', {
                      pairs: [{"base": "ETH", "quote": "USDC"}],
                      chains: ["ethereum", "arbitrum"],
                      minProfitUsd: 10,
                      maxSlippageBps: 500
                    })}
                    disabled={isLoading}
                  >
                    Test Market Scan
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="examples" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>JavaScript Example</CardTitle>
                </CardHeader>
                <CardContent>
                  <pre className="bg-muted p-4 rounded-lg text-sm overflow-x-auto">
                    <code>{`// Scan for opportunities
const response = await fetch('/api/scan', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    pairs: [{"base": "ETH", "quote": "USDC"}],
    chains: ["ethereum", "arbitrum"],
    minProfitUsd: 10,
    maxSlippageBps: 500
  })
});

const opportunities = await response.json();
console.log(opportunities);`}</code>
                  </pre>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Python Example</CardTitle>
                </CardHeader>
                <CardContent>
                  <pre className="bg-muted p-4 rounded-lg text-sm overflow-x-auto">
                    <code>{`import requests

# Scan for opportunities
response = requests.post('http://localhost:3000/api/scan', 
  json={
    "pairs": [{"base": "ETH", "quote": "USDC"}],
    "chains": ["ethereum", "arbitrum"],
    "minProfitUsd": 10,
    "maxSlippageBps": 500
  }
)

opportunities = response.json()
print(opportunities)`}</code>
                  </pre>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
