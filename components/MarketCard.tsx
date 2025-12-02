import Link from "next/link";
import type { Market } from "@/lib/api/types";

type Props = {
  market: Market;
  compact?: boolean;
};

export default function MarketCard({ market, compact = false }: Props) {
  const formatVolume = (volume: number, symbol: string): string => {
    if (volume >= 1000000) {
      return `${symbol}${(volume / 1000000).toFixed(1)}M`;
    }
    if (volume >= 1000) {
      return `${symbol}${(volume / 1000).toFixed(1)}K`;
    }
    return `${symbol}${volume.toFixed(0)}`;
  };

  const getStatusColor = (status: string): string => {
    switch (status) {
      case "open":
        return "text-green-400";
      case "closed":
        return "text-yellow-400";
      case "resolved":
        return "text-blue-400";
      default:
        return "text-mist";
    }
  };

  return (
    <Link
      href={`/markets/${market.slug}`}
      className="card-hover flex flex-col border border-white/5 bg-gradient-to-b from-charcoal/80 to-slate/60 px-6 py-5 transition"
    >
      <div className="mb-4 flex items-center justify-between text-xs uppercase tracking-[0.3em] text-mist">
        <span className={getStatusColor(market.status)}>{market.status}</span>
        <span className="text-electric">{market.category}</span>
      </div>
      <h3 className="text-xl font-semibold text-white line-clamp-2">{market.question}</h3>
      <div className="mt-6 grid grid-cols-2 gap-3 text-sm">
        <div className="border border-white/10 bg-white/5 px-4 py-3">
          <p className="text-xs uppercase tracking-[0.35em] text-mist">YES</p>
          <p className="text-2xl font-semibold text-gold">
            {(market.yesPrice * 100).toFixed(0)}%
          </p>
        </div>
        <div className="border border-white/10 bg-white/5 px-4 py-3">
          <p className="text-xs uppercase tracking-[0.35em] text-mist">NO</p>
          <p className="text-2xl font-semibold text-electric">
            {(market.noPrice * 100).toFixed(0)}%
          </p>
        </div>
      </div>
      {!compact && (
        <div className="mt-6 flex items-center justify-between text-xs uppercase tracking-[0.35em] text-mist">
          <span>Volume {formatVolume(market.volume, market.symbol)}</span>
          <span>
            Closes {new Date(market.closesAt).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
          </span>
        </div>
      )}
    </Link>
  );
}
