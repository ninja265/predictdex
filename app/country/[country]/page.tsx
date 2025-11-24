import { notFound } from "next/navigation";
import PredictionsBoard from "@/components/PredictionsBoard";
import { countries } from "@/data/predictions";

type Props = {
  params: {
    country: string;
  };
};

export function generateStaticParams() {
  return countries.map((country) => ({
    country: country.toLowerCase().replace(/\s+/g, "-"),
  }));
}

export default function CountryPage({ params }: Props) {
  const match = countries.find(
    (country) => country.toLowerCase().replace(/\s+/g, "-") === params.country.toLowerCase(),
  );

  if (!match) {
    notFound();
  }

  return (
    <div className="space-y-10">
      <header className="border border-white/5 bg-charcoal/60 px-8 py-10">
        <p className="text-xs uppercase tracking-[0.4em] text-gold">Country Focus</p>
        <h1 className="mt-4 text-4xl font-semibold text-white">{match}</h1>
        <p className="mt-3 text-sm text-mist">Drill into {match} narratives with curated liquidity.</p>
      </header>

      <PredictionsBoard
        title={`Markets in ${match}`}
        description="Filters auto-filled from the URL. Clear them to explore other narratives."
        showFilters
        initialCountry={match}
      />
    </div>
  );
}
