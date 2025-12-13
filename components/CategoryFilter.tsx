"use client";

const categories = ["Politics", "Civics", "Sports", "Culture"] as const;

type Props = {
  value: string | null;
  onChange: (category: string | null) => void;
  compact?: boolean;
};

export default function CategoryFilter({ value, onChange, compact = false }: Props) {
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
      {categories.map((category) => (
        <button
          key={category}
          onClick={() => onChange(category)}
          className={`border px-3 py-2 uppercase tracking-[0.35em] ${
            value === category ? "border-electric text-white" : "border-white/10 text-mist hover:text-white"
          }`}
        >
          {category}
        </button>
      ))}
    </div>
  );
}
