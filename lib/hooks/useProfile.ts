"use client";

import { useState, useEffect, useCallback } from "react";
import apiClient from "@/lib/api/client";
import type { UserProfile, CurrencyCode } from "@/lib/api/types";
import { useAuthStore } from "@/lib/stores/useAuthStore";

interface UseProfileReturn {
  profile: UserProfile | null;
  isLoading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
  updateProfile: (data: { name?: string; defaultCurrency?: CurrencyCode }) => Promise<boolean>;
}

export function useProfile(): UseProfileReturn {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { isAuthenticated } = useAuthStore();

  const fetchProfile = useCallback(async () => {
    if (!isAuthenticated) {
      setProfile(null);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);
    try {
      const response = await apiClient.getUserProfile();
      setProfile(response);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load profile");
    } finally {
      setIsLoading(false);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  const updateProfile = useCallback(async (data: { name?: string; defaultCurrency?: CurrencyCode }): Promise<boolean> => {
    try {
      const updated = await apiClient.updateProfile(data);
      setProfile(updated);
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update profile");
      return false;
    }
  }, []);

  return { profile, isLoading, error, refetch: fetchProfile, updateProfile };
}
