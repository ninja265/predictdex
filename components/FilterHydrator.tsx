"use client";

import { useEffect } from "react";
import { usePredictionStore } from "@/lib/stores/usePredictionStore";

type Props = {
  country?: string | null;
  category?: string | null;
};

export default function FilterHydrator({ country = null, category = null }: Props) {
  useEffect(() => {
    const { setCountryFilter } = usePredictionStore.getState();
    setCountryFilter(country);
    return () => setCountryFilter(null);
  }, [country]);

  useEffect(() => {
    const { setCategoryFilter } = usePredictionStore.getState();
    setCategoryFilter(category);
    return () => setCategoryFilter(null);
  }, [category]);

  return null;
}
