import Link from "next/link";
import MarketsBoard from "@/components/MarketsBoard";

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
            Trade real-time predictions on politics, civics, sports, and culture across the continent. Built
            with a futuristic, pan-African aesthetic for serious traders and bold storytellers.
          </p>
          <div className="flex flex-wrap gap-4">
            <Link
              href="/markets"
              className="border border-royal bg-royal px-6 py-3 text-sm uppercase tracking-[0.4em] text-white hover:bg-transparent"
            >
              Start Trading
            </Link>
            <Link
              href="/login"
              className="border border-royal/50 bg-royal/10 px-6 py-3 text-sm uppercase tracking-[0.4em] text-gold hover:bg-royal/20"
            >
              Sign In
            </Link>
          </div>
        </div>

        <div className="space-y-6 border border-white/5 bg-charcoal/50 p-6">
          <p className="text-xs uppercase tracking-[0.35em] text-mist">Platform Stats</p>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="border border-white/10 bg-white/5 px-4 py-3">
              <p className="text-xs uppercase tracking-[0.35em] text-mist">Markets</p>
              <p className="text-3xl font-semibold text-gold">Live</p>
            </div>
            <div className="border border-white/10 bg-white/5 px-4 py-3">
              <p className="text-xs uppercase tracking-[0.35em] text-mist">Currencies</p>
              <p className="text-3xl font-semibold text-electric">ETH • USDC</p>
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

      <MarketsBoard
        title="Top Predictions in Africa"
        description="Trade trending narratives curated by our intelligence desk."
        limit={10}
        showFilters={false}
      />
    </div>
  );
}
