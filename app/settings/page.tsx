import type { Metadata } from 'next'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { Slider } from '@/components/ui/slider'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { 
  Settings, 
  Shield, 
  Bell, 
  Database, 
  Zap, 
  Globe, 
  Lock,
  Save
} from 'lucide-react'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Settings - ArbiZirQ',
  description: 'Configure your arbitrage trading preferences and security settings',
}

export default function SettingsPage() {
  return (
    <div className="container mx-auto py-8 px-4">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
          <Link href="/dashboard" className="hover:text-foreground">Dashboard</Link>
          <span>/</span>
          <span>Settings</span>
        </div>
        <div className="flex items-center gap-3">
          <Settings className="w-8 h-8" />
          <div>
            <h1 className="text-3xl font-bold">Settings</h1>
            <p className="text-muted-foreground">
              Configure your trading preferences and account settings
            </p>
          </div>
        </div>
      </div>

      <Tabs defaultValue="trading" className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="trading">Trading</TabsTrigger>
          <TabsTrigger value="security">Security</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
          <TabsTrigger value="api">API</TabsTrigger>
          <TabsTrigger value="advanced">Advanced</TabsTrigger>
        </TabsList>

        {/* Trading Settings */}
        <TabsContent value="trading" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="w-5 h-5" />
                Trading Configuration
              </CardTitle>
              <CardDescription>
                Set your default trading parameters and risk management rules
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="defaultSlippage">Default Max Slippage (%)</Label>
                  <div className="px-3">
                    <Slider
                      id="defaultSlippage"
                      min={0.1}
                      max={5.0}
                      step={0.1}
                      defaultValue={[2.0]}
                      className="w-full"
                    />
                    <div className="flex justify-between text-xs text-muted-foreground mt-1">
                      <span>0.1%</span>
                      <span>2.0%</span>
                      <span>5.0%</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="minProfit">Minimum Profit Margin (%)</Label>
                  <div className="px-3">
                    <Slider
                      id="minProfit"
                      min={0.5}
                      max={10.0}
                      step={0.1}
                      defaultValue={[1.5]}
                      className="w-full"
                    />
                    <div className="flex justify-between text-xs text-muted-foreground mt-1">
                      <span>0.5%</span>
                      <span>1.5%</span>
                      <span>10.0%</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="maxPosition">Max Position Size (USD)</Label>
                  <Input
                    id="maxPosition"
                    type="number"
                    defaultValue="10000"
                    placeholder="10000"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="riskLevel">Risk Level</Label>
                  <Select defaultValue="moderate">
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="conservative">
                        <div className="flex items-center gap-2">
                          <Badge className="bg-green-100 text-green-800">Conservative</Badge>
                          <span className="text-sm">Low risk, steady gains</span>
                        </div>
                      </SelectItem>
                      <SelectItem value="moderate">
                        <div className="flex items-center gap-2">
                          <Badge className="bg-yellow-100 text-yellow-800">Moderate</Badge>
                          <span className="text-sm">Balanced approach</span>
                        </div>
                      </SelectItem>
                      <SelectItem value="aggressive">
                        <div className="flex items-center gap-2">
                          <Badge className="bg-red-100 text-red-800">Aggressive</Badge>
                          <span className="text-sm">High risk, high reward</span>
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <Separator />

              <div className="space-y-4">
                <h4 className="font-medium">Trading Preferences</h4>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Auto-execute trades</Label>
                      <p className="text-sm text-muted-foreground">
                        Automatically execute profitable arbitrage opportunities
                      </p>
                    </div>
                    <Switch />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Enable stop-loss</Label>
                      <p className="text-sm text-muted-foreground">
                        Automatically stop trading on significant losses
                      </p>
                    </div>
                    <Switch defaultChecked />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Use MEV protection</Label>
                      <p className="text-sm text-muted-foreground">
                        Protect trades from front-running attacks
                      </p>
                    </div>
                    <Switch defaultChecked />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Security Settings */}
        <TabsContent value="security" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="w-5 h-5" />
                Security & Privacy
              </CardTitle>
              <CardDescription>
                Manage your account security and private key settings
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Two-factor authentication</Label>
                    <p className="text-sm text-muted-foreground">
                      Add an extra layer of security to your account
                    </p>
                  </div>
                  <Button variant="outline" size="sm">
                    <Lock className="w-4 h-4 mr-2" />
                    Enable 2FA
                  </Button>
                </div>

                <Separator />

                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Require confirmation for large trades</Label>
                      <p className="text-sm text-muted-foreground">
                        Ask for confirmation on trades above $1000
                      </p>
                    </div>
                    <Switch defaultChecked />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Hardware wallet integration</Label>
                      <p className="text-sm text-muted-foreground">
                        Use hardware wallet for transaction signing
                      </p>
                    </div>
                    <Switch />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Notifications */}
        <TabsContent value="notifications" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="w-5 h-5" />
                Notification Preferences
              </CardTitle>
              <CardDescription>
                Choose how and when you want to be notified about trading activities
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Trade execution alerts</Label>
                    <p className="text-sm text-muted-foreground">
                      Get notified when trades are executed
                    </p>
                  </div>
                  <Switch defaultChecked />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>High-profit opportunity alerts</Label>
                    <p className="text-sm text-muted-foreground">
                      Alert when opportunities above 5% profit are found
                    </p>
                  </div>
                  <Switch defaultChecked />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>System maintenance notifications</Label>
                    <p className="text-sm text-muted-foreground">
                      Important updates and maintenance schedules
                    </p>
                  </div>
                  <Switch defaultChecked />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Weekly performance reports</Label>
                    <p className="text-sm text-muted-foreground">
                      Summary of your trading performance
                    </p>
                  </div>
                  <Switch />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* API Settings */}
        <TabsContent value="api" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Database className="w-5 h-5" />
                API Configuration
              </CardTitle>
              <CardDescription>
                Manage your API keys and external integrations
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="apiKey">API Key</Label>
                  <div className="flex gap-2">
                    <Input
                      id="apiKey"
                      type="password"
                      value="sk-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
                      readOnly
                    />
                    <Button variant="outline" size="sm">
                      Copy
                    </Button>
                    <Button variant="outline" size="sm">
                      Regenerate
                    </Button>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Rate Limits</Label>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div className="p-3 border rounded-lg">
                      <div className="font-medium">Requests per minute</div>
                      <div className="text-2xl font-bold text-blue-600">100</div>
                    </div>
                    <div className="p-3 border rounded-lg">
                      <div className="font-medium">Daily limit</div>
                      <div className="text-2xl font-bold text-green-600">10,000</div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Advanced Settings */}
        <TabsContent value="advanced" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Globe className="w-5 h-5" />
                Advanced Configuration
              </CardTitle>
              <CardDescription>
                Advanced settings for experienced users
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="rpcEndpoint">Custom RPC Endpoint</Label>
                  <Input
                    id="rpcEndpoint"
                    placeholder="https://eth-mainnet.alchemyapi.io/v2/your-api-key"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="gasPrice">Max Gas Price (Gwei)</Label>
                  <Input
                    id="gasPrice"
                    type="number"
                    defaultValue="50"
                    placeholder="50"
                  />
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Debug mode</Label>
                      <p className="text-sm text-muted-foreground">
                        Enable detailed logging for troubleshooting
                      </p>
                    </div>
                    <Switch />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Experimental features</Label>
                      <p className="text-sm text-muted-foreground">
                        Enable beta features and improvements
                      </p>
                    </div>
                    <Switch />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Save Button */}
      <div className="flex justify-end pt-6">
        <Button size="lg" className="min-w-[120px]">
          <Save className="w-4 h-4 mr-2" />
          Save Settings
        </Button>
      </div>
    </div>
  )
}
