import { apiClient } from '@/lib/api/client';

describe('ApiClient - Real Module Tests', () => {
  const mockFetch = global.fetch as jest.Mock;

  beforeEach(() => {
    localStorage.clear();
    mockFetch.mockClear();
    apiClient.setToken(null);
  });

  describe('Module Initialization', () => {
    it('apiClient is a singleton instance', () => {
      const { apiClient: client1 } = require('@/lib/api/client');
      const { apiClient: client2 } = require('@/lib/api/client');
      expect(client1).toBe(client2);
    });

    it('token set on instance persists across method calls', () => {
      apiClient.setToken('persistent-token');
      expect(apiClient.getToken()).toBe('persistent-token');
      
      apiClient.setToken('updated-token');
      expect(apiClient.getToken()).toBe('updated-token');
    });
  });

  describe('Token Management', () => {
    it('setToken stores token in instance and localStorage', () => {
      apiClient.setToken('test-jwt-token');
      
      expect(apiClient.getToken()).toBe('test-jwt-token');
      expect(localStorage.getItem('auth_token')).toBe('test-jwt-token');
    });

    it('setToken(null) clears token from instance and localStorage', () => {
      apiClient.setToken('existing-token');
      apiClient.setToken(null);
      
      expect(apiClient.getToken()).toBeNull();
      expect(localStorage.getItem('auth_token')).toBeNull();
    });

    it('getToken returns current token', () => {
      apiClient.setToken('my-token');
      expect(apiClient.getToken()).toBe('my-token');
    });
  });

  describe('getMarkets', () => {
    it('fetches markets successfully', async () => {
      const mockResponse = {
        markets: [{ id: '1', slug: 'test-market', question: 'Will this pass?', yesPrice: 0.6, noPrice: 0.4 }],
        total: 1
      };
      
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        headers: new Headers({ 'content-type': 'application/json' }),
        json: async () => mockResponse,
        text: async () => JSON.stringify(mockResponse),
      });

      const result = await apiClient.getMarkets();
      
      expect(mockFetch).toHaveBeenCalledWith(
        'https://sa-api-server-1.replit.app/api/v1/markets',
        expect.objectContaining({
          headers: expect.objectContaining({ 'Content-Type': 'application/json' }),
        })
      );
      expect(result.markets).toHaveLength(1);
      expect(result.markets[0].slug).toBe('test-market');
    });

    it('passes query parameters correctly', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        headers: new Headers({ 'content-type': 'application/json' }),
        text: async () => JSON.stringify({ markets: [], total: 0 }),
      });

      await apiClient.getMarkets({ category: 'Politics', status: 'open', limit: 10 });
      
      const calledUrl = mockFetch.mock.calls[0][0] as string;
      expect(calledUrl).toContain('category=Politics');
      expect(calledUrl).toContain('status=open');
      expect(calledUrl).toContain('limit=10');
    });
  });

  describe('getMarket', () => {
    it('fetches single market by slug', async () => {
      const mockMarket = { id: '1', slug: 'nigeria-election', question: 'Will Nigeria...', yesPrice: 0.55, noPrice: 0.45 };
      
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        headers: new Headers({ 'content-type': 'application/json' }),
        text: async () => JSON.stringify(mockMarket),
      });

      const result = await apiClient.getMarket('nigeria-election');
      
      expect(mockFetch).toHaveBeenCalledWith(
        'https://sa-api-server-1.replit.app/api/v1/markets/nigeria-election',
        expect.any(Object)
      );
      expect(result.slug).toBe('nigeria-election');
    });
  });

  describe('Authorization Header Injection', () => {
    it('includes Authorization header when token is set', async () => {
      apiClient.setToken('my-auth-token');
      
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        headers: new Headers({ 'content-type': 'application/json' }),
        text: async () => JSON.stringify({ markets: [], total: 0 }),
      });

      await apiClient.getMarkets();
      
      expect(mockFetch).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          headers: expect.objectContaining({ 'Authorization': 'Bearer my-auth-token' }),
        })
      );
    });

    it('does not include Authorization header when no token', async () => {
      apiClient.setToken(null);
      
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        headers: new Headers({ 'content-type': 'application/json' }),
        text: async () => JSON.stringify({ markets: [], total: 0 }),
      });

      await apiClient.getMarkets();
      
      const headers = mockFetch.mock.calls[0][1]?.headers as Record<string, string>;
      expect(headers['Authorization']).toBeUndefined();
    });
  });

  describe('Error Handling', () => {
    it('throws error on non-OK response', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 404,
        json: async () => ({ message: 'Market not found' }),
      });

      await expect(apiClient.getMarket('invalid-slug')).rejects.toThrow('Market not found');
    });

    it('handles 500 server error', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 500,
        json: async () => ({ message: 'Internal server error' }),
      });

      await expect(apiClient.getMarkets()).rejects.toThrow('Internal server error');
    });

    it('provides fallback error message when no message in response', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 400,
        json: async () => ({}),
      });

      await expect(apiClient.getMarkets()).rejects.toThrow('HTTP error 400');
    });

    it('handles network failure', async () => {
      mockFetch.mockRejectedValueOnce(new Error('Network request failed'));

      await expect(apiClient.getMarkets()).rejects.toThrow('Network request failed');
    });
  });

  describe('204 No Content Handling', () => {
    it('returns success object for 204 response', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 204,
        headers: new Headers(),
        text: async () => '',
      });

      const result = await apiClient.logout();
      
      expect(result).toEqual({ success: true });
    });
  });

  describe('Empty Response Body Handling', () => {
    it('handles empty response body gracefully', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        headers: new Headers({ 'content-type': 'application/json' }),
        text: async () => '',
      });

      const result = await apiClient.logout();
      expect(result).toEqual({ success: true });
    });
  });

  describe('Response Parsing Edge Cases', () => {
    it('handles non-JSON content-type response', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        headers: new Headers({ 'content-type': 'text/plain' }),
        text: async () => 'OK',
      });

      const result = await apiClient.logout();
      expect(result).toEqual({ success: true });
    });

    it('handles whitespace-only response body', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        headers: new Headers({ 'content-type': 'application/json' }),
        text: async () => '   \n  ',
      });

      const result = await apiClient.logout();
      expect(result).toEqual({ success: true });
    });

    it('handles response with missing content-type header', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        headers: new Headers(),
        text: async () => '',
      });

      const result = await apiClient.logout();
      expect(result).toEqual({ success: true });
    });
  });

  describe('Error Decoding Edge Cases', () => {
    it('handles error response with non-JSON body', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 500,
        json: async () => { throw new SyntaxError('Unexpected token'); },
      });

      await expect(apiClient.getMarkets()).rejects.toThrow('An unexpected error occurred');
    });

    it('handles error response with empty message field', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 403,
        json: async () => ({ message: '' }),
      });

      await expect(apiClient.getMarkets()).rejects.toThrow('HTTP error 403');
    });

    it('handles error response with error field instead of message', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 400,
        json: async () => ({ error: 'Bad request format' }),
      });

      await expect(apiClient.getMarkets()).rejects.toThrow('HTTP error 400');
    });
  });

  describe('Authentication Flow', () => {
    it('requestOtp sends correct payload', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        headers: new Headers({ 'content-type': 'application/json' }),
        text: async () => JSON.stringify({ success: true, expiresIn: 300 }),
      });

      await apiClient.requestOtp('test@example.com');
      
      expect(mockFetch).toHaveBeenCalledWith(
        'https://sa-api-server-1.replit.app/api/v1/auth/request-otp',
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify({ email: 'test@example.com' }),
        })
      );
    });

    it('verifyOtp stores token on success', async () => {
      const mockResponse = {
        success: true,
        token: 'new-jwt-token',
        user: { id: '1', email: 'test@example.com', role: 'user' }
      };
      
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        headers: new Headers({ 'content-type': 'application/json' }),
        text: async () => JSON.stringify(mockResponse),
      });

      await apiClient.verifyOtp('test@example.com', '123456');
      
      expect(apiClient.getToken()).toBe('new-jwt-token');
      expect(localStorage.getItem('auth_token')).toBe('new-jwt-token');
    });

    it('getWalletChallenge sends correct address', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        headers: new Headers({ 'content-type': 'application/json' }),
        text: async () => JSON.stringify({ message: 'Sign this message...' }),
      });

      await apiClient.getWalletChallenge('0x742d35Cc6634C0532925a3b844Bc9e7595f5aB0e');
      
      const body = JSON.parse(mockFetch.mock.calls[0][1]?.body as string);
      expect(body.walletAddress).toBe('0x742d35Cc6634C0532925a3b844Bc9e7595f5aB0e');
    });

    it('verifyWalletSignature stores token on success', async () => {
      const mockResponse = {
        success: true,
        token: 'wallet-jwt-token',
        user: { id: '2', email: null, walletAddress: '0x...', role: 'user' }
      };
      
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        headers: new Headers({ 'content-type': 'application/json' }),
        text: async () => JSON.stringify(mockResponse),
      });

      await apiClient.verifyWalletSignature('message', 'signature');
      
      expect(apiClient.getToken()).toBe('wallet-jwt-token');
    });

    it('logout clears token', async () => {
      apiClient.setToken('existing-token');
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 204,
        headers: new Headers(),
        text: async () => '',
      });

      await apiClient.logout();
      
      expect(apiClient.getToken()).toBeNull();
      expect(localStorage.getItem('auth_token')).toBeNull();
    });
  });

  describe('Trading Endpoints', () => {
    it('previewTrade sends correct payload', async () => {
      apiClient.setToken('auth-token');
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        headers: new Headers({ 'content-type': 'application/json' }),
        text: async () => JSON.stringify({ shares: 200, fee: 2, totalCost: 102 }),
      });

      await apiClient.previewTrade('market-123', 'YES', 100);
      
      const body = JSON.parse(mockFetch.mock.calls[0][1]?.body as string);
      expect(body).toEqual({ marketId: 'market-123', outcome: 'YES', stake: 100 });
    });

    it('buyShares includes idempotency key', async () => {
      apiClient.setToken('auth-token');
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        headers: new Headers({ 'content-type': 'application/json' }),
        text: async () => JSON.stringify({ success: true, trade: { id: 't1', shares: 200 } }),
      });

      await apiClient.buyShares('market-123', 'YES', 100, 'idem-key-123');
      
      const body = JSON.parse(mockFetch.mock.calls[0][1]?.body as string);
      expect(body.idempotencyKey).toBe('idem-key-123');
    });

    it('sellShares sends correct payload', async () => {
      apiClient.setToken('auth-token');
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        headers: new Headers({ 'content-type': 'application/json' }),
        text: async () => JSON.stringify({ success: true }),
      });

      await apiClient.sellShares('position-456', 50);
      
      const body = JSON.parse(mockFetch.mock.calls[0][1]?.body as string);
      expect(body).toEqual({ positionId: 'position-456', sharesToSell: 50 });
    });
  });

  describe('Wallet Endpoints', () => {
    it('getAllBalances fetches balances', async () => {
      apiClient.setToken('auth-token');
      const mockBalances = [
        { currency: 'ETH', available: 1.5, locked: 0 },
        { currency: 'USDC', available: 100, locked: 10 },
      ];
      
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        headers: new Headers({ 'content-type': 'application/json' }),
        text: async () => JSON.stringify(mockBalances),
      });

      const result = await apiClient.getAllBalances();
      
      expect(result).toHaveLength(2);
      expect(result[0].currency).toBe('ETH');
    });

    it('getTransactions passes filter parameters', async () => {
      apiClient.setToken('auth-token');
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        headers: new Headers({ 'content-type': 'application/json' }),
        text: async () => JSON.stringify({ transactions: [], total: 0 }),
      });

      await apiClient.getTransactions({ currency: 'USDC', type: 'deposit', limit: 20 });
      
      const calledUrl = mockFetch.mock.calls[0][0] as string;
      expect(calledUrl).toContain('currency=USDC');
      expect(calledUrl).toContain('type=deposit');
      expect(calledUrl).toContain('limit=20');
    });
  });

  describe('Order Book', () => {
    it('getOrderBook fetches order book for market', async () => {
      const mockOrderBook = {
        marketId: 'market-1',
        yesBids: [{ price: 0.55, size: 1000 }],
        noAsks: [{ price: 0.45, size: 500 }]
      };
      
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        headers: new Headers({ 'content-type': 'application/json' }),
        text: async () => JSON.stringify(mockOrderBook),
      });

      const result = await apiClient.getOrderBook('market-slug');
      
      expect(mockFetch).toHaveBeenCalledWith(
        'https://sa-api-server-1.replit.app/api/v1/markets/market-slug/orderbook',
        expect.any(Object)
      );
      expect(result.yesBids).toHaveLength(1);
      expect(result.noAsks).toHaveLength(1);
    });
  });
});
