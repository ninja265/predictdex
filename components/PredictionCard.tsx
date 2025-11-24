import Link from "next/link";
import type { Prediction } from "@/data/predictions";

type Props = {
  prediction: Prediction;
  compact?: boolean;
};

const numberFormatter = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 0,
});

export default function PredictionCard({ prediction, compact = false }: Props) {
  return (
    <Link
      href={`/markets/${prediction.slug}`}
      className="card-hover flex flex-col border border-white/5 bg-gradient-to-b from-charcoal/80 to-slate/60 px-6 py-5 transition"
    >
      <div className="mb-4 flex items-center justify-between text-xs uppercase tracking-[0.3em] text-mist">
        <span>{prediction.country}</span>
        <span className="text-electric">{prediction.category}</span>
      </div>
      <h3 className="text-xl font-semibold text-white">{prediction.title}</h3>
      <div className="mt-6 grid grid-cols-2 gap-3 text-sm">
        <div className="border border-white/10 bg-white/5 px-4 py-3">
          <p className="text-xs uppercase tracking-[0.35em] text-mist">YES</p>
          <p className="text-2xl font-semibold text-gold">{(prediction.yesPrice * 100).toFixed(0)}%</p>
        </div>
        <div className="border border-white/10 bg-white/5 px-4 py-3">
          <p className="text-xs uppercase tracking-[0.35em] text-mist">NO</p>
          <p className="text-2xl font-semibold text-electric">{(prediction.noPrice * 100).toFixed(0)}%</p>
        </div>
      </div>
      {!compact && (
        <div className="mt-6 flex items-center justify-between text-xs uppercase tracking-[0.35em] text-mist">
          <span>Liquidity {prediction.liquidity}</span>
          <span>Volume {numberFormatter.format(prediction.volume)}</span>
        </div>
      )}
    </Link>
  );
}

