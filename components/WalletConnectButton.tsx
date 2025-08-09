'use client';

import { ConnectButton } from '@rainbow-me/rainbowkit';
import { useAccount } from 'wagmi';
import { Button } from '@/components/ui/button';
import { ArrowRight, Wallet } from 'lucide-react';
import Link from 'next/link';
import { useEffect, useState } from 'react';

interface WalletConnectButtonProps {
  variant?: 'default' | 'outline' | 'destructive' | 'secondary' | 'ghost' | 'link';
  size?: 'default' | 'sm' | 'lg' | 'icon';
  className?: string;
  children?: React.ReactNode;
}

export function WalletConnectButton({ 
  variant = 'default', 
  size = 'default',
  className = '',
  children 
}: WalletConnectButtonProps) {
  const [mounted, setMounted] = useState(false);

  // Ensure component is mounted before rendering
  useEffect(() => {
    setMounted(true);
  }, []);

  // Don't render anything until mounted (prevents hydration issues)
  if (!mounted) {
    return (
      <Button variant={variant} size={size} className={className} disabled>
        <Wallet className="mr-2 h-4 w-4" />
        Loading...
      </Button>
    );
  }

  // Always redirect to dashboard when clicked
  return (
    <Link href="/dashboard">
      <Button variant={variant} size={size} className={className}>
        <Wallet className="mr-2 h-4 w-4" />
        {children || 'Go to Dashboard'}
        <ArrowRight className="ml-2 h-4 w-4" />
      </Button>
    </Link>
  );
}
