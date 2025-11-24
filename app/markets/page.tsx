import PredictionsBoard from "@/components/PredictionsBoard";

export default function MarketsPage() {
  return (
    <div className="space-y-10">
      <header className="border border-white/5 bg-charcoal/60 px-8 py-10">
        <p className="text-xs uppercase tracking-[0.4em] text-gold">Markets</p>
        <h1 className="mt-4 text-4xl font-semibold text-white">Trade live narratives across Africa</h1>
        <p className="mt-3 text-sm text-mist">
          Filter by country or category to laser in on your thesis. Prices update the second liquidity moves.
        </p>
      </header>

      <PredictionsBoard
        title="Live Markets"
        description="Zero spread, transparent fees, and oracle-backed resolution."
        showFilters
      />
    </div>
  );
}

