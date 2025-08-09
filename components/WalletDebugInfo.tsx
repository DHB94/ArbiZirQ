'use client';

import { useAccount, useConnect, useDisconnect } from 'wagmi';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

export function WalletDebugInfo() {
  const { address, isConnected, isConnecting, isDisconnected, connector, chain } = useAccount();
  const { connect, connectors, isPending } = useConnect();
  const { disconnect } = useDisconnect();

  return (
    <Card className="max-w-md mx-auto mt-8">
      <CardHeader>
        <CardTitle className="text-sm">Wallet Debug Info</CardTitle>
        <CardDescription>Connection state and details</CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="grid grid-cols-2 gap-2 text-xs">
          <div>
            <strong>Connected:</strong> 
            <Badge variant={isConnected ? "default" : "secondary"} className="ml-2">
              {isConnected ? 'Yes' : 'No'}
            </Badge>
          </div>
          <div>
            <strong>Connecting:</strong>
            <Badge variant={isConnecting ? "default" : "secondary"} className="ml-2">
              {isConnecting ? 'Yes' : 'No'}
            </Badge>
          </div>
          <div>
            <strong>Disconnected:</strong>
            <Badge variant={isDisconnected ? "default" : "secondary"} className="ml-2">
              {isDisconnected ? 'Yes' : 'No'}
            </Badge>
          </div>
          <div>
            <strong>Pending:</strong>
            <Badge variant={isPending ? "default" : "secondary"} className="ml-2">
              {isPending ? 'Yes' : 'No'}
            </Badge>
          </div>
        </div>

        {address && (
          <div>
            <strong>Address:</strong>
            <p className="text-xs font-mono break-all mt-1">{address}</p>
          </div>
        )}

        {connector && (
          <div>
            <strong>Connector:</strong>
            <p className="text-xs mt-1">{connector.name}</p>
          </div>
        )}

        {chain && (
          <div>
            <strong>Chain:</strong>
            <p className="text-xs mt-1">{chain.name} (ID: {chain.id})</p>
          </div>
        )}

        <div className="space-y-2 pt-3 border-t">
          {!isConnected && connectors.map((connector) => (
            <Button
              key={connector.id}
              size="sm"
              variant="outline"
              onClick={() => connect({ connector })}
              disabled={isPending}
              className="w-full text-xs"
            >
              {connector.name}
            </Button>
          ))}

          {isConnected && (
            <Button
              size="sm"
              variant="destructive"
              onClick={() => disconnect()}
              className="w-full text-xs"
            >
              Disconnect
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
