import { notFound } from "next/navigation";
import PredictionsBoard from "@/components/PredictionsBoard";
import FilterHydrator from "@/components/FilterHydrator";
import { categories } from "@/data/predictions";

type Props = {
  params: {
    category: string;
  };
};

export function generateStaticParams() {
  return categories.map((category) => ({
    category: category.toLowerCase(),
  }));
}

export default function CategoryPage({ params }: Props) {
  const match = categories.find((category) => category.toLowerCase() === params.category.toLowerCase());

  if (!match) {
    notFound();
  }

  return (
    <div className="space-y-10">
      <FilterHydrator category={match} />
      <header className="border border-white/5 bg-charcoal/60 px-8 py-10">
        <p className="text-xs uppercase tracking-[0.4em] text-gold">Category</p>
        <h1 className="mt-4 text-4xl font-semibold text-white">{match}</h1>
        <p className="mt-3 text-sm text-mist">
          From rate cuts to celebrity drops, {match} markets capture pan-African sentiment.
        </p>
      </header>

      <PredictionsBoard
        title={`${match} Markets`}
        description="URL-powered filters ensure this board spotlights the narratives you care about."
        showFilters
      />
    </div>
  );
}

