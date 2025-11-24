"use client";

import { countries } from "@/data/predictions";

type Props = {
  value: string | null;
  onChange: (country: string | null) => void;
  compact?: boolean;
};

export default function CountryFilter({ value, onChange, compact = false }: Props) {
  return (
    <div className={`flex flex-wrap gap-2 ${compact ? "text-xs" : "text-sm"}`}>
      <button
        onClick={() => onChange(null)}
        className={`border px-3 py-2 uppercase tracking-[0.35em] ${
          value === null ? "border-gold text-gold" : "border-white/10 text-mist hover:text-white"
        }`}
      >
        All
      </button>
      {countries.map((country) => (
        <button
          key={country}
          onClick={() => onChange(country)}
          className={`border px-3 py-2 uppercase tracking-[0.35em] ${
            value === country ? "border-royal text-white" : "border-white/10 text-mist hover:text-white"
          }`}
        >
          {country}
        </button>
      ))}
    </div>
  );
}
