'use client';

import { useAccount, useChainId, useBalance } from 'wagmi';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Wallet, AlertTriangle, CheckCircle, Copy } from 'lucide-react';
import { useState, useEffect } from 'react';

const SUPPORTED_CHAIN_IDS = {
  1: 'Ethereum',
  137: 'Polygon', 
  42161: 'Arbitrum',
  8453: 'Base',
  48900: 'Zircuit',
  48899: 'Zircuit Testnet',
  11155111: 'Sepolia'
};

export function WalletConnectionCard() {
  const { address, isConnected, connector } = useAccount();
  const chainId = useChainId();
  const [copied, setCopied] = useState(false);
  const [isClient, setIsClient] = useState(false);
  
  const { data: balance } = useBalance({
    address: address,
  });

  // Handle client-side hydration
  useEffect(() => {
    setIsClient(true);
  }, []);

  const copyAddress = async () => {
    if (address && navigator?.clipboard) {
      try {
        await navigator.clipboard.writeText(address);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      } catch (error) {
        // Fallback for older browsers
        console.warn('Clipboard API not available');
      }
    }
  };

  const formatAddress = (addr: string) => {
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
  };

  // Don't render until client-side to avoid hydration issues
  if (!isClient) {
    return (
      <Card className="mb-6 border-gray-200 bg-gray-50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-gray-800">
            <Wallet className="h-5 w-5" />
            Loading Wallet Status...
          </CardTitle>
        </CardHeader>
      </Card>
    );
  }

  const isSupportedChain = chainId && Object.keys(SUPPORTED_CHAIN_IDS).includes(chainId.toString());
  const chainName = chainId ? SUPPORTED_CHAIN_IDS[chainId as keyof typeof SUPPORTED_CHAIN_IDS] : 'Unknown';

  if (!isConnected) {
    return (
      <Card className="mb-6 border-orange-200 bg-orange-50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-orange-800">
            <Wallet className="h-5 w-5" />
            Wallet Connection Required
          </CardTitle>
          <CardDescription className="text-orange-700">
            Connect your wallet to access trading features and execute arbitrage opportunities
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-orange-600" />
              <span className="text-sm text-orange-700">
                Trading features are disabled without wallet connection
              </span>
            </div>
            <ConnectButton />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={`mb-6 ${isSupportedChain ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'}`}>
      <CardHeader>
        <CardTitle className={`flex items-center gap-2 ${isSupportedChain ? 'text-green-800' : 'text-red-800'}`}>
          <CheckCircle className="h-5 w-5" />
          Wallet Connected
        </CardTitle>
        <CardDescription className={isSupportedChain ? 'text-green-700' : 'text-red-700'}>
          {isSupportedChain 
            ? 'Ready to execute arbitrage trades' 
            : 'Please switch to a supported network for trading'
          }
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Address */}
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-muted-foreground mb-1">Address</p>
              <div className="flex items-center gap-2">
                <code className="text-sm font-mono">{formatAddress(address!)}</code>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={copyAddress}
                  className="h-6 w-6 p-0"
                >
                  <Copy className="h-3 w-3" />
                </Button>
                {copied && <span className="text-xs text-green-600">Copied!</span>}
              </div>
            </div>
          </div>

          {/* Network */}
          <div>
            <p className="text-xs font-medium text-muted-foreground mb-1">Network</p>
            <div className="flex items-center gap-2">
              <Badge variant={isSupportedChain ? "default" : "destructive"}>
                {chainName}
              </Badge>
              {!isSupportedChain && (
                <span className="text-xs text-red-600">Unsupported</span>
              )}
            </div>
          </div>

          {/* Balance */}
          <div>
            <p className="text-xs font-medium text-muted-foreground mb-1">Balance</p>
            <p className="text-sm font-medium">
              {balance ? `${parseFloat(balance.formatted).toFixed(4)} ${balance.symbol}` : '0.0000 ETH'}
            </p>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-between mt-4 pt-4 border-t">
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1">
              <div className="h-2 w-2 rounded-full bg-green-500" />
              <span className="text-xs text-muted-foreground">
                Connected via {connector?.name || 'Wallet'}
              </span>
            </div>
          </div>
          <ConnectButton />
        </div>
      </CardContent>
    </Card>
  );
}
