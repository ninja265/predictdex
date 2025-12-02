"use client";

import { useState, useEffect, useCallback } from "react";
import apiClient from "@/lib/api/client";
import type { Market, MarketCategory, OrderBookResponse, TradesResponse } from "@/lib/api/types";

interface UseMarketsParams {
  category?: MarketCategory | null;
  limit?: number;
}

interface UseMarketsReturn {
  markets: Market[];
  total: number;
  isLoading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export function useMarkets({ category, limit = 20 }: UseMarketsParams = {}): UseMarketsReturn {
  const [markets, setMarkets] = useState<Market[]>([]);
  const [total, setTotal] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchMarkets = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await apiClient.getMarkets({
        category: category || undefined,
        status: "open",
        limit,
      });
      setMarkets(response.markets);
      setTotal(response.total);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load markets");
      setMarkets([]);
    } finally {
      setIsLoading(false);
    }
  }, [category, limit]);

  useEffect(() => {
    fetchMarkets();
  }, [fetchMarkets]);

  return { markets, total, isLoading, error, refetch: fetchMarkets };
}

interface UseMarketReturn {
  market: Market | null;
  isLoading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export function useMarket(slug: string): UseMarketReturn {
  const [market, setMarket] = useState<Market | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchMarket = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await apiClient.getMarket(slug);
      setMarket(response);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load market");
      setMarket(null);
    } finally {
      setIsLoading(false);
    }
  }, [slug]);

  useEffect(() => {
    if (slug) {
      fetchMarket();
    }
  }, [slug, fetchMarket]);

  return { market, isLoading, error, refetch: fetchMarket };
}

interface UseOrderBookReturn {
  orderbook: OrderBookResponse | null;
  isLoading: boolean;
  error: string | null;
}

export function useOrderBook(slug: string): UseOrderBookReturn {
  const [orderbook, setOrderbook] = useState<OrderBookResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!slug) return;

    const fetchOrderBook = async () => {
      setIsLoading(true);
      try {
        const response = await apiClient.getOrderBook(slug);
        setOrderbook(response);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load orderbook");
      } finally {
        setIsLoading(false);
      }
    };

    fetchOrderBook();
    const interval = setInterval(fetchOrderBook, 10000);
    return () => clearInterval(interval);
  }, [slug]);

  return { orderbook, isLoading, error };
}

interface UseMarketTradesReturn {
  trades: TradesResponse | null;
  isLoading: boolean;
  error: string | null;
}

export function useMarketTrades(slug: string, limit = 50): UseMarketTradesReturn {
  const [trades, setTrades] = useState<TradesResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!slug) return;

    const fetchTrades = async () => {
      setIsLoading(true);
      try {
        const response = await apiClient.getMarketTrades(slug, limit);
        setTrades(response);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load trades");
      } finally {
        setIsLoading(false);
      }
    };

    fetchTrades();
  }, [slug, limit]);

  return { trades, isLoading, error };
}
