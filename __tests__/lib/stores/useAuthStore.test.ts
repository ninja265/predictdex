import { useAuthStore } from '@/lib/stores/useAuthStore';
import { apiClient } from '@/lib/api/client';

describe('useAuthStore - Real Zustand Store with Real ApiClient', () => {
  const mockFetch = global.fetch as jest.Mock;

  beforeEach(() => {
    localStorage.clear();
    mockFetch.mockClear();
    apiClient.setToken(null);
    useAuthStore.setState({
      user: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,
    });
  });

  describe('Initial State', () => {
    it('starts with null user', () => {
      const state = useAuthStore.getState();
      expect(state.user).toBeNull();
    });

    it('starts not authenticated', () => {
      const state = useAuthStore.getState();
      expect(state.isAuthenticated).toBe(false);
    });

    it('starts not loading', () => {
      const state = useAuthStore.getState();
      expect(state.isLoading).toBe(false);
    });

    it('starts with no error', () => {
      const state = useAuthStore.getState();
      expect(state.error).toBeNull();
    });
  });

  describe('setUser action', () => {
    it('sets user and marks as authenticated', () => {
      const user = { id: 'user-1', email: 'test@example.com', role: 'user' as const };
      useAuthStore.getState().setUser(user);
      
      const state = useAuthStore.getState();
      expect(state.user).toEqual(user);
      expect(state.isAuthenticated).toBe(true);
    });

    it('clears user and marks as not authenticated when null', () => {
      useAuthStore.getState().setUser({ id: '1', email: 'test@test.com', role: 'user' as const });
      useAuthStore.getState().setUser(null);
      
      const state = useAuthStore.getState();
      expect(state.user).toBeNull();
      expect(state.isAuthenticated).toBe(false);
    });
  });

  describe('setError action', () => {
    it('sets error message', () => {
      useAuthStore.getState().setError('Authentication failed');
      expect(useAuthStore.getState().error).toBe('Authentication failed');
    });

    it('clears error when set to null', () => {
      useAuthStore.getState().setError('Some error');
      useAuthStore.getState().setError(null);
      expect(useAuthStore.getState().error).toBeNull();
    });
  });

  describe('setLoading action', () => {
    it('sets loading to true', () => {
      useAuthStore.getState().setLoading(true);
      expect(useAuthStore.getState().isLoading).toBe(true);
    });

    it('sets loading to false', () => {
      useAuthStore.getState().setLoading(true);
      useAuthStore.getState().setLoading(false);
      expect(useAuthStore.getState().isLoading).toBe(false);
    });
  });

  describe('requestOtp action', () => {
    it('calls API endpoint with email and succeeds', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        headers: new Headers({ 'content-type': 'application/json' }),
        text: async () => JSON.stringify({ success: true, expiresIn: 300 }),
      });
      
      const result = await useAuthStore.getState().requestOtp('test@example.com');
      
      expect(mockFetch).toHaveBeenCalledWith(
        'https://sa-api-server-1.replit.app/api/v1/auth/request-otp',
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify({ email: 'test@example.com' }),
        })
      );
      expect(result).toBe(true);
    });

    it('sets loading during request', async () => {
      let loadingDuringRequest = false;
      mockFetch.mockImplementationOnce(async () => {
        loadingDuringRequest = useAuthStore.getState().isLoading;
        return {
          ok: true,
          status: 200,
          headers: new Headers({ 'content-type': 'application/json' }),
          text: async () => JSON.stringify({ success: true, expiresIn: 300 }),
        };
      });

      await useAuthStore.getState().requestOtp('test@example.com');
      
      expect(loadingDuringRequest).toBe(true);
      expect(useAuthStore.getState().isLoading).toBe(false);
    });

    it('sets error on API failure', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 429,
        json: async () => ({ message: 'Rate limited' }),
      });
      
      const result = await useAuthStore.getState().requestOtp('test@example.com');
      
      expect(result).toBe(false);
      expect(useAuthStore.getState().error).toBe('Rate limited');
    });

    it('clears previous error before request', async () => {
      useAuthStore.getState().setError('Previous error');
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        headers: new Headers({ 'content-type': 'application/json' }),
        text: async () => JSON.stringify({ success: true, expiresIn: 300 }),
      });
      
      await useAuthStore.getState().requestOtp('test@example.com');
      
      expect(useAuthStore.getState().error).toBeNull();
    });
  });

  describe('verifyOtp action', () => {
    it('calls API, sets user and stores token on success', async () => {
      const mockUser = { id: 'user-1', email: 'test@example.com', role: 'user' as const };
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        headers: new Headers({ 'content-type': 'application/json' }),
        text: async () => JSON.stringify({ token: 'jwt-token-123', user: mockUser }),
      });
      
      const result = await useAuthStore.getState().verifyOtp('test@example.com', '123456');
      
      expect(mockFetch).toHaveBeenCalledWith(
        'https://sa-api-server-1.replit.app/api/v1/auth/verify-otp',
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify({ email: 'test@example.com', code: '123456' }),
        })
      );
      expect(result).toBe(true);
      
      const state = useAuthStore.getState();
      expect(state.user).toEqual(mockUser);
      expect(state.isAuthenticated).toBe(true);
      expect(apiClient.getToken()).toBe('jwt-token-123');
      expect(localStorage.getItem('auth_token')).toBe('jwt-token-123');
    });

    it('sets error on invalid OTP', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 401,
        json: async () => ({ message: 'Invalid OTP code' }),
      });
      
      const result = await useAuthStore.getState().verifyOtp('test@example.com', '000000');
      
      expect(result).toBe(false);
      expect(useAuthStore.getState().error).toBe('Invalid OTP code');
      expect(useAuthStore.getState().isAuthenticated).toBe(false);
    });
  });

  describe('loginWithWallet action', () => {
    it('calls challenge, signMessage, and verify, then stores token', async () => {
      const mockUser = { id: 'user-2', walletAddress: '0x742d35Cc...', role: 'user' as const };
      const mockSignMessage = jest.fn().mockResolvedValue('0xsignature123');
      
      mockFetch
        .mockResolvedValueOnce({
          ok: true,
          status: 200,
          headers: new Headers({ 'content-type': 'application/json' }),
          text: async () => JSON.stringify({ message: 'Sign this message for AfricaPredicts', nonce: 'abc123' }),
        })
        .mockResolvedValueOnce({
          ok: true,
          status: 200,
          headers: new Headers({ 'content-type': 'application/json' }),
          text: async () => JSON.stringify({ token: 'wallet-jwt-token', user: mockUser }),
        });
      
      const result = await useAuthStore.getState().loginWithWallet('0x742d35Cc...', mockSignMessage);
      
      expect(mockFetch).toHaveBeenNthCalledWith(1,
        'https://sa-api-server-1.replit.app/api/v1/auth/wallet/challenge',
        expect.objectContaining({ method: 'POST' })
      );
      expect(mockSignMessage).toHaveBeenCalledWith('Sign this message for AfricaPredicts');
      expect(mockFetch).toHaveBeenNthCalledWith(2,
        'https://sa-api-server-1.replit.app/api/v1/auth/wallet/verify',
        expect.objectContaining({ method: 'POST' })
      );
      expect(result).toBe(true);
      
      const state = useAuthStore.getState();
      expect(state.user).toEqual(mockUser);
      expect(state.isAuthenticated).toBe(true);
      expect(apiClient.getToken()).toBe('wallet-jwt-token');
    });

    it('handles wallet signature rejection', async () => {
      const mockSignMessage = jest.fn().mockRejectedValue(new Error('User rejected the request'));
      
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        headers: new Headers({ 'content-type': 'application/json' }),
        text: async () => JSON.stringify({ message: 'Sign this', nonce: '123' }),
      });
      
      const result = await useAuthStore.getState().loginWithWallet('0x123...', mockSignMessage);
      
      expect(result).toBe(false);
      expect(useAuthStore.getState().error).toBe('User rejected the request');
    });
  });

  describe('logout action', () => {
    it('clears user state and removes token', async () => {
      apiClient.setToken('existing-token');
      useAuthStore.setState({
        user: { id: '1', email: 'test@test.com', role: 'user' as const },
        isAuthenticated: true,
        error: 'some error',
      });
      
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 204,
        headers: new Headers(),
        text: async () => '',
      });
      
      await useAuthStore.getState().logout();
      
      const state = useAuthStore.getState();
      expect(state.user).toBeNull();
      expect(state.isAuthenticated).toBe(false);
      expect(state.isLoading).toBe(false);
      expect(state.error).toBeNull();
      expect(apiClient.getToken()).toBeNull();
      expect(localStorage.getItem('auth_token')).toBeNull();
    });

    it('calls logout API endpoint', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 204,
        headers: new Headers(),
        text: async () => '',
      });
      
      await useAuthStore.getState().logout();
      
      expect(mockFetch).toHaveBeenCalledWith(
        'https://sa-api-server-1.replit.app/api/v1/auth/logout',
        expect.objectContaining({ method: 'POST' })
      );
    });

    it('clears state even if API call fails', async () => {
      apiClient.setToken('token-to-clear');
      useAuthStore.setState({
        user: { id: '1', email: 'test@test.com', role: 'user' as const },
        isAuthenticated: true,
      });
      
      mockFetch.mockRejectedValueOnce(new Error('Network error'));
      
      await useAuthStore.getState().logout();
      
      expect(useAuthStore.getState().user).toBeNull();
      expect(useAuthStore.getState().isAuthenticated).toBe(false);
      expect(apiClient.getToken()).toBeNull();
    });
  });

  describe('checkAuth action', () => {
    it('fetches user when token exists in localStorage', async () => {
      const mockUser = { id: '1', email: 'test@test.com', role: 'user' as const };
      localStorage.setItem('auth_token', 'stored-token');
      apiClient.setToken('stored-token');
      
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        headers: new Headers({ 'content-type': 'application/json' }),
        text: async () => JSON.stringify({ user: mockUser }),
      });
      
      await useAuthStore.getState().checkAuth();
      
      expect(mockFetch).toHaveBeenCalledWith(
        'https://sa-api-server-1.replit.app/api/v1/auth/me',
        expect.objectContaining({
          headers: expect.objectContaining({
            'Authorization': 'Bearer stored-token'
          })
        })
      );
      
      const state = useAuthStore.getState();
      expect(state.user).toEqual(mockUser);
      expect(state.isAuthenticated).toBe(true);
    });

    it('does not fetch when no token', async () => {
      await useAuthStore.getState().checkAuth();
      
      expect(mockFetch).not.toHaveBeenCalled();
      expect(useAuthStore.getState().isAuthenticated).toBe(false);
    });

    it('clears token and state on 401 error', async () => {
      localStorage.setItem('auth_token', 'expired-token');
      apiClient.setToken('expired-token');
      
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 401,
        json: async () => ({ message: 'Unauthorized' }),
      });
      
      await useAuthStore.getState().checkAuth();
      
      expect(apiClient.getToken()).toBeNull();
      expect(localStorage.getItem('auth_token')).toBeNull();
      expect(useAuthStore.getState().isAuthenticated).toBe(false);
    });
  });

  describe('User Roles', () => {
    it('correctly stores admin user', () => {
      const adminUser = { id: 'admin-1', email: 'admin@example.com', role: 'admin' as const };
      useAuthStore.getState().setUser(adminUser);
      
      expect(useAuthStore.getState().user?.role).toBe('admin');
    });

    it('correctly stores regular user', () => {
      const regularUser = { id: 'user-1', email: 'user@example.com', role: 'user' as const };
      useAuthStore.getState().setUser(regularUser);
      
      expect(useAuthStore.getState().user?.role).toBe('user');
    });
  });

  describe('Token Persistence Integration', () => {
    it('token set during login persists across apiClient and localStorage', async () => {
      const mockUser = { id: 'user-1', email: 'test@example.com', role: 'user' as const };
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        headers: new Headers({ 'content-type': 'application/json' }),
        text: async () => JSON.stringify({ token: 'persisted-token', user: mockUser }),
      });
      
      await useAuthStore.getState().verifyOtp('test@example.com', '123456');
      
      expect(apiClient.getToken()).toBe('persisted-token');
      expect(localStorage.getItem('auth_token')).toBe('persisted-token');
    });

    it('subsequent API calls include the stored token', async () => {
      apiClient.setToken('user-auth-token');
      
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        headers: new Headers({ 'content-type': 'application/json' }),
        text: async () => JSON.stringify({ user: { id: '1', role: 'user' } }),
      });
      
      await useAuthStore.getState().checkAuth();
      
      const calledHeaders = mockFetch.mock.calls[0][1].headers as Record<string, string>;
      expect(calledHeaders['Authorization']).toBe('Bearer user-auth-token');
    });
  });

  describe('Error Handling Integration', () => {
    it('handles network errors gracefully', async () => {
      mockFetch.mockRejectedValueOnce(new Error('Network request failed'));
      
      const result = await useAuthStore.getState().requestOtp('test@example.com');
      
      expect(result).toBe(false);
      expect(useAuthStore.getState().error).toBe('Network request failed');
    });

    it('handles malformed JSON responses', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 500,
        json: async () => { throw new Error('Invalid JSON'); },
      });
      
      const result = await useAuthStore.getState().requestOtp('test@example.com');
      
      expect(result).toBe(false);
      expect(useAuthStore.getState().error).toContain('unexpected error');
    });
  });

  describe('State Transitions', () => {
    it('handles full login flow state changes', async () => {
      const states: boolean[] = [];
      
      mockFetch.mockImplementationOnce(async () => {
        states.push(useAuthStore.getState().isLoading);
        return {
          ok: true,
          status: 200,
          headers: new Headers({ 'content-type': 'application/json' }),
          text: async () => JSON.stringify({ success: true, expiresIn: 300 }),
        };
      });
      
      await useAuthStore.getState().requestOtp('test@example.com');
      states.push(useAuthStore.getState().isLoading);
      
      expect(states).toEqual([true, false]);
    });

    it('handles error recovery', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 429,
        json: async () => ({ message: 'First attempt failed' }),
      });
      await useAuthStore.getState().requestOtp('test@example.com');
      expect(useAuthStore.getState().error).toBe('First attempt failed');

      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        headers: new Headers({ 'content-type': 'application/json' }),
        text: async () => JSON.stringify({ success: true, expiresIn: 300 }),
      });
      await useAuthStore.getState().requestOtp('test@example.com');
      expect(useAuthStore.getState().error).toBeNull();
    });
  });

  describe('Store Default State Behavior', () => {
    it('store starts in clean state after reset', () => {
      const state = useAuthStore.getState();
      expect(state.user).toBeNull();
      expect(state.isAuthenticated).toBe(false);
      expect(state.isLoading).toBe(false);
      expect(state.error).toBeNull();
    });

    it('getState returns current snapshot', () => {
      useAuthStore.getState().setUser({ id: '1', email: 'test@test.com', role: 'user' });
      const state = useAuthStore.getState();
      expect(state.user?.id).toBe('1');
    });

    it('setState updates store immediately', () => {
      useAuthStore.setState({ error: 'Test error' });
      expect(useAuthStore.getState().error).toBe('Test error');
    });
  });

  describe('Complete Authentication Flow', () => {
    it('full OTP login flow from start to finish', async () => {
      const mockUser = { id: 'user-1', email: 'user@test.com', role: 'user' as const };
      
      mockFetch
        .mockResolvedValueOnce({
          ok: true,
          status: 200,
          headers: new Headers({ 'content-type': 'application/json' }),
          text: async () => JSON.stringify({ success: true, expiresIn: 300 }),
        })
        .mockResolvedValueOnce({
          ok: true,
          status: 200,
          headers: new Headers({ 'content-type': 'application/json' }),
          text: async () => JSON.stringify({ token: 'final-token', user: mockUser }),
        });

      const otpResult = await useAuthStore.getState().requestOtp('user@test.com');
      expect(otpResult).toBe(true);
      expect(useAuthStore.getState().isAuthenticated).toBe(false);

      const verifyResult = await useAuthStore.getState().verifyOtp('user@test.com', '123456');
      expect(verifyResult).toBe(true);
      expect(useAuthStore.getState().isAuthenticated).toBe(true);
      expect(useAuthStore.getState().user).toEqual(mockUser);
      expect(apiClient.getToken()).toBe('final-token');
    });

    it('full wallet login flow from start to finish', async () => {
      const mockUser = { id: 'wallet-user', walletAddress: '0xabc123', role: 'user' as const };
      const mockSignMessage = jest.fn().mockResolvedValue('0xsig456');
      
      mockFetch
        .mockResolvedValueOnce({
          ok: true,
          status: 200,
          headers: new Headers({ 'content-type': 'application/json' }),
          text: async () => JSON.stringify({ message: 'Sign for AfricaPredicts', nonce: 'n123' }),
        })
        .mockResolvedValueOnce({
          ok: true,
          status: 200,
          headers: new Headers({ 'content-type': 'application/json' }),
          text: async () => JSON.stringify({ token: 'wallet-token', user: mockUser }),
        });

      const result = await useAuthStore.getState().loginWithWallet('0xabc123', mockSignMessage);
      expect(result).toBe(true);
      expect(useAuthStore.getState().isAuthenticated).toBe(true);
      expect(useAuthStore.getState().user).toEqual(mockUser);
      expect(apiClient.getToken()).toBe('wallet-token');
    });

    it('full logout flow clears everything', async () => {
      apiClient.setToken('active-token');
      useAuthStore.setState({
        user: { id: '1', email: 'test@test.com', role: 'user' },
        isAuthenticated: true,
      });

      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 204,
        headers: new Headers(),
        text: async () => '',
      });

      await useAuthStore.getState().logout();

      expect(useAuthStore.getState().user).toBeNull();
      expect(useAuthStore.getState().isAuthenticated).toBe(false);
      expect(apiClient.getToken()).toBeNull();
      expect(localStorage.getItem('auth_token')).toBeNull();
    });
  });

  describe('Concurrent Request Handling', () => {
    it('multiple rapid requests do not corrupt state', async () => {
      mockFetch.mockResolvedValue({
        ok: true,
        status: 200,
        headers: new Headers({ 'content-type': 'application/json' }),
        text: async () => JSON.stringify({ success: true, expiresIn: 300 }),
      });

      const promises = [
        useAuthStore.getState().requestOtp('user1@test.com'),
        useAuthStore.getState().requestOtp('user2@test.com'),
        useAuthStore.getState().requestOtp('user3@test.com'),
      ];

      const results = await Promise.all(promises);
      
      expect(results).toEqual([true, true, true]);
      expect(useAuthStore.getState().isLoading).toBe(false);
      expect(mockFetch).toHaveBeenCalledTimes(3);
    });
  });
});
