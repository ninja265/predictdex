"use client";

import { categories } from "@/data/predictions";
import { usePredictionStore } from "@/lib/stores/usePredictionStore";

type Props = {
  compact?: boolean;
};

export default function CategoryFilter({ compact = false }: Props) {
  const { categoryFilter, setCategoryFilter } = usePredictionStore((state) => ({
    categoryFilter: state.categoryFilter,
    setCategoryFilter: state.setCategoryFilter,
  }));

  const handleSelect = (category: string | null) => {
    setCategoryFilter(category);
  };

  return (
    <div className={`flex flex-wrap gap-2 ${compact ? "text-xs" : "text-sm"}`}>
      <button
        onClick={() => handleSelect(null)}
        className={`border px-3 py-2 uppercase tracking-[0.35em] ${
          categoryFilter === null ? "border-gold text-gold" : "border-white/10 text-mist hover:text-white"
        }`}
      >
        All
      </button>
      {categories.map((category) => (
        <button
          key={category}
          onClick={() => handleSelect(category)}
          className={`border px-3 py-2 uppercase tracking-[0.35em] ${
            categoryFilter === category
              ? "border-electric text-white"
              : "border-white/10 text-mist hover:text-white"
          }`}
        >
          {category}
        </button>
      ))}
    </div>
  );
}

