"use client";

import { ConnectButton } from "@rainbow-me/rainbowkit";

export default function ConnectWalletButton() {
  return (
    <ConnectButton.Custom>
      {({ account, chain, openAccountModal, openChainModal, openConnectModal, mounted }) => {
        const ready = mounted;
        const connected = ready && account && chain;

        return (
          <div className="flex items-center gap-2">
            <button
              onClick={connected ? openAccountModal : openConnectModal}
              className="uppercase tracking-widest text-[11px] font-semibold px-4 py-2 border border-white/20 bg-white/5 hover:bg-royal/20 transition-colors"
            >
              {connected ? account.displayName : "Connect Wallet"}
            </button>
            {connected && chain && (
              <button
                onClick={openChainModal}
                className="text-[11px] tracking-wide px-3 py-2 border border-white/10 bg-white/5 hover:bg-electric/30 transition-colors"
              >
                {chain.name}
              </button>
            )}
          </div>
        );
      }}
    </ConnectButton.Custom>
  );
}

