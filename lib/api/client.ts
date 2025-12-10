import type {
  Market,
  MarketsResponse,
  OrderBookResponse,
  TradesResponse,
  AuthResponse,
  OtpRequestResponse,
  SiweChallenge,
  TradePreview,
  TradeResult,
  PortfolioResponse,
  PositionHistoryResponse,
  WalletBalance,
  WalletTransaction,
  Currency,
  CryptoToken,
  DepositAddress,
  PendingDeposit,
  UserProfile,
  User,
  MarketCategory,
  MarketStatus,
  CurrencyCode,
  Country,
  CountriesResponse,
  AdminMarketCreate,
  AdminMarketUpdate,
  AdminPriceUpdate,
  ResolutionQueue,
  SettlementStats,
  SettlementPreview,
  AdminDeposit,
  AdminDepositStats,
  AdminWithdrawal,
} from './types';

const API_BASE_URL = 'https://sa-api-server-1.replit.app/api/v1';

class ApiClient {
  private token: string | null = null;

  constructor() {
    if (typeof window !== 'undefined') {
      this.token = localStorage.getItem('auth_token');
    }
  }

  setToken(token: string | null) {
    this.token = token;
    if (typeof window !== 'undefined') {
      if (token) {
        localStorage.setItem('auth_token', token);
      } else {
        localStorage.removeItem('auth_token');
      }
    }
  }

  getToken(): string | null {
    return this.token;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      ...options.headers,
    };

    if (this.token) {
      (headers as Record<string, string>)['Authorization'] = `Bearer ${this.token}`;
    }

    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers,
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({
        message: 'An unexpected error occurred',
      }));
      throw new Error(error.message || `HTTP error ${response.status}`);
    }

    if (response.status === 204) {
      return { success: true } as T;
    }

    const contentType = response.headers.get('content-type');
    if (!contentType?.includes('application/json')) {
      return { success: true } as T;
    }

    const text = await response.text();
    if (!text || text.trim() === '') {
      return { success: true } as T;
    }

    try {
      return JSON.parse(text) as T;
    } catch {
      return { success: true } as T;
    }
  }

  async requestOtp(email: string): Promise<OtpRequestResponse> {
    return this.request('/auth/request-otp', {
      method: 'POST',
      body: JSON.stringify({ email }),
    });
  }

  async verifyOtp(email: string, code: string): Promise<AuthResponse> {
    const response = await this.request<AuthResponse>('/auth/verify-otp', {
      method: 'POST',
      body: JSON.stringify({ email, code }),
    });
    this.setToken(response.token);
    return response;
  }

  async getWalletChallenge(address: string): Promise<SiweChallenge> {
    return this.request('/auth/wallet/challenge', {
      method: 'POST',
      body: JSON.stringify({ walletAddress: address }),
    });
  }

  async verifyWalletSignature(message: string, signature: string): Promise<AuthResponse> {
    const response = await this.request<AuthResponse>('/auth/wallet/verify', {
      method: 'POST',
      body: JSON.stringify({ message, signature }),
    });
    this.setToken(response.token);
    return response;
  }

  async getCurrentUser(): Promise<{ user: User }> {
    return this.request('/auth/me');
  }

  async logout(): Promise<{ success: boolean }> {
    try {
      await this.request<{ success: boolean }>('/auth/logout', {
        method: 'POST',
      });
    } catch {
    } finally {
      this.setToken(null);
    }
    return { success: true };
  }

  async getCountries(): Promise<CountriesResponse> {
    return this.request('/markets/countries');
  }

  async getMarkets(params?: {
    category?: MarketCategory;
    status?: MarketStatus;
    currency?: CurrencyCode;
    country?: string;
    limit?: number;
    offset?: number;
  }): Promise<MarketsResponse> {
    const searchParams = new URLSearchParams();
    if (params?.category) searchParams.set('category', params.category);
    if (params?.status) searchParams.set('status', params.status);
    if (params?.currency) searchParams.set('currency', params.currency);
    if (params?.country) searchParams.set('country', params.country);
    if (params?.limit !== undefined) searchParams.set('limit', params.limit.toString());
    if (params?.offset !== undefined) searchParams.set('offset', params.offset.toString());

    const query = searchParams.toString();
    return this.request(`/markets${query ? `?${query}` : ''}`);
  }

  async getMarket(slug: string): Promise<Market> {
    return this.request(`/markets/${slug}`);
  }

  async getOrderBook(slug: string): Promise<OrderBookResponse> {
    return this.request(`/markets/${slug}/orderbook`);
  }

  async getMarketTrades(slug: string, limit = 50): Promise<TradesResponse> {
    return this.request(`/markets/${slug}/trades?limit=${limit}`);
  }

  async previewTrade(marketId: string, outcome: 'YES' | 'NO', stake: number): Promise<TradePreview> {
    return this.request('/trade/preview', {
      method: 'POST',
      body: JSON.stringify({ marketId, outcome, stake }),
    });
  }

  async buyShares(
    marketId: string,
    outcome: 'YES' | 'NO',
    stake: number,
    idempotencyKey: string
  ): Promise<TradeResult> {
    return this.request('/trade/buy', {
      method: 'POST',
      body: JSON.stringify({ marketId, outcome, stake, idempotencyKey }),
    });
  }

  async sellShares(positionId: string, sharesToSell: number): Promise<TradeResult> {
    return this.request('/trade/sell', {
      method: 'POST',
      body: JSON.stringify({ positionId, sharesToSell }),
    });
  }

  async getPortfolio(currency?: CurrencyCode): Promise<PortfolioResponse> {
    const query = currency ? `?currency=${currency}` : '';
    return this.request(`/portfolio${query}`);
  }

  async getPositionHistory(params?: {
    currency?: CurrencyCode;
    status?: 'won' | 'lost' | 'sold' | 'all';
    limit?: number;
    offset?: number;
  }): Promise<PositionHistoryResponse> {
    const searchParams = new URLSearchParams();
    if (params?.currency) searchParams.set('currency', params.currency);
    if (params?.status) searchParams.set('status', params.status);
    if (params?.limit) searchParams.set('limit', params.limit.toString());
    if (params?.offset) searchParams.set('offset', params.offset.toString());

    const query = searchParams.toString();
    return this.request(`/portfolio/history${query ? `?${query}` : ''}`);
  }

  async getCurrencies(): Promise<Currency[]> {
    return this.request('/wallet/currencies');
  }

  async getBalance(currency: CurrencyCode): Promise<WalletBalance> {
    return this.request(`/wallet/balance?currency=${currency}`);
  }

  async getAllBalances(): Promise<WalletBalance[]> {
    return this.request('/wallet/balances');
  }

  async getTransactions(params?: {
    currency?: CurrencyCode;
    type?: 'deposit' | 'withdrawal' | 'trade' | 'trade_payout' | 'fee';
    limit?: number;
    offset?: number;
  }): Promise<{ transactions: WalletTransaction[]; total: number }> {
    const searchParams = new URLSearchParams();
    if (params?.currency) searchParams.set('currency', params.currency);
    if (params?.type) searchParams.set('type', params.type);
    if (params?.limit) searchParams.set('limit', params.limit.toString());
    if (params?.offset) searchParams.set('offset', params.offset.toString());

    const query = searchParams.toString();
    return this.request(`/wallet/transactions${query ? `?${query}` : ''}`);
  }

  async getCryptoTokens(): Promise<CryptoToken[]> {
    return this.request('/crypto/tokens');
  }

  async getDepositAddress(token: string): Promise<DepositAddress> {
    return this.request(`/crypto/deposit-address/${token}`);
  }

  async getAllDepositAddresses(): Promise<Record<string, { address: string; network: string }>> {
    const response = await this.request<any>('/crypto/deposit-addresses');
    
    // If response has addresses array (new API format from docs)
    if (response.addresses && Array.isArray(response.addresses)) {
      const result: Record<string, { address: string; network: string }> = {};
      response.addresses.forEach((addr: { token: string; address: string }) => {
        result[addr.token] = { 
          address: addr.address, 
          network: response.network || 'Ethereum Sepolia Testnet' 
        };
      });
      return result;
    }
    
    // If response is already a Record with token keys (ETH, USDC, USDT)
    // This was the original format the frontend expected
    const result: Record<string, { address: string; network: string }> = {};
    for (const key of Object.keys(response)) {
      if (['ETH', 'USDC', 'USDT', 'eth', 'usdc', 'usdt'].includes(key)) {
        const val = response[key];
        if (val && typeof val === 'object' && val.address) {
          result[key.toUpperCase()] = {
            address: val.address,
            network: val.network || 'Ethereum Sepolia Testnet'
          };
        }
      }
    }
    
    // If we got results, return them
    if (Object.keys(result).length > 0) {
      return result;
    }
    
    // Fallback: return the response as-is if it looks like the expected format
    return response as Record<string, { address: string; network: string }>;
  }

  async getPendingDeposits(): Promise<PendingDeposit[]> {
    const response = await this.request<any>('/crypto/deposits/pending');
    
    // If response has deposits array
    if (response.deposits && Array.isArray(response.deposits)) {
      return response.deposits;
    }
    
    // If response is already an array
    if (Array.isArray(response)) {
      return response;
    }
    
    return [];
  }

  async getDepositHistory(params?: {
    limit?: number;
    offset?: number;
  }): Promise<{ deposits: PendingDeposit[]; total: number }> {
    const searchParams = new URLSearchParams();
    if (params?.limit) searchParams.set('limit', params.limit.toString());
    if (params?.offset) searchParams.set('offset', params.offset.toString());

    const query = searchParams.toString();
    return this.request(`/crypto/deposits/history${query ? `?${query}` : ''}`);
  }

  async getUserProfile(): Promise<UserProfile> {
    return this.request('/users/me');
  }

  async updateProfile(data: { name?: string; defaultCurrency?: CurrencyCode }): Promise<UserProfile> {
    return this.request('/users/me', {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }

  async updateRiskSettings(data: {
    currency: CurrencyCode;
    maxStake: number;
    maxDailyVolume: number;
  }): Promise<void> {
    return this.request('/users/me/risk-settings', {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }

  async getAdminMarkets(params?: {
    status?: MarketStatus;
    category?: MarketCategory;
    limit?: number;
    offset?: number;
  }): Promise<MarketsResponse> {
    const searchParams = new URLSearchParams();
    if (params?.status) searchParams.set('status', params.status);
    if (params?.category) searchParams.set('category', params.category);
    if (params?.limit !== undefined) searchParams.set('limit', params.limit.toString());
    if (params?.offset !== undefined) searchParams.set('offset', params.offset.toString());
    const query = searchParams.toString();
    return this.request(`/admin/markets${query ? `?${query}` : ''}`);
  }

  async createMarket(data: AdminMarketCreate): Promise<Market> {
    return this.request('/admin/markets', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateMarket(id: string, data: AdminMarketUpdate): Promise<Market> {
    return this.request(`/admin/markets/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }

  async updateMarketPrices(id: string, data: AdminPriceUpdate): Promise<Market> {
    return this.request(`/admin/markets/${id}/prices`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }

  async resolveMarket(id: string, outcome: 'YES' | 'NO', notes?: string): Promise<{ success: boolean }> {
    return this.request(`/admin/markets/${id}/resolve`, {
      method: 'POST',
      body: JSON.stringify({ outcome, notes }),
    });
  }

  async getResolutionQueue(): Promise<ResolutionQueue> {
    return this.request('/admin/settlement/queue');
  }

  async getSettlementStats(): Promise<SettlementStats> {
    return this.request('/admin/settlement/stats');
  }

  async getSettlementPreview(id: string, outcome: 'YES' | 'NO'): Promise<SettlementPreview> {
    return this.request(`/admin/settlement/preview/${id}?outcome=${outcome}`);
  }

  async settleMarket(id: string, outcome: 'YES' | 'NO', notes?: string): Promise<{ success: boolean }> {
    return this.request(`/admin/settlement/resolve/${id}`, {
      method: 'POST',
      body: JSON.stringify({ outcome, notes }),
    });
  }

  async triggerSettlementCheck(): Promise<{ success: boolean }> {
    return this.request('/admin/settlement/trigger-check', {
      method: 'POST',
    });
  }

  async getAdminDeposits(params?: {
    status?: 'pending' | 'credited' | 'failed';
    token?: string;
    limit?: number;
    offset?: number;
  }): Promise<{ deposits: AdminDeposit[]; total: number }> {
    const searchParams = new URLSearchParams();
    if (params?.status) searchParams.set('status', params.status);
    if (params?.token) searchParams.set('token', params.token);
    if (params?.limit !== undefined) searchParams.set('limit', params.limit.toString());
    if (params?.offset !== undefined) searchParams.set('offset', params.offset.toString());
    const query = searchParams.toString();
    return this.request(`/admin/crypto/deposits${query ? `?${query}` : ''}`);
  }

  async getAdminDepositStats(): Promise<AdminDepositStats> {
    return this.request('/admin/crypto/deposits/stats');
  }

  async creditDeposit(id: string): Promise<{ success: boolean }> {
    return this.request(`/admin/crypto/deposits/${id}/credit`, {
      method: 'POST',
    });
  }

  async getAdminWithdrawals(params?: {
    status?: 'pending' | 'approved' | 'rejected' | 'completed';
    limit?: number;
    offset?: number;
  }): Promise<{ withdrawals: AdminWithdrawal[]; total: number }> {
    const searchParams = new URLSearchParams();
    if (params?.status) searchParams.set('status', params.status);
    if (params?.limit !== undefined) searchParams.set('limit', params.limit.toString());
    if (params?.offset !== undefined) searchParams.set('offset', params.offset.toString());
    const query = searchParams.toString();
    return this.request(`/admin/crypto/withdrawals${query ? `?${query}` : ''}`);
  }

  async approveWithdrawal(id: string, notes?: string): Promise<{ success: boolean }> {
    return this.request(`/admin/crypto/withdrawals/${id}/approve`, {
      method: 'POST',
      body: JSON.stringify({ notes }),
    });
  }

  async rejectWithdrawal(id: string, reason: string): Promise<{ success: boolean }> {
    return this.request(`/admin/crypto/withdrawals/${id}/reject`, {
      method: 'POST',
      body: JSON.stringify({ reason }),
    });
  }

  async completeWithdrawal(id: string, txHash: string): Promise<{ success: boolean }> {
    return this.request(`/admin/crypto/withdrawals/${id}/complete`, {
      method: 'POST',
      body: JSON.stringify({ txHash }),
    });
  }
}

export const apiClient = new ApiClient();
export default apiClient;
