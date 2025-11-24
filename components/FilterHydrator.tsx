"use client";

import { useEffect } from "react";
import { usePredictionStore } from "@/lib/stores/usePredictionStore";

type Props = {
  country?: string | null;
  category?: string | null;
};

export default function FilterHydrator({ country = null, category = null }: Props) {
  const { setCountryFilter, setCategoryFilter } = usePredictionStore((state) => ({
    setCountryFilter: state.setCountryFilter,
    setCategoryFilter: state.setCategoryFilter,
  }));

  useEffect(() => {
    setCountryFilter(country);
    return () => setCountryFilter(null);
  }, [country, setCountryFilter]);

  useEffect(() => {
    setCategoryFilter(category);
    return () => setCategoryFilter(null);
  }, [category, setCategoryFilter]);

  return null;
}
