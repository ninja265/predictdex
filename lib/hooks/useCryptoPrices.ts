"use client";

import { useState, useEffect, useCallback } from "react";

export interface CryptoPrices {
  ETH: number;
  USDC: number;
  USDT: number;
}

interface UseCryptoPricesReturn {
  prices: CryptoPrices | null;
  isLoading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
  convertToUsd: (amount: number, currency: string) => number;
  convertFromUsd: (usdAmount: number, currency: string) => number;
  getPrice: (currency: string) => number | null;
}

const COINGECKO_API = "https://api.coingecko.com/api/v3/simple/price";

export function useCryptoPrices(): UseCryptoPricesReturn {
  const [prices, setPrices] = useState<CryptoPrices | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPrices = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch(
        `${COINGECKO_API}?ids=ethereum,usd-coin,tether&vs_currencies=usd`
      );
      
      if (!response.ok) {
        throw new Error("Failed to fetch prices");
      }
      
      const data = await response.json();
      
      setPrices({
        ETH: data.ethereum?.usd || 0,
        USDC: data["usd-coin"]?.usd || 1,
        USDT: data.tether?.usd || 1,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch prices");
      setPrices({
        ETH: 3500,
        USDC: 1,
        USDT: 1,
      });
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPrices();
    const interval = setInterval(fetchPrices, 60000);
    return () => clearInterval(interval);
  }, [fetchPrices]);

  const convertToUsd = useCallback(
    (amount: number, currency: string): number => {
      if (!prices) return 0;
      const normalizedCurrency = currency.toUpperCase() as keyof CryptoPrices;
      const price = prices[normalizedCurrency];
      if (price === undefined || price === 0) return 0;
      return amount * price;
    },
    [prices]
  );

  const convertFromUsd = useCallback(
    (usdAmount: number, currency: string): number => {
      if (!prices) return 0;
      const normalizedCurrency = currency.toUpperCase() as keyof CryptoPrices;
      const price = prices[normalizedCurrency];
      if (price === undefined || price === 0) return 0;
      return usdAmount / price;
    },
    [prices]
  );

  const getPrice = useCallback(
    (currency: string): number | null => {
      if (!prices) return null;
      const normalizedCurrency = currency.toUpperCase() as keyof CryptoPrices;
      const price = prices[normalizedCurrency];
      return price !== undefined ? price : null;
    },
    [prices]
  );

  return { prices, isLoading, error, refetch: fetchPrices, convertToUsd, convertFromUsd, getPrice };
}
