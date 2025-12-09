import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { User } from '@/lib/api/types';
import apiClient from '@/lib/api/client';

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  isAuthReady: boolean;
  error: string | null;
  
  setUser: (user: User | null) => void;
  setError: (error: string | null) => void;
  setLoading: (loading: boolean) => void;
  
  requestOtp: (email: string) => Promise<boolean>;
  verifyOtp: (email: string, code: string) => Promise<boolean>;
  loginWithWallet: (address: string, signMessage: (message: string) => Promise<string>) => Promise<boolean>;
  logout: () => Promise<void>;
  checkAuth: () => Promise<void>;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      isAuthenticated: false,
      isLoading: false,
      isAuthReady: false,
      error: null,

      setUser: (user) => set({ user, isAuthenticated: !!user }),
      setError: (error) => set({ error }),
      setLoading: (isLoading) => set({ isLoading }),

      requestOtp: async (email: string) => {
        set({ isLoading: true, error: null });
        try {
          await apiClient.requestOtp(email);
          set({ isLoading: false });
          return true;
        } catch (error) {
          set({ 
            isLoading: false, 
            error: error instanceof Error ? error.message : 'Failed to send OTP' 
          });
          return false;
        }
      },

      verifyOtp: async (email: string, code: string) => {
        set({ isLoading: true, error: null });
        try {
          const response = await apiClient.verifyOtp(email, code);
          set({ 
            user: response.user, 
            isAuthenticated: true, 
            isLoading: false,
            isAuthReady: true
          });
          return true;
        } catch (error) {
          set({ 
            isLoading: false, 
            error: error instanceof Error ? error.message : 'Invalid OTP code' 
          });
          return false;
        }
      },

      loginWithWallet: async (address: string, signMessage: (message: string) => Promise<string>) => {
        set({ isLoading: true, error: null });
        try {
          const challenge = await apiClient.getWalletChallenge(address);
          const signature = await signMessage(challenge.message);
          const response = await apiClient.verifyWalletSignature(challenge.message, signature);
          set({ 
            user: response.user, 
            isAuthenticated: true, 
            isLoading: false,
            isAuthReady: true
          });
          return true;
        } catch (error) {
          set({ 
            isLoading: false, 
            error: error instanceof Error ? error.message : 'Wallet login failed' 
          });
          return false;
        }
      },

      logout: async () => {
        set({ isLoading: true, isAuthReady: false });
        try {
          await apiClient.logout();
        } catch (error) {
        } finally {
          set({ 
            user: null, 
            isAuthenticated: false, 
            isLoading: false,
            isAuthReady: true,
            error: null 
          });
        }
      },

      checkAuth: async () => {
        let token = apiClient.getToken();
        
        if (!token && typeof window !== 'undefined') {
          token = localStorage.getItem('auth_token');
          if (token) {
            apiClient.setToken(token);
          }
        }
        
        if (!token) {
          set({ user: null, isAuthenticated: false, isLoading: false, isAuthReady: true });
          return;
        }

        set({ isLoading: true });
        try {
          const response = await apiClient.getCurrentUser();
          set({ 
            user: response.user, 
            isAuthenticated: true, 
            isLoading: false,
            isAuthReady: true
          });
        } catch (error) {
          apiClient.setToken(null);
          set({ 
            user: null, 
            isAuthenticated: false, 
            isLoading: false,
            isAuthReady: true
          });
        }
      },
    }),
    {
      name: 'auth-storage',
      storage: createJSONStorage(() => {
        if (typeof window !== 'undefined') {
          return localStorage;
        }
        return {
          getItem: () => null,
          setItem: () => {},
          removeItem: () => {},
        };
      }),
      partialize: (state) => ({ 
        user: state.user, 
        isAuthenticated: state.isAuthenticated 
      }),
    }
  )
);
