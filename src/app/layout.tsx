'use client';

import './globals.css';
import '@rainbow-me/rainbowkit/styles.css';

import {
  WagmiConfig,
  RainbowKitProvider,
  wagmiConfig,
  chains,
} from '@/lib/wallet';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useState } from 'react';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  // Ensure QueryClient is only created once on the client
  const [queryClient] = useState(() => new QueryClient());

  return (
    <html lang="en">
      <body>
        <QueryClientProvider client={queryClient}>
          <WagmiConfig config={wagmiConfig}>
            <RainbowKitProvider chains={chains}>
              {children}
            </RainbowKitProvider>
          </WagmiConfig>
        </QueryClientProvider>
      </body>
    </html>
  );
}
