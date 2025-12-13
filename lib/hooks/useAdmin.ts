"use client";

import { useState, useEffect, useCallback } from "react";
import apiClient from "@/lib/api/client";
import { normalizeListResponse, extractArrayFromResponse } from "@/lib/api/responseHelpers";
import type {
  Market,
  MarketsResponse,
  MarketStatus,
  MarketCategory,
  AdminMarketCreate,
  AdminMarketUpdate,
  AdminPriceUpdate,
  ResolutionQueue,
  SettlementStats,
  SettlementPreview,
  AdminDeposit,
  AdminDepositStats,
  AdminWithdrawal,
} from "@/lib/api/types";
import { useAuthStore } from "@/lib/stores/useAuthStore";

export function useAdminMarkets(params?: {
  status?: MarketStatus;
  category?: MarketCategory;
  limit?: number;
  offset?: number;
}) {
  const [markets, setMarkets] = useState<Market[]>([]);
  const [total, setTotal] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user, isAuthReady } = useAuthStore();
  
  // Memoize params to prevent unnecessary re-fetches
  const status = params?.status;
  const category = params?.category;
  const limit = params?.limit;
  const offset = params?.offset;

  const fetchMarkets = useCallback(async () => {
    if (!isAuthReady) {
      return;
    }
    
    if (user?.role !== "admin") {
      setError("Unauthorized");
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);
    try {
      const response = await apiClient.getAdminMarkets({ status, category, limit, offset });
      const { data: marketsArray, total: totalCount } = normalizeListResponse<Market>(response, 'markets');
      console.log("[Admin Markets] API response:", { 
        marketsCount: marketsArray.length, 
        total: totalCount,
        status, 
        category 
      });
      setMarkets(marketsArray);
      setTotal(totalCount);
    } catch (err) {
      console.error("[Admin Markets] API error:", err);
      setError(err instanceof Error ? err.message : "Failed to load markets");
      setMarkets([]);
      setTotal(0);
    } finally {
      setIsLoading(false);
    }
  }, [user?.role, isAuthReady, status, category, limit, offset]);

  useEffect(() => {
    fetchMarkets();
  }, [fetchMarkets]);

  const createMarket = async (data: AdminMarketCreate): Promise<Market | null> => {
    try {
      const market = await apiClient.createMarket(data);
      await fetchMarkets();
      return market;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create market");
      return null;
    }
  };

  const updateMarket = async (id: string, data: AdminMarketUpdate): Promise<boolean> => {
    try {
      await apiClient.updateMarket(id, data);
      await fetchMarkets();
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update market");
      return false;
    }
  };

  const updatePrices = async (id: string, data: AdminPriceUpdate): Promise<boolean> => {
    try {
      await apiClient.updateMarketPrices(id, data);
      await fetchMarkets();
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update prices");
      return false;
    }
  };

  const resolveMarket = async (id: string, outcome: "YES" | "NO", notes?: string): Promise<boolean> => {
    try {
      await apiClient.resolveMarket(id, outcome, notes);
      await fetchMarkets();
      return true;
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : "Failed to resolve market";
      setError(errorMsg);
      return false;
    }
  };

  return {
    markets,
    total,
    isLoading,
    error,
    refetch: fetchMarkets,
    createMarket,
    updateMarket,
    updatePrices,
    resolveMarket,
  };
}

export function useSettlement() {
  const [queue, setQueue] = useState<ResolutionQueue | null>(null);
  const [stats, setStats] = useState<SettlementStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user, isAuthReady } = useAuthStore();

  const fetchData = useCallback(async () => {
    if (!isAuthReady) {
      return;
    }
    
    if (user?.role !== "admin") {
      setError("Unauthorized");
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);
    try {
      const [queueRes, statsRes] = await Promise.all([
        apiClient.getResolutionQueue(),
        apiClient.getSettlementStats(),
      ]);
      setQueue(queueRes);
      setStats(statsRes);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load settlement data");
    } finally {
      setIsLoading(false);
    }
  }, [user?.role, isAuthReady]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const getPreview = async (id: string, outcome: "YES" | "NO"): Promise<SettlementPreview | null> => {
    try {
      return await apiClient.getSettlementPreview(id, outcome);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to get preview");
      return null;
    }
  };

  const settleMarket = async (id: string, outcome: "YES" | "NO", notes?: string): Promise<boolean> => {
    try {
      await apiClient.settleMarket(id, outcome, notes);
      await fetchData();
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to settle market");
      return false;
    }
  };

  const triggerCheck = async (): Promise<boolean> => {
    try {
      await apiClient.triggerSettlementCheck();
      await fetchData();
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to trigger check");
      return false;
    }
  };

  return {
    queue,
    stats,
    isLoading,
    error,
    refetch: fetchData,
    getPreview,
    settleMarket,
    triggerCheck,
  };
}

export function useAdminCrypto() {
  const [deposits, setDeposits] = useState<AdminDeposit[]>([]);
  const [depositStats, setDepositStats] = useState<AdminDepositStats | null>(null);
  const [withdrawals, setWithdrawals] = useState<AdminWithdrawal[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user, isAuthReady } = useAuthStore();

  const fetchData = useCallback(async () => {
    if (!isAuthReady) {
      return;
    }
    
    if (user?.role !== "admin") {
      setError("Unauthorized");
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);
    try {
      const [depositsRes, statsRes, withdrawalsRes] = await Promise.all([
        apiClient.getAdminDeposits({ status: "pending", limit: 50 }).catch(() => ({ deposits: [] })),
        apiClient.getAdminDepositStats().catch(() => ({ pendingCount: 0, pendingVolume: 0, creditedToday: 0, creditedVolumeToday: 0 })),
        apiClient.getAdminWithdrawals({ status: "pending", limit: 50 }).catch(() => ({ withdrawals: [] })),
      ]);
      setDeposits(extractArrayFromResponse<AdminDeposit>(depositsRes, 'deposits'));
      setDepositStats(statsRes ?? { pendingCount: 0, pendingVolume: 0, creditedToday: 0, creditedVolumeToday: 0 });
      setWithdrawals(extractArrayFromResponse<AdminWithdrawal>(withdrawalsRes, 'withdrawals'));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load crypto data");
    } finally {
      setIsLoading(false);
    }
  }, [user?.role, isAuthReady]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const creditDeposit = async (id: string): Promise<boolean> => {
    try {
      await apiClient.creditDeposit(id);
      await fetchData();
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to credit deposit");
      return false;
    }
  };

  const approveWithdrawal = async (id: string, notes?: string): Promise<boolean> => {
    try {
      await apiClient.approveWithdrawal(id, notes);
      await fetchData();
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to approve withdrawal");
      return false;
    }
  };

  const rejectWithdrawal = async (id: string, reason: string): Promise<boolean> => {
    try {
      await apiClient.rejectWithdrawal(id, reason);
      await fetchData();
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to reject withdrawal");
      return false;
    }
  };

  const completeWithdrawal = async (id: string, txHash: string): Promise<boolean> => {
    try {
      await apiClient.completeWithdrawal(id, txHash);
      await fetchData();
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to complete withdrawal");
      return false;
    }
  };

  return {
    deposits,
    depositStats,
    withdrawals,
    isLoading,
    error,
    refetch: fetchData,
    creditDeposit,
    approveWithdrawal,
    rejectWithdrawal,
    completeWithdrawal,
  };
}
