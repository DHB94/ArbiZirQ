import { http, createConfig } from 'wagmi';
import { injected, walletConnect, metaMask } from 'wagmi/connectors';
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

const chains = [
  mainnet,
  polygon,
  arbitrum,
  base,
  zircuitMainnet,
  ...(process.env.NODE_ENV === 'development' ? [zircuitTestnet, sepolia] : []),
] as const;

export const config = createConfig({
  chains,
  connectors: [
    injected(),
    walletConnect({
      projectId: process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID || 'd6b3203f9238276df2440599c3497e69',
    }),
    metaMask(),
  ],
  transports: {
    [mainnet.id]: http(),
    [polygon.id]: http(),
    [arbitrum.id]: http(),
    [base.id]: http(),
    [zircuitMainnet.id]: http('https://mainnet.zircuit.com'),
    [zircuitTestnet.id]: http('https://zircuit1.p2pify.com/'),
    [sepolia.id]: http(),
  },
  ssr: true,
});
