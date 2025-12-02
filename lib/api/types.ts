export type MarketStatus = 'draft' | 'open' | 'closed' | 'resolved';
export type MarketCategory = 'Politics' | 'Civics' | 'Sports' | 'Culture';
export type CurrencyCode = 'ZAR' | 'NGN' | 'KES' | 'GHS' | 'EGP' | 'TZS' | 'UGX' | 'ZMW' | 'XOF' | 'XAF' | 'MAD' | 'ETH' | 'USDC' | 'USDT';

export interface Market {
  id: string;
  slug: string;
  question: string;
  description?: string;
  category: MarketCategory;
  imageUrl: string | null;
  status: MarketStatus;
  yesPrice: number;
  noPrice: number;
  volume: number;
  currency: CurrencyCode;
  symbol: string;
  closesAt: string;
  createdAt?: string;
  resolvedAt?: string | null;
  winningOutcome?: 'YES' | 'NO' | null;
}

export interface MarketsResponse {
  markets: Market[];
  total: number;
  limit: number;
  offset: number;
}

export interface OrderBookLevel {
  price: number;
  shares: number;
}

export interface OrderBookSide {
  bids: OrderBookLevel[];
  asks: OrderBookLevel[];
}

export interface OrderBookResponse {
  market: {
    id: string;
    slug: string;
    question: string;
    yesPrice: number;
    noPrice: number;
  };
  orderbook: {
    yes: OrderBookSide;
    no: OrderBookSide;
  };
}

export interface Trade {
  id: string;
  outcome: 'YES' | 'NO';
  shares: number;
  price: number;
  stake: number;
  fee: number;
  timestamp: string;
}

export interface TradesResponse {
  trades: Trade[];
  currency: CurrencyCode;
  symbol: string;
}

export interface User {
  id: string;
  email?: string;
  name?: string | null;
  walletAddress?: string;
  role: 'user' | 'admin';
  balance?: number;
  kycStatus?: string;
  defaultCurrency?: CurrencyCode;
  createdAt?: string;
  lastLoginAt?: string;
}

export interface AuthResponse {
  success: boolean;
  token: string;
  expiresAt: string;
  user: User;
}

export interface OtpRequestResponse {
  success: boolean;
  message: string;
  expiresIn: number;
}

export interface SiweChallenge {
  message: string;
  nonce: string;
  expiresAt: string;
}

export interface TradePreview {
  marketId: string;
  outcome: 'YES' | 'NO';
  stake: number;
  currency: CurrencyCode;
  symbol: string;
  currentPrice: number;
  shares: number;
  fee: number;
  totalCost: number;
  estimatedPayout: number;
  estimatedProfit: number;
  impliedOdds: number;
}

export interface TradeResult {
  success: boolean;
  trade: {
    id: string;
    marketId: string;
    outcome: 'YES' | 'NO';
    shares: number;
    avgPrice: number;
    stake: number;
    fee: number;
    totalCost: number;
    currency: CurrencyCode;
    symbol: string;
    timestamp: string;
  };
  position: Position;
  newBalance: number;
}

export interface Position {
  id: string;
  marketId: string;
  marketSlug?: string;
  marketQuestion?: string;
  outcome: 'YES' | 'NO';
  shares: number;
  stake: number;
  price: number;
  avgPrice?: number;
  status: 'open' | 'won' | 'lost' | 'sold';
  currency: CurrencyCode;
  symbol?: string;
  timestamp?: string;
  payout?: number;
  profit?: number;
  settledAt?: string;
}

export interface PortfolioRow {
  position: Position;
  markPrice: number;
  markPayout: number;
  markProfit: number;
}

export interface PortfolioSummary {
  currency: CurrencyCode;
  symbol: string;
  totalStake: number;
  totalPayout: number;
  totalProfit: number;
}

export interface PortfolioResponse {
  rows: PortfolioRow[];
  summaryByCurrency: PortfolioSummary[];
}

export interface PositionHistoryResponse {
  positions: Position[];
  total: number;
}

export interface WalletBalance {
  currency: CurrencyCode;
  symbol: string;
  available: number;
  reserved: number;
  total: number;
}

export interface WalletTransaction {
  id: string;
  type: 'deposit' | 'withdrawal' | 'trade' | 'trade_payout' | 'fee';
  amount: number;
  currency: CurrencyCode;
  symbol: string;
  description: string;
  status?: 'pending' | 'completed' | 'failed';
  createdAt: string;
}

export interface Currency {
  code: CurrencyCode;
  name: string;
  symbol: string;
}

export interface CryptoToken {
  token: string;
  name: string;
  decimals: number;
  contractAddress: string | null;
}

export interface DepositAddress {
  address: string;
  token: string;
  network: string;
  minConfirmations: number;
  isTestnet: boolean;
  note: string;
}

export interface PendingDeposit {
  id: string;
  txHash: string;
  token: string;
  amount: number;
  confirmations: number;
  requiredConfirmations: number;
  status: 'pending' | 'credited';
  createdAt: string;
}

export interface UserProfile {
  id: string;
  email?: string;
  name: string | null;
  role: 'user' | 'admin';
  kycStatus: string;
  defaultCurrency: CurrencyCode;
  createdAt: string;
  lastLoginAt: string;
  balances: WalletBalance[];
  riskSettings: RiskSetting[];
}

export interface RiskSetting {
  currency: CurrencyCode;
  symbol: string;
  maxStake: number;
  maxDailyVolume: number;
}

export interface ApiError {
  error: string;
  message: string;
  statusCode: number;
}
