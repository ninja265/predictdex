"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import apiClient from "@/lib/api/client";
import { useAuthStore } from "@/lib/stores/useAuthStore";
import type { TradePreview, TradeResult } from "@/lib/api/types";
import { generateIdempotencyKey } from "@/lib/utils";
import { toast } from "@/components/Toast";

interface UseTradingReturn {
  preview: TradePreview | null;
  isLoadingPreview: boolean;
  isExecuting: boolean;
  error: string | null;
  fetchPreview: (marketId: string, outcome: "YES" | "NO", stake: number) => Promise<void>;
  executeBuy: (marketId: string, outcome: "YES" | "NO", stake: number) => Promise<TradeResult | null>;
  executeSell: (positionId: string, shares: number) => Promise<TradeResult | null>;
  clearPreview: () => void;
}

export function useTrading(): UseTradingReturn {
  const router = useRouter();
  const { logout } = useAuthStore();
  const [preview, setPreview] = useState<TradePreview | null>(null);
  const [isLoadingPreview, setIsLoadingPreview] = useState(false);
  const [isExecuting, setIsExecuting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleAuthError = useCallback(async (err: unknown) => {
    if (err instanceof Error && err.message.includes("401")) {
      await logout();
      toast("Session expired. Please sign in again.", "error");
      router.push("/login");
      return true;
    }
    return false;
  }, [logout, router]);

  const fetchPreview = useCallback(async (marketId: string, outcome: "YES" | "NO", stake: number) => {
    if (stake <= 0) {
      setPreview(null);
      return;
    }

    setIsLoadingPreview(true);
    setError(null);
    try {
      const response = await apiClient.previewTrade(marketId, outcome, stake);
      setPreview(response);
    } catch (err) {
      const isAuthError = await handleAuthError(err);
      if (!isAuthError) {
        const message = err instanceof Error ? err.message : "Failed to calculate trade";
        setError(message);
      }
      setPreview(null);
    } finally {
      setIsLoadingPreview(false);
    }
  }, [handleAuthError]);

  const executeBuy = useCallback(async (
    marketId: string,
    outcome: "YES" | "NO",
    stake: number
  ): Promise<TradeResult | null> => {
    setIsExecuting(true);
    setError(null);
    try {
      const idempotencyKey = generateIdempotencyKey();
      const result = await apiClient.buyShares(marketId, outcome, stake, idempotencyKey);
      toast(`Successfully bought ${result.trade.shares.toFixed(2)} ${outcome} shares`, "success");
      return result;
    } catch (err) {
      const isAuthError = await handleAuthError(err);
      if (!isAuthError) {
        const message = err instanceof Error ? err.message : "Trade failed";
        setError(message);
        toast(message, "error");
      }
      return null;
    } finally {
      setIsExecuting(false);
    }
  }, [handleAuthError]);

  const executeSell = useCallback(async (
    positionId: string,
    shares: number
  ): Promise<TradeResult | null> => {
    setIsExecuting(true);
    setError(null);
    try {
      const result = await apiClient.sellShares(positionId, shares);
      toast(`Successfully sold ${shares.toFixed(2)} shares`, "success");
      return result;
    } catch (err) {
      const isAuthError = await handleAuthError(err);
      if (!isAuthError) {
        const message = err instanceof Error ? err.message : "Sell failed";
        setError(message);
        toast(message, "error");
      }
      return null;
    } finally {
      setIsExecuting(false);
    }
  }, [handleAuthError]);

  const clearPreview = useCallback(() => {
    setPreview(null);
    setError(null);
  }, []);

  return {
    preview,
    isLoadingPreview,
    isExecuting,
    error,
    fetchPreview,
    executeBuy,
    executeSell,
    clearPreview,
  };
}
