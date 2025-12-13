"use client";

import "@rainbow-me/rainbowkit/styles.css";
import { RainbowKitProvider, getDefaultWallets } from "@rainbow-me/rainbowkit";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactNode, useMemo } from "react";
import { WagmiConfig, configureChains, createConfig } from "wagmi";
import { arbitrum, bsc, mainnet, polygon } from "wagmi/chains";
import { publicProvider } from "wagmi/providers/public";

type Props = {
  children: ReactNode;
};

const projectId = process.env.NEXT_PUBLIC_WALLETCONNECT_ID || "";

if (!projectId) {
  console.warn("WalletConnect: NEXT_PUBLIC_WALLETCONNECT_ID not set. Wallet connections may fail.");
}

const { chains, publicClient } = configureChains(
  [mainnet, polygon, arbitrum, bsc],
  [publicProvider()],
);

const { connectors } = getDefaultWallets({
  appName: "AfricaPredicts",
  projectId,
  chains,
});

const wagmiConfig = createConfig({
  autoConnect: true,
  connectors,
  publicClient,
});

export function Providers({ children }: Props) {
  const queryClient = useMemo(() => new QueryClient(), []);

  return (
    <WagmiConfig config={wagmiConfig}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider chains={chains}>{children}</RainbowKitProvider>
      </QueryClientProvider>
    </WagmiConfig>
  );
}

