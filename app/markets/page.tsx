import MarketsBoard from "@/components/MarketsBoard";

export default function MarketsPage() {
  return (
    <div className="space-y-10">
      <header className="border border-white/5 bg-charcoal/60 px-8 py-10">
        <p className="text-xs uppercase tracking-[0.4em] text-gold">Markets</p>
        <h1 className="mt-4 text-4xl font-semibold text-white">Trade live narratives across Africa</h1>
        <p className="mt-3 text-sm text-mist">
          Filter by category to laser in on your thesis. Prices update in real-time.
        </p>
      </header>

      <MarketsBoard
        title="Live Markets"
        description="Transparent fees and oracle-backed resolution."
        showFilters
      />
    </div>
  );
}
