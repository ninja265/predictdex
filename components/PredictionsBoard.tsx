"use client";

import { useEffect, useMemo, useState } from "react";
import PredictionCard from "./PredictionCard";
import CountryFilter from "./CountryFilter";
import CategoryFilter from "./CategoryFilter";
import { predictions } from "@/data/predictions";

type Props = {
  title: string;
  limit?: number;
  description?: string;
  showFilters?: boolean;
  initialCountry?: string | null;
  initialCategory?: string | null;
};

export default function PredictionsBoard({
  title,
  limit,
  description,
  showFilters = true,
  initialCountry = null,
  initialCategory = null,
}: Props) {
  const [countryFilter, setCountryFilter] = useState<string | null>(initialCountry);
  const [categoryFilter, setCategoryFilter] = useState<string | null>(initialCategory);

  useEffect(() => {
    setCountryFilter(initialCountry ?? null);
  }, [initialCountry]);

  useEffect(() => {
    setCategoryFilter(initialCategory ?? null);
  }, [initialCategory]);

  const filtered = useMemo(() => {
    return predictions.filter((prediction) => {
      const matchesCountry = countryFilter
        ? prediction.country.toLowerCase() === countryFilter.toLowerCase()
        : true;
      const matchesCategory = categoryFilter
        ? prediction.category.toLowerCase() === categoryFilter.toLowerCase()
        : true;
      return matchesCountry && matchesCategory;
    });
  }, [countryFilter, categoryFilter]);

  const displayed = limit ? filtered.slice(0, limit) : filtered;

  return (
    <section className="space-y-6">
      <div>
        <p className="text-xs uppercase tracking-[0.4em] text-mist">{title}</p>
        {description && <p className="mt-2 text-sm text-mist">{description}</p>}
      </div>

      {showFilters && (
        <div className="space-y-4">
          <CountryFilter value={countryFilter} onChange={setCountryFilter} />
          <CategoryFilter value={categoryFilter} onChange={setCategoryFilter} />
        </div>
      )}

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {displayed.map((prediction) => (
          <PredictionCard key={prediction.id} prediction={prediction} />
        ))}
      </div>

      {displayed.length === 0 && (
        <p className="text-sm text-mist">No predictions match your filters yet.</p>
      )}
    </section>
  );
}
