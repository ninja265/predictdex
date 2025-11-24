import { notFound } from "next/navigation";
import PredictionDetail from "@/components/PredictionDetail";
import { predictions } from "@/data/predictions";

type Props = {
  params: {
    slug: string;
  };
};

export function generateStaticParams() {
  return predictions.map((prediction) => ({ slug: prediction.slug }));
}

export function generateMetadata({ params }: Props) {
  const prediction = predictions.find((market) => market.slug === params.slug);
  return {
    title: prediction
      ? `${prediction.title} — AfricaPredicts`
      : "AfricaPredicts Market",
  };
}

export default function MarketDetailPage({ params }: Props) {
  const prediction = predictions.find((market) => market.slug === params.slug);

  if (!prediction) {
    notFound();
  }

  return <PredictionDetail prediction={prediction} />;
}

