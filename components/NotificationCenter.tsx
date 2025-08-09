"use client"

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  Bell, 
  TrendingUp, 
  AlertTriangle, 
  CheckCircle, 
  X,
  DollarSign,
  Activity
} from 'lucide-react'
import { formatUSD, formatTimeAgo } from '@/lib/format'

interface Notification {
  id: string
  type: 'opportunity' | 'trade' | 'system' | 'warning'
  title: string
  message: string
  timestamp: number
  read: boolean
  data?: any
}

const MOCK_NOTIFICATIONS: Notification[] = [
  {
    id: '1',
    type: 'opportunity',
    title: 'High Profit Opportunity',
    message: 'ETH/USDC arbitrage opportunity with 3.2% profit detected on Ethereum → Arbitrum',
    timestamp: Date.now() - 300000, // 5 minutes ago
    read: false,
    data: { profit: 68.45, pair: 'ETH/USDC' }
  },
  {
    id: '2',
    type: 'trade',
    title: 'Trade Executed Successfully',
    message: 'USDC/USDT arbitrage completed with $15.60 profit',
    timestamp: Date.now() - 1800000, // 30 minutes ago
    read: false,
    data: { profit: 15.60, pair: 'USDC/USDT' }
  },
  {
    id: '3',
    type: 'system',
    title: 'System Health Check',
    message: 'All services operational - GUD, Zircuit, and Bitte are connected',
    timestamp: Date.now() - 3600000, // 1 hour ago
    read: true
  },
  {
    id: '4',
    type: 'warning',
    title: 'High Slippage Warning',
    message: 'Opportunity rejected: slippage exceeds 2.5% threshold',
    timestamp: Date.now() - 5400000, // 1.5 hours ago
    read: true
  }
]

export function NotificationCenter() {
  const [notifications, setNotifications] = useState<Notification[]>(MOCK_NOTIFICATIONS)
  const [isOpen, setIsOpen] = useState(false)

  const unreadCount = notifications.filter(n => !n.read).length

  const markAsRead = (id: string) => {
    setNotifications(prev => 
      prev.map(n => n.id === id ? { ...n, read: true } : n)
    )
  }

  const markAllAsRead = () => {
    setNotifications(prev => 
      prev.map(n => ({ ...n, read: true }))
    )
  }

  const removeNotification = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id))
  }

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'opportunity': return <TrendingUp className="h-4 w-4 text-green-600" />
      case 'trade': return <DollarSign className="h-4 w-4 text-blue-600" />
      case 'system': return <CheckCircle className="h-4 w-4 text-green-600" />
      case 'warning': return <AlertTriangle className="h-4 w-4 text-yellow-600" />
      default: return <Bell className="h-4 w-4 text-gray-600" />
    }
  }

  const getNotificationColor = (type: string) => {
    switch (type) {
      case 'opportunity': return 'bg-green-100 text-green-800'
      case 'trade': return 'bg-blue-100 text-blue-800'
      case 'system': return 'bg-green-100 text-green-800'
      case 'warning': return 'bg-yellow-100 text-yellow-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  // Simulate real-time notifications
  useEffect(() => {
    const interval = setInterval(() => {
      // Add a random notification occasionally
      if (Math.random() < 0.1) { // 10% chance every 5 seconds
        const newNotification: Notification = {
          id: Date.now().toString(),
          type: Math.random() > 0.5 ? 'opportunity' : 'system',
          title: Math.random() > 0.5 ? 'New Opportunity Detected' : 'System Update',
          message: Math.random() > 0.5 
            ? `New arbitrage opportunity with ${(Math.random() * 5 + 1).toFixed(2)}% profit`
            : 'System performing health checks...',
          timestamp: Date.now(),
          read: false
        }
        setNotifications(prev => [newNotification, ...prev.slice(0, 9)]) // Keep only 10 notifications
      }
    }, 5000)

    return () => clearInterval(interval)
  }, [])

  return (
    <div className="relative">
      {/* Notification Bell */}
      <Button
        variant="outline"
        size="icon"
        onClick={() => setIsOpen(!isOpen)}
        className="relative"
      >
        <Bell className="h-4 w-4" />
        {unreadCount > 0 && (
          <Badge 
            variant="destructive" 
            className="absolute -top-1 -right-1 h-5 w-5 p-0 text-xs flex items-center justify-center"
          >
            {unreadCount > 9 ? '9+' : unreadCount}
          </Badge>
        )}
      </Button>

      {/* Notification Panel */}
      {isOpen && (
        <Card className="absolute right-0 top-12 w-96 max-h-96 overflow-hidden z-50 shadow-lg">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">Notifications</CardTitle>
              <div className="flex items-center gap-2">
                {unreadCount > 0 && (
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={markAllAsRead}
                    className="text-xs"
                  >
                    Mark all read
                  </Button>
                )}
                <Button 
                  variant="ghost" 
                  size="icon" 
                  onClick={() => setIsOpen(false)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardHeader>
          
          <CardContent className="p-0 max-h-80 overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Bell className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No notifications</p>
              </div>
            ) : (
              <div className="space-y-1">
                {notifications.map((notification) => (
                  <div
                    key={notification.id}
                    className={`p-4 border-b hover:bg-muted/50 cursor-pointer ${
                      !notification.read ? 'bg-blue-50' : ''
                    }`}
                    onClick={() => markAsRead(notification.id)}
                  >
                    <div className="flex items-start gap-3">
                      <div className="mt-1">
                        {getNotificationIcon(notification.type)}
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <h4 className={`text-sm font-medium ${!notification.read ? 'font-semibold' : ''}`}>
                                {notification.title}
                              </h4>
                              <Badge 
                                variant="secondary" 
                                className={`text-xs ${getNotificationColor(notification.type)}`}
                              >
                                {notification.type.toUpperCase()}
                              </Badge>
                            </div>
                            <p className="text-sm text-muted-foreground">
                              {notification.message}
                            </p>
                            <p className="text-xs text-muted-foreground mt-1">
                              {formatTimeAgo(notification.timestamp)}
                            </p>
                          </div>
                          
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={(e) => {
                              e.stopPropagation()
                              removeNotification(notification.id)
                            }}
                            className="h-6 w-6 opacity-50 hover:opacity-100"
                          >
                            <X className="h-3 w-3" />
                          </Button>
                        </div>
                        
                        {notification.data?.profit && (
                          <div className="mt-2 text-sm font-medium text-green-600">
                            Profit: {formatUSD(notification.data.profit)}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  )
}
