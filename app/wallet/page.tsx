import WalletDashboard from "@/components/WalletDashboard";

export default function WalletPage() {
  return (
    <div className="space-y-10">
      <header className="border border-white/5 bg-charcoal/60 px-8 py-10">
        <p className="text-xs uppercase tracking-[0.4em] text-gold">Wallet</p>
        <h1 className="mt-4 text-4xl font-semibold text-white">Manage your on-chain balance</h1>
        <p className="mt-3 text-sm text-mist">
          Connect via MetaMask or WalletConnect, deposit stablecoins, and withdraw to any EVM wallet.
        </p>
      </header>

      <WalletDashboard />
    </div>
  );
}

