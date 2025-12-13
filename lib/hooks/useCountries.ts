"use client";

import { useState, useEffect } from "react";
import apiClient from "@/lib/api/client";
import type { Country } from "@/lib/api/types";

const FALLBACK_COUNTRIES: Country[] = [
  { code: "DZ", name: "Algeria", slug: "algeria", region: "North Africa", flagEmoji: "🇩🇿" },
  { code: "AO", name: "Angola", slug: "angola", region: "Southern Africa", flagEmoji: "🇦🇴" },
  { code: "BW", name: "Botswana", slug: "botswana", region: "Southern Africa", flagEmoji: "🇧🇼" },
  { code: "CM", name: "Cameroon", slug: "cameroon", region: "Central Africa", flagEmoji: "🇨🇲" },
  { code: "CI", name: "Côte d'Ivoire", slug: "cote-divoire", region: "West Africa", flagEmoji: "🇨🇮" },
  { code: "EG", name: "Egypt", slug: "egypt", region: "North Africa", flagEmoji: "🇪🇬" },
  { code: "ET", name: "Ethiopia", slug: "ethiopia", region: "East Africa", flagEmoji: "🇪🇹" },
  { code: "GH", name: "Ghana", slug: "ghana", region: "West Africa", flagEmoji: "🇬🇭" },
  { code: "KE", name: "Kenya", slug: "kenya", region: "East Africa", flagEmoji: "🇰🇪" },
  { code: "MA", name: "Morocco", slug: "morocco", region: "North Africa", flagEmoji: "🇲🇦" },
  { code: "MZ", name: "Mozambique", slug: "mozambique", region: "Southern Africa", flagEmoji: "🇲🇿" },
  { code: "NA", name: "Namibia", slug: "namibia", region: "Southern Africa", flagEmoji: "🇳🇦" },
  { code: "NG", name: "Nigeria", slug: "nigeria", region: "West Africa", flagEmoji: "🇳🇬" },
  { code: "RW", name: "Rwanda", slug: "rwanda", region: "East Africa", flagEmoji: "🇷🇼" },
  { code: "SN", name: "Senegal", slug: "senegal", region: "West Africa", flagEmoji: "🇸🇳" },
  { code: "ZA", name: "South Africa", slug: "south-africa", region: "Southern Africa", flagEmoji: "🇿🇦" },
  { code: "TZ", name: "Tanzania", slug: "tanzania", region: "East Africa", flagEmoji: "🇹🇿" },
  { code: "TN", name: "Tunisia", slug: "tunisia", region: "North Africa", flagEmoji: "🇹🇳" },
  { code: "UG", name: "Uganda", slug: "uganda", region: "East Africa", flagEmoji: "🇺🇬" },
  { code: "ZM", name: "Zambia", slug: "zambia", region: "Southern Africa", flagEmoji: "🇿🇲" },
];

interface UseCountriesReturn {
  countries: Country[];
  isLoading: boolean;
  error: string | null;
}

export function useCountries(): UseCountriesReturn {
  const [countries, setCountries] = useState<Country[]>(FALLBACK_COUNTRIES);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCountries = async () => {
      try {
        const response = await apiClient.getCountries();
        if (response?.countries?.length > 0) {
          setCountries(response.countries);
        }
      } catch {
      }
    };

    fetchCountries();
  }, []);

  return { countries, isLoading, error };
}
