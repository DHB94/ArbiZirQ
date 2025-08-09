'use client';

import { ConnectButton } from '@rainbow-me/rainbowkit';
import { ArrowRight, Wallet } from 'lucide-react';

interface SimpleWalletButtonProps {
  className?: string;
  children?: React.ReactNode;
}

export function SimpleWalletButton({ className = '', children }: SimpleWalletButtonProps) {
  return (
    <div className={className}>
      <ConnectButton 
        label={typeof children === 'string' ? children : 'Connect Wallet'}
        showBalance={false}
        chainStatus="icon"
        accountStatus="avatar"
      />
    </div>
  );
}
