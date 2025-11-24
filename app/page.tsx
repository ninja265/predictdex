import Link from "next/link";
import PredictionsBoard from "@/components/PredictionsBoard";
import ConnectWalletButton from "@/components/ConnectWalletButton";

export default function HomePage() {
  return (
    <div className="space-y-16">
      <section className="grid gap-10 border border-white/5 bg-slate/40 px-8 py-12 lg:grid-cols-2">
        <div className="space-y-6">
          <p className="text-xs uppercase tracking-[0.4em] text-gold">AfricaPredicts</p>
          <h1 className="text-4xl font-semibold leading-snug text-white lg:text-5xl">
            AfricaPredicts — The Pan-African Prediction Exchange
          </h1>
          <p className="text-lg text-mist">
            Trade real-time predictions on politics, entertainment, and sports across the continent. Built
            with a futuristic, pan-African aesthetic for serious traders and bold storytellers.
          </p>
          <div className="flex flex-wrap gap-4">
            <Link
              href="/markets"
              className="border border-royal bg-royal px-6 py-3 text-sm uppercase tracking-[0.4em] text-white hover:bg-transparent"
            >
              Start Trading
            </Link>
            <ConnectWalletButton />
          </div>
        </div>

        <div className="space-y-6 border border-white/5 bg-charcoal/50 p-6">
          <p className="text-xs uppercase tracking-[0.35em] text-mist">Live Liquidity</p>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="border border-white/10 bg-white/5 px-4 py-3">
              <p className="text-xs uppercase tracking-[0.35em] text-mist">Total Locked</p>
              <p className="text-3xl font-semibold text-gold">$8.3M</p>
            </div>
            <div className="border border-white/10 bg-white/5 px-4 py-3">
              <p className="text-xs uppercase tracking-[0.35em] text-mist">Active Traders</p>
              <p className="text-3xl font-semibold text-electric">12,480</p>
            </div>
          </div>
          <div>
            <p className="text-xs uppercase tracking-[0.35em] text-mist">Why AfricaPredicts</p>
            <ul className="mt-3 space-y-2 text-sm text-mist">
              <li>• Lightning-fast settlement on Polygon + Arbitrum</li>
              <li>• Culturally aware markets curated by on-ground analysts</li>
              <li>• Transparent liquidity with DAO-managed vaults</li>
            </ul>
          </div>
        </div>
      </section>

      <PredictionsBoard
        title="Top 10 Predictions in Africa"
        description="Instantly trade trending narratives curated by our intelligence desk."
        limit={10}
      />
    </div>
  );
}

