"use client";

import { countries } from "@/data/predictions";
import { usePredictionStore } from "@/lib/stores/usePredictionStore";

type Props = {
  compact?: boolean;
};

export default function CountryFilter({ compact = false }: Props) {
  const { countryFilter, setCountryFilter } = usePredictionStore((state) => ({
    countryFilter: state.countryFilter,
    setCountryFilter: state.setCountryFilter,
  }));

  const handleSelect = (country: string | null) => {
    setCountryFilter(country);
  };

  return (
    <div className={`flex flex-wrap gap-2 ${compact ? "text-xs" : "text-sm"}`}>
      <button
        onClick={() => handleSelect(null)}
        className={`border px-3 py-2 uppercase tracking-[0.35em] ${
          countryFilter === null ? "border-gold text-gold" : "border-white/10 text-mist hover:text-white"
        }`}
      >
        All
      </button>
      {countries.map((country) => (
        <button
          key={country}
          onClick={() => handleSelect(country)}
          className={`border px-3 py-2 uppercase tracking-[0.35em] ${
            countryFilter === country ? "border-royal text-white" : "border-white/10 text-mist hover:text-white"
          }`}
        >
          {country}
        </button>
      ))}
    </div>
  );
}

