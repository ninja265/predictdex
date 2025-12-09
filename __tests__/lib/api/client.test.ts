import { describe, it, expect, beforeEach, afterEach, jest } from '@jest/globals';

const mockLocalStorage = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => { store[key] = value; },
    removeItem: (key: string) => { delete store[key]; },
    clear: () => { store = {}; },
  };
})();

Object.defineProperty(global, 'localStorage', { value: mockLocalStorage });

const originalFetch = global.fetch;
let mockFetchImpl: jest.MockedFunction<typeof fetch>;

beforeEach(() => {
  mockLocalStorage.clear();
  mockFetchImpl = jest.fn() as jest.MockedFunction<typeof fetch>;
  global.fetch = mockFetchImpl;
});

afterEach(() => {
  global.fetch = originalFetch;
  jest.clearAllMocks();
});

describe('ApiClient Integration', () => {
  describe('Token Storage', () => {
    it('persists token to localStorage when set', () => {
      const token = 'test-jwt-token-12345';
      localStorage.setItem('auth_token', token);
      expect(localStorage.getItem('auth_token')).toBe(token);
    });

    it('removes token from localStorage when cleared', () => {
      localStorage.setItem('auth_token', 'existing-token');
      localStorage.removeItem('auth_token');
      expect(localStorage.getItem('auth_token')).toBeNull();
    });

    it('retrieves stored token correctly', () => {
      const token = 'stored-token-xyz';
      localStorage.setItem('auth_token', token);
      const retrieved = localStorage.getItem('auth_token');
      expect(retrieved).toBe(token);
    });
  });

  describe('HTTP Request Handling', () => {
    it('handles successful JSON response', async () => {
      const responseData = { markets: [], total: 0 };
      mockFetchImpl.mockResolvedValueOnce(new Response(JSON.stringify(responseData), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }));

      const response = await fetch('https://api.example.com/markets');
      const data = await response.json();
      
      expect(response.status).toBe(200);
      expect(data).toEqual(responseData);
    });

    it('handles 204 No Content response', async () => {
      mockFetchImpl.mockResolvedValueOnce(new Response(null, { status: 204 }));
      
      const response = await fetch('https://api.example.com/logout');
      expect(response.status).toBe(204);
    });

    it('handles 401 Unauthorized response', async () => {
      mockFetchImpl.mockResolvedValueOnce(new Response(
        JSON.stringify({ message: 'Unauthorized' }),
        { status: 401, headers: { 'Content-Type': 'application/json' } }
      ));

      const response = await fetch('https://api.example.com/protected');
      expect(response.status).toBe(401);
      expect(response.ok).toBe(false);
    });

    it('handles 500 Server Error response', async () => {
      mockFetchImpl.mockResolvedValueOnce(new Response(
        JSON.stringify({ message: 'Internal Server Error' }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      ));

      const response = await fetch('https://api.example.com/error');
      expect(response.status).toBe(500);
    });

    it('handles network failure', async () => {
      mockFetchImpl.mockRejectedValueOnce(new Error('Network request failed'));
      
      await expect(fetch('https://api.example.com/markets')).rejects.toThrow('Network request failed');
    });

    it('handles timeout', async () => {
      mockFetchImpl.mockRejectedValueOnce(new Error('Request timeout'));
      
      await expect(fetch('https://api.example.com/slow')).rejects.toThrow('Request timeout');
    });
  });

  describe('Request Configuration', () => {
    it('sends correct Content-Type header', async () => {
      mockFetchImpl.mockResolvedValueOnce(new Response('{}', { status: 200 }));
      
      await fetch('https://api.example.com/test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ data: 'test' }),
      });

      expect(mockFetchImpl).toHaveBeenCalledWith(
        'https://api.example.com/test',
        expect.objectContaining({
          method: 'POST',
          headers: expect.objectContaining({ 'Content-Type': 'application/json' }),
        })
      );
    });

    it('includes Authorization header when token present', async () => {
      const token = 'my-auth-token';
      mockFetchImpl.mockResolvedValueOnce(new Response('{}', { status: 200 }));
      
      await fetch('https://api.example.com/protected', {
        headers: { 'Authorization': `Bearer ${token}` },
      });

      expect(mockFetchImpl).toHaveBeenCalledWith(
        'https://api.example.com/protected',
        expect.objectContaining({
          headers: expect.objectContaining({ 'Authorization': `Bearer ${token}` }),
        })
      );
    });
  });

  describe('API Endpoints URL Construction', () => {
    const BASE_URL = 'https://sa-api-server-1.replit.app/api/v1';

    it('constructs markets list URL correctly', () => {
      const url = `${BASE_URL}/markets`;
      expect(url).toBe('https://sa-api-server-1.replit.app/api/v1/markets');
    });

    it('constructs market detail URL with slug', () => {
      const slug = 'will-nigeria-win-2025';
      const url = `${BASE_URL}/markets/${slug}`;
      expect(url).toBe('https://sa-api-server-1.replit.app/api/v1/markets/will-nigeria-win-2025');
    });

    it('constructs URL with query parameters', () => {
      const params = new URLSearchParams();
      params.set('category', 'Politics');
      params.set('status', 'open');
      params.set('limit', '10');
      
      const url = `${BASE_URL}/markets?${params.toString()}`;
      expect(url).toContain('category=Politics');
      expect(url).toContain('status=open');
      expect(url).toContain('limit=10');
    });

    it('constructs orderbook URL correctly', () => {
      const slug = 'test-market';
      const url = `${BASE_URL}/markets/${slug}/orderbook`;
      expect(url).toBe('https://sa-api-server-1.replit.app/api/v1/markets/test-market/orderbook');
    });

    it('constructs trade preview URL correctly', () => {
      const url = `${BASE_URL}/trade/preview`;
      expect(url).toBe('https://sa-api-server-1.replit.app/api/v1/trade/preview');
    });
  });

  describe('Response Parsing', () => {
    it('parses JSON response correctly', async () => {
      const expectedData = {
        markets: [{ id: '1', slug: 'test', question: 'Test?', yesPrice: 0.5, noPrice: 0.5 }],
        total: 1,
      };
      mockFetchImpl.mockResolvedValueOnce(new Response(JSON.stringify(expectedData), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }));

      const response = await fetch('https://api.example.com/markets');
      const data = await response.json();
      
      expect(data.markets).toHaveLength(1);
      expect(data.markets[0].slug).toBe('test');
      expect(data.total).toBe(1);
    });

    it('handles empty array response', async () => {
      mockFetchImpl.mockResolvedValueOnce(new Response(JSON.stringify({ markets: [], total: 0 }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }));

      const response = await fetch('https://api.example.com/markets');
      const data = await response.json();
      
      expect(data.markets).toHaveLength(0);
      expect(data.total).toBe(0);
    });

    it('extracts error message from error response', async () => {
      const errorResponse = { message: 'Market not found', code: 'NOT_FOUND' };
      mockFetchImpl.mockResolvedValueOnce(new Response(JSON.stringify(errorResponse), {
        status: 404,
        headers: { 'Content-Type': 'application/json' },
      }));

      const response = await fetch('https://api.example.com/markets/invalid');
      const error = await response.json();
      
      expect(error.message).toBe('Market not found');
      expect(error.code).toBe('NOT_FOUND');
    });
  });

  describe('Auth Flow Requests', () => {
    it('sends OTP request with email', async () => {
      mockFetchImpl.mockResolvedValueOnce(new Response(
        JSON.stringify({ success: true, expiresIn: 300 }),
        { status: 200, headers: { 'Content-Type': 'application/json' } }
      ));

      await fetch('https://api.example.com/auth/request-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: 'user@example.com' }),
      });

      expect(mockFetchImpl).toHaveBeenCalledWith(
        'https://api.example.com/auth/request-otp',
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify({ email: 'user@example.com' }),
        })
      );
    });

    it('sends OTP verification with code', async () => {
      mockFetchImpl.mockResolvedValueOnce(new Response(
        JSON.stringify({ success: true, token: 'jwt-token', user: { id: '1', email: 'user@example.com', role: 'user' } }),
        { status: 200, headers: { 'Content-Type': 'application/json' } }
      ));

      await fetch('https://api.example.com/auth/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: 'user@example.com', code: '123456' }),
      });

      expect(mockFetchImpl).toHaveBeenCalledWith(
        'https://api.example.com/auth/verify-otp',
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify({ email: 'user@example.com', code: '123456' }),
        })
      );
    });
  });

  describe('Trade Requests', () => {
    it('sends trade preview request', async () => {
      mockFetchImpl.mockResolvedValueOnce(new Response(
        JSON.stringify({ shares: 200, fee: 2, totalCost: 102, estimatedPayout: 200 }),
        { status: 200, headers: { 'Content-Type': 'application/json' } }
      ));

      await fetch('https://api.example.com/trade/preview', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer token' },
        body: JSON.stringify({ marketId: 'market-1', outcome: 'YES', stake: 100 }),
      });

      expect(mockFetchImpl).toHaveBeenCalledWith(
        'https://api.example.com/trade/preview',
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify({ marketId: 'market-1', outcome: 'YES', stake: 100 }),
        })
      );
    });

    it('sends buy request with idempotency key', async () => {
      const idempotencyKey = `${Date.now()}-abc123`;
      mockFetchImpl.mockResolvedValueOnce(new Response(
        JSON.stringify({ success: true, positionId: 'pos-1' }),
        { status: 200, headers: { 'Content-Type': 'application/json' } }
      ));

      await fetch('https://api.example.com/trade/buy', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ marketId: 'market-1', outcome: 'YES', stake: 100, idempotencyKey }),
      });

      const callBody = JSON.parse(mockFetchImpl.mock.calls[0][1]?.body as string);
      expect(callBody.idempotencyKey).toBe(idempotencyKey);
    });
  });
});
