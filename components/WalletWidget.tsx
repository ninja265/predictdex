"use client";

import { useAccount } from "wagmi";
import { useWalletStore } from "@/lib/stores/useWalletStore";

export default function WalletWidget() {
  const { address, isConnected } = useAccount();
  const { stableBalances, selectedChain } = useWalletStore();

  return (
    <div className="border border-white/10 bg-slate/40 p-6">
      <p className="text-xs uppercase tracking-[0.4em] text-mist">Wallet</p>
      <h3 className="mt-2 text-2xl font-semibold text-white">
        {isConnected ? address : "No wallet connected"}
      </h3>
      <div className="mt-6 grid grid-cols-2 gap-4 text-sm">
        {Object.entries(stableBalances).map(([asset, value]) => (
          <div key={asset} className="border border-white/10 bg-white/5 px-4 py-3">
            <p className="text-xs uppercase tracking-[0.35em] text-mist">{asset}</p>
            <p className="text-2xl font-semibold text-gold">${value.toLocaleString()}</p>
          </div>
        ))}
      </div>
      <p className="mt-4 text-xs uppercase tracking-[0.3em] text-mist">
        Active Chain: <span className="text-white">{selectedChain}</span>
      </p>
    </div>
  );
}

