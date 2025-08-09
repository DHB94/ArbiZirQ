import { getDefaultConfig } from '@rainbow-me/rainbowkit';
import {
  arbitrum,
  base,
  mainnet,
  polygon,
  sepolia,
} from 'wagmi/chains';

// Define Zircuit chains
export const zircuitMainnet = {
  id: 48900,
  name: 'Zircuit',
  nativeCurrency: {
    decimals: 18,
    name: 'Ether',
    symbol: 'ETH',
  },
  rpcUrls: {
    default: {
      http: ['https://mainnet.zircuit.com'],
    },
  },
  blockExplorers: {
    default: { name: 'Zircuit Explorer', url: 'https://explorer.zircuit.com' },
  },
  testnet: false,
} as const;

export const zircuitTestnet = {
  id: 48899,
  name: 'Zircuit Testnet',
  nativeCurrency: {
    decimals: 18,
    name: 'Ether',
    symbol: 'ETH',
  },
  rpcUrls: {
    default: {
      http: ['https://zircuit1.p2pify.com/'],
    },
  },
  blockExplorers: {
    default: { name: 'Zircuit Testnet Explorer', url: 'https://explorer.testnet.zircuit.com' },
  },
  testnet: true,
} as const;

export const config = getDefaultConfig({
  appName: 'ArbiZirQ',
  projectId: process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID || '0123456789abcdef0123456789abcdef', // Fallback for development
  chains: [
    mainnet,
    polygon,
    arbitrum,
    base,
    zircuitMainnet,
    ...(process.env.NODE_ENV === 'development' ? [zircuitTestnet, sepolia] : []),
  ],
  ssr: true, // If your dApp uses server side rendering (SSR)
});
