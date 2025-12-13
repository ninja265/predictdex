"use client";

import { useMarket } from "@/lib/hooks/useMarkets";
import MarketDetail from "@/components/MarketDetail";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import Link from "next/link";

type Props = {
  params: {
    slug: string;
  };
};

function MarketDetailContent({ slug }: { slug: string }) {
  const { market, isLoading, error } = useMarket(slug);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="border border-white/10 bg-charcoal/70 p-6 animate-pulse">
          <div className="h-4 w-32 bg-white/10 rounded"></div>
          <div className="mt-6 h-8 w-3/4 bg-white/10 rounded"></div>
          <div className="mt-4 h-4 w-1/2 bg-white/10 rounded"></div>
          <div className="mt-6 grid gap-4 sm:grid-cols-3">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-24 bg-white/10 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error || !market) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <p className="text-2xl font-semibold text-white">Market not found</p>
        <p className="mt-2 text-mist">{error || "This market may have been removed or doesn't exist."}</p>
        <Link
          href="/markets"
          className="mt-6 border border-royal/50 bg-royal/10 px-6 py-3 text-sm uppercase tracking-widest text-gold hover:bg-royal/20 transition-colors"
        >
          Browse Markets
        </Link>
      </div>
    );
  }

  return <MarketDetail market={market} />;
}

export default function MarketDetailPage({ params }: Props) {
  return (
    <ErrorBoundary>
      <MarketDetailContent slug={params.slug} />
    </ErrorBoundary>
  );
}
