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
  }, [country]);

  useEffect(() => {
    const { setCategoryFilter } = usePredictionStore.getState();
    setCategoryFilter(category);
  }, [category]);

  useEffect(() => {
    const { setCountryFilter, setCategoryFilter } = usePredictionStore.getState();
    return () => {
      setCountryFilter(null);
      setCategoryFilter(null);
    };
  }, []);

  return null;
}
