'use client';

import { getDefaultWallets, RainbowKitProvider } from '@rainbow-me/rainbowkit';
import {
  createConfig,
  http,
  WagmiConfig,
} from 'wagmi';
import { mainnet, polygon, optimism, arbitrum } from 'wagmi/chains';

const chains = [mainnet, polygon, optimism, arbitrum];

const { connectors } = getDefaultWallets({
  appName: 'ElementPay',
  projectId: '8adb524ee84c7fd6c303a5d776aa2624',
  chains,
});

export const wagmiConfig = createConfig({
  chains,
  connectors,
  transports: {
    [mainnet.id]: http(),
    [polygon.id]: http(),
    [optimism.id]: http(),
    [arbitrum.id]: http(),
  },
  ssr: true,
  autoConnect: true,
});

export { chains, RainbowKitProvider, WagmiConfig };
