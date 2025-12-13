"use client";

import { useState } from "react";
import MarketCard from "./MarketCard";
import CategoryFilter from "./CategoryFilter";
import { useMarkets } from "@/lib/hooks/useMarkets";
import type { MarketCategory } from "@/lib/api/types";

type Props = {
  title?: string;
  limit?: number;
  offset?: number;
  description?: string;
  showFilters?: boolean;
  initialCategory?: MarketCategory | null;
  initialCountry?: string | null;
};

export default function MarketsBoard({
  title = "Markets",
  limit = 20,
  offset = 0,
  description,
  showFilters = true,
  initialCategory = null,
  initialCountry = null,
}: Props) {
  const [categoryFilter, setCategoryFilter] = useState<MarketCategory | null>(initialCategory);

  const { markets, isLoading, error } = useMarkets({
    category: categoryFilter,
    country: initialCountry,
    limit,
    offset,
  });

  const handleCategoryChange = (category: string | null) => {
    setCategoryFilter(category as MarketCategory | null);
  };

  return (
    <section className="space-y-6">
      <div>
        <p className="text-xs uppercase tracking-[0.4em] text-mist">{title}</p>
        {description && <p className="mt-2 text-sm text-mist">{description}</p>}
      </div>

      {showFilters && (
        <div className="space-y-4">
          <CategoryFilter value={categoryFilter} onChange={handleCategoryChange} />
        </div>
      )}

      {isLoading ? (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {[...Array(6)].map((_, i) => (
            <div
              key={i}
              className="h-48 animate-pulse border border-white/5 bg-charcoal/40"
            />
          ))}
        </div>
      ) : error ? (
        <div className="border border-red-500/20 bg-red-900/10 p-6 text-center">
          <p className="text-sm text-red-400">{error}</p>
          <p className="mt-2 text-xs text-mist">Unable to load markets from the server</p>
        </div>
      ) : markets.length === 0 ? (
        <p className="text-sm text-mist">No markets available for this filter.</p>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {markets.map((market) => (
            <MarketCard key={market.id} market={market} />
          ))}
        </div>
      )}
    </section>
  );
}
