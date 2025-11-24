import ConnectWalletButton from "@/components/ConnectWalletButton";

export default function AccountPage() {
  return (
    <div className="space-y-10">
      <header className="flex flex-col gap-4 border border-white/5 bg-charcoal/60 px-8 py-10 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.4em] text-gold">Account</p>
          <h1 className="mt-4 text-4xl font-semibold text-white">Profile & Preferences</h1>
          <p className="mt-3 text-sm text-mist">
            Wallet connection = identity. Tune notifications, regional focus, and risk guardrails.
          </p>
        </div>
        <ConnectWalletButton />
      </header>

      <div className="grid gap-8 lg:grid-cols-2">
        <section className="border border-white/5 bg-slate/50 p-6">
          <p className="text-xs uppercase tracking-[0.35em] text-mist">Profile</p>
          <div className="mt-4 space-y-4 text-sm text-mist">
            <div>
              <p className="text-xs uppercase tracking-[0.35em] text-white">Display Name</p>
              <p>Pan-African Strategist</p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-[0.35em] text-white">Preferred Markets</p>
              <p>Politics, Business, Crypto</p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-[0.35em] text-white">Risk Mode</p>
              <p>Capital guardrails set at $10k / week</p>
            </div>
          </div>
        </section>

        <section className="border border-white/5 bg-slate/50 p-6">
          <p className="text-xs uppercase tracking-[0.35em] text-mist">Notifications</p>
          <ul className="mt-4 space-y-3 text-sm text-mist">
            <li>• Telegram pings for volatility spikes</li>
            <li>• Email digest every Monday 6am WAT</li>
            <li>• SMS alerts for settlements above $5k</li>
          </ul>
        </section>
      </div>
    </div>
  );
}

