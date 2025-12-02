"use client";

import { useState, useEffect, useCallback } from "react";
import apiClient from "@/lib/api/client";
import type {
  WalletBalance,
  WalletTransaction,
  PortfolioResponse,
  PositionHistoryResponse,
  DepositAddress,
  PendingDeposit,
  CurrencyCode,
} from "@/lib/api/types";
import { useAuthStore } from "@/lib/stores/useAuthStore";

interface UseBalancesReturn {
  balances: WalletBalance[];
  isLoading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export function useBalances(): UseBalancesReturn {
  const [balances, setBalances] = useState<WalletBalance[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { isAuthenticated } = useAuthStore();

  const fetchBalances = useCallback(async () => {
    if (!isAuthenticated) {
      setBalances([]);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);
    try {
      const response = await apiClient.getAllBalances();
      const cryptoBalances = response.filter((b) =>
        ["ETH", "USDC", "USDT"].includes(b.currency)
      );
      setBalances(cryptoBalances);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load balances");
    } finally {
      setIsLoading(false);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    fetchBalances();
  }, [fetchBalances]);

  return { balances, isLoading, error, refetch: fetchBalances };
}

interface UseTransactionsReturn {
  transactions: WalletTransaction[];
  total: number;
  isLoading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export function useTransactions(params?: {
  currency?: CurrencyCode;
  type?: "deposit" | "withdrawal" | "trade" | "trade_payout" | "fee";
  limit?: number;
}): UseTransactionsReturn {
  const [transactions, setTransactions] = useState<WalletTransaction[]>([]);
  const [total, setTotal] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { isAuthenticated } = useAuthStore();

  const fetchTransactions = useCallback(async () => {
    if (!isAuthenticated) {
      setTransactions([]);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);
    try {
      const response = await apiClient.getTransactions(params);
      setTransactions(response.transactions);
      setTotal(response.total);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load transactions");
    } finally {
      setIsLoading(false);
    }
  }, [isAuthenticated, params?.currency, params?.type, params?.limit]);

  useEffect(() => {
    fetchTransactions();
  }, [fetchTransactions]);

  return { transactions, total, isLoading, error, refetch: fetchTransactions };
}

interface UsePortfolioReturn {
  portfolio: PortfolioResponse | null;
  isLoading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export function usePortfolio(currency?: CurrencyCode): UsePortfolioReturn {
  const [portfolio, setPortfolio] = useState<PortfolioResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { isAuthenticated } = useAuthStore();

  const fetchPortfolio = useCallback(async () => {
    if (!isAuthenticated) {
      setPortfolio(null);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);
    try {
      const response = await apiClient.getPortfolio(currency);
      setPortfolio(response);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load portfolio");
    } finally {
      setIsLoading(false);
    }
  }, [isAuthenticated, currency]);

  useEffect(() => {
    fetchPortfolio();
  }, [fetchPortfolio]);

  return { portfolio, isLoading, error, refetch: fetchPortfolio };
}

interface UsePositionHistoryReturn {
  positions: PositionHistoryResponse | null;
  isLoading: boolean;
  error: string | null;
}

export function usePositionHistory(params?: {
  status?: "won" | "lost" | "sold" | "all";
  limit?: number;
}): UsePositionHistoryReturn {
  const [positions, setPositions] = useState<PositionHistoryResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { isAuthenticated } = useAuthStore();

  useEffect(() => {
    if (!isAuthenticated) {
      setPositions(null);
      setIsLoading(false);
      return;
    }

    const fetchPositions = async () => {
      setIsLoading(true);
      try {
        const response = await apiClient.getPositionHistory(params);
        setPositions(response);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load position history");
      } finally {
        setIsLoading(false);
      }
    };

    fetchPositions();
  }, [isAuthenticated, params?.status, params?.limit]);

  return { positions, isLoading, error };
}

interface UseCryptoDepositsReturn {
  addresses: Record<string, { address: string; network: string }> | null;
  pending: PendingDeposit[];
  isLoading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export function useCryptoDeposits(): UseCryptoDepositsReturn {
  const [addresses, setAddresses] = useState<Record<string, { address: string; network: string }> | null>(null);
  const [pending, setPending] = useState<PendingDeposit[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { isAuthenticated } = useAuthStore();

  const fetchData = useCallback(async () => {
    if (!isAuthenticated) {
      setAddresses(null);
      setPending([]);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);
    try {
      const [addressesRes, pendingRes] = await Promise.all([
        apiClient.getAllDepositAddresses(),
        apiClient.getPendingDeposits(),
      ]);
      setAddresses(addressesRes);
      setPending(pendingRes);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load deposit info");
    } finally {
      setIsLoading(false);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { addresses, pending, isLoading, error, refetch: fetchData };
}
