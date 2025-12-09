"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import apiClient from "@/lib/api/client";
import { normalizeListResponse } from "@/lib/api/responseHelpers";
import type { Market, MarketCategory, OrderBookResponse, TradesResponse } from "@/lib/api/types";

// Simple in-memory cache with 30-second TTL
const marketsCache = new Map<string, { data: Market[]; total: number; timestamp: number }>();
const CACHE_TTL = 30 * 1000; // 30 seconds

interface UseMarketsParams {
  category?: MarketCategory | null;
  country?: string | null;
  limit?: number;
  offset?: number;
}

interface UseMarketsReturn {
  markets: Market[];
  total: number;
  isLoading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export function useMarkets({ category, country, limit = 20, offset = 0 }: UseMarketsParams = {}): UseMarketsReturn {
  const cacheKey = `${category || ''}-${country || ''}-${limit}-${offset}`;
  const cached = marketsCache.get(cacheKey);
  const isFresh = cached && (Date.now() - cached.timestamp) < CACHE_TTL;
  
  const [markets, setMarkets] = useState<Market[]>(isFresh ? cached.data : []);
  const [total, setTotal] = useState(isFresh ? cached.total : 0);
  const [isLoading, setIsLoading] = useState(!isFresh);
  const [error, setError] = useState<string | null>(null);
  const hasFetched = useRef(false);

  const fetchMarkets = useCallback(async (force = false) => {
    const currentCache = marketsCache.get(cacheKey);
    const stillFresh = currentCache && (Date.now() - currentCache.timestamp) < CACHE_TTL;
    
    // Skip fetch if cache is fresh and not forced
    if (stillFresh && !force && hasFetched.current) {
      return;
    }
    
    setIsLoading(true);
    setError(null);
    try {
      const response = await apiClient.getMarkets({
        category: category || undefined,
        country: country || undefined,
        status: "open",
        limit,
        offset,
      });
      const { data, total: totalCount } = normalizeListResponse<Market>(response, 'markets');
      // Sort by createdAt descending (newest first)
      const sorted = [...data].sort((a, b) => {
        const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
        const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
        return dateB - dateA;
      });
      
      // Update cache
      marketsCache.set(cacheKey, { data: sorted, total: totalCount, timestamp: Date.now() });
      hasFetched.current = true;
      
      setMarkets(sorted);
      setTotal(totalCount);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load markets");
      setMarkets([]);
    } finally {
      setIsLoading(false);
    }
  }, [category, country, limit, offset, cacheKey]);

  useEffect(() => {
    fetchMarkets();
  }, [fetchMarkets]);

  return { markets, total, isLoading, error, refetch: () => fetchMarkets(true) };
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
