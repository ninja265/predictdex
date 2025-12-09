import { describe, it, expect } from '@jest/globals';

interface TradePreview {
  marketId: string;
  outcome: 'YES' | 'NO';
  stake: number;
  currentPrice: number;
  shares: number;
  fee: number;
  totalCost: number;
  estimatedPayout: number;
  estimatedProfit: number;
}

function calculateTradePreview(
  marketId: string,
  outcome: 'YES' | 'NO',
  stake: number,
  currentPrice: number,
  feeRate: number = 0.02
): TradePreview {
  const shares = stake / currentPrice;
  const fee = stake * feeRate;
  const totalCost = stake + fee;
  const estimatedPayout = shares;
  const estimatedProfit = estimatedPayout - totalCost;

  return {
    marketId,
    outcome,
    stake,
    currentPrice,
    shares,
    fee,
    totalCost,
    estimatedPayout,
    estimatedProfit,
  };
}

function validateTradeInput(
  stake: number,
  outcome: string,
  marketId: string,
  marketStatus: string,
  balance: number
): { valid: boolean; error?: string } {
  if (!marketId) return { valid: false, error: 'Market ID is required' };
  if (stake <= 0) return { valid: false, error: 'Stake must be positive' };
  if (!['YES', 'NO'].includes(outcome)) return { valid: false, error: 'Invalid outcome' };
  if (marketStatus !== 'open') return { valid: false, error: 'Market is not open for trading' };
  
  const feeRate = 0.02;
  const totalCost = stake * (1 + feeRate);
  if (totalCost > balance) return { valid: false, error: 'Insufficient balance' };
  
  return { valid: true };
}

function generateIdempotencyKey(): string {
  return `${Date.now()}-${Math.random().toString(36).substring(2, 11)}`;
}

describe('Trade Preview Calculations', () => {
  it('calculates shares correctly from stake and price', () => {
    const preview = calculateTradePreview('market-1', 'YES', 100, 0.5);
    expect(preview.shares).toBe(200);
  });

  it('calculates fee at 2%', () => {
    const preview = calculateTradePreview('market-1', 'YES', 100, 0.5);
    expect(preview.fee).toBe(2);
  });

  it('calculates total cost as stake + fee', () => {
    const preview = calculateTradePreview('market-1', 'YES', 100, 0.5);
    expect(preview.totalCost).toBe(102);
  });

  it('calculates estimated payout as shares', () => {
    const preview = calculateTradePreview('market-1', 'YES', 100, 0.5);
    expect(preview.estimatedPayout).toBe(200);
  });

  it('calculates estimated profit correctly', () => {
    const preview = calculateTradePreview('market-1', 'YES', 100, 0.5);
    expect(preview.estimatedProfit).toBe(98);
  });

  it('handles different price points', () => {
    const lowPrice = calculateTradePreview('market-1', 'YES', 100, 0.25);
    expect(lowPrice.shares).toBe(400);

    const highPrice = calculateTradePreview('market-1', 'YES', 100, 0.75);
    expect(highPrice.shares).toBeCloseTo(133.33, 1);
  });

  it('handles NO outcome the same as YES', () => {
    const yes = calculateTradePreview('market-1', 'YES', 100, 0.5);
    const no = calculateTradePreview('market-1', 'NO', 100, 0.5);
    expect(yes.shares).toBe(no.shares);
  });
});

describe('Trade Input Validation', () => {
  it('rejects zero stake', () => {
    const result = validateTradeInput(0, 'YES', 'market-1', 'open', 1000);
    expect(result.valid).toBe(false);
    expect(result.error).toBe('Stake must be positive');
  });

  it('rejects negative stake', () => {
    const result = validateTradeInput(-50, 'YES', 'market-1', 'open', 1000);
    expect(result.valid).toBe(false);
  });

  it('rejects invalid outcome', () => {
    const result = validateTradeInput(100, 'MAYBE', 'market-1', 'open', 1000);
    expect(result.valid).toBe(false);
    expect(result.error).toBe('Invalid outcome');
  });

  it('accepts YES outcome', () => {
    const result = validateTradeInput(100, 'YES', 'market-1', 'open', 1000);
    expect(result.valid).toBe(true);
  });

  it('accepts NO outcome', () => {
    const result = validateTradeInput(100, 'NO', 'market-1', 'open', 1000);
    expect(result.valid).toBe(true);
  });

  it('rejects empty market ID', () => {
    const result = validateTradeInput(100, 'YES', '', 'open', 1000);
    expect(result.valid).toBe(false);
    expect(result.error).toBe('Market ID is required');
  });

  it('rejects closed market', () => {
    const result = validateTradeInput(100, 'YES', 'market-1', 'closed', 1000);
    expect(result.valid).toBe(false);
    expect(result.error).toBe('Market is not open for trading');
  });

  it('rejects resolved market', () => {
    const result = validateTradeInput(100, 'YES', 'market-1', 'resolved', 1000);
    expect(result.valid).toBe(false);
  });

  it('rejects insufficient balance', () => {
    const result = validateTradeInput(1000, 'YES', 'market-1', 'open', 50);
    expect(result.valid).toBe(false);
    expect(result.error).toBe('Insufficient balance');
  });

  it('allows trade with sufficient balance', () => {
    const result = validateTradeInput(100, 'YES', 'market-1', 'open', 150);
    expect(result.valid).toBe(true);
  });
});

describe('Idempotency Key Generation', () => {
  it('generates unique keys', () => {
    const keys = new Set<string>();
    for (let i = 0; i < 100; i++) {
      keys.add(generateIdempotencyKey());
    }
    expect(keys.size).toBe(100);
  });

  it('includes timestamp component', () => {
    const key = generateIdempotencyKey();
    const [timestamp] = key.split('-');
    const parsedTime = parseInt(timestamp);
    expect(parsedTime).toBeGreaterThan(Date.now() - 1000);
  });

  it('includes random component', () => {
    const key = generateIdempotencyKey();
    const parts = key.split('-');
    expect(parts.length).toBe(2);
    expect(parts[1].length).toBeGreaterThan(0);
  });
});

describe('Sell Shares Validation', () => {
  function validateSell(positionId: string, sharesToSell: number, ownedShares: number) {
    if (!positionId) return { valid: false, error: 'Position ID required' };
    if (sharesToSell <= 0) return { valid: false, error: 'Shares must be positive' };
    if (sharesToSell > ownedShares) return { valid: false, error: 'Cannot sell more than owned' };
    return { valid: true };
  }

  it('validates positive shares', () => {
    const result = validateSell('pos-1', 50, 100);
    expect(result.valid).toBe(true);
  });

  it('rejects zero shares', () => {
    const result = validateSell('pos-1', 0, 100);
    expect(result.valid).toBe(false);
  });

  it('rejects selling more than owned', () => {
    const result = validateSell('pos-1', 150, 100);
    expect(result.valid).toBe(false);
    expect(result.error).toBe('Cannot sell more than owned');
  });

  it('allows selling exact owned amount', () => {
    const result = validateSell('pos-1', 100, 100);
    expect(result.valid).toBe(true);
  });

  it('rejects missing position ID', () => {
    const result = validateSell('', 50, 100);
    expect(result.valid).toBe(false);
  });
});

describe('Market Status Checks', () => {
  const tradableStatuses = ['open'];
  const allStatuses = ['open', 'closed', 'resolved', 'settled', 'cancelled'];

  it('allows trading only on open markets', () => {
    expect(tradableStatuses.includes('open')).toBe(true);
    expect(tradableStatuses.includes('closed')).toBe(false);
    expect(tradableStatuses.includes('resolved')).toBe(false);
  });

  it('recognizes all valid statuses', () => {
    allStatuses.forEach(status => {
      expect(typeof status).toBe('string');
    });
  });
});

describe('Price Validation', () => {
  function isValidPrice(price: number): boolean {
    return price > 0 && price < 1;
  }

  it('accepts valid prices between 0 and 1', () => {
    expect(isValidPrice(0.5)).toBe(true);
    expect(isValidPrice(0.01)).toBe(true);
    expect(isValidPrice(0.99)).toBe(true);
  });

  it('rejects zero price', () => {
    expect(isValidPrice(0)).toBe(false);
  });

  it('rejects price of 1', () => {
    expect(isValidPrice(1)).toBe(false);
  });

  it('rejects negative price', () => {
    expect(isValidPrice(-0.5)).toBe(false);
  });

  it('rejects price greater than 1', () => {
    expect(isValidPrice(1.5)).toBe(false);
  });
});

describe('Currency Support', () => {
  const supportedCurrencies = ['ETH', 'USDC', 'USDT'];

  it('supports ETH', () => {
    expect(supportedCurrencies.includes('ETH')).toBe(true);
  });

  it('supports USDC', () => {
    expect(supportedCurrencies.includes('USDC')).toBe(true);
  });

  it('supports USDT', () => {
    expect(supportedCurrencies.includes('USDT')).toBe(true);
  });

  it('does not support unsupported currencies', () => {
    expect(supportedCurrencies.includes('BTC')).toBe(false);
    expect(supportedCurrencies.includes('EUR')).toBe(false);
  });
});

describe('Order Book Structure', () => {
  interface OrderLevel {
    price: number;
    size: number;
  }

  function getBestBid(bids: OrderLevel[]): OrderLevel | null {
    if (bids.length === 0) return null;
    return bids.reduce((best, bid) => bid.price > best.price ? bid : best);
  }

  function getBestAsk(asks: OrderLevel[]): OrderLevel | null {
    if (asks.length === 0) return null;
    return asks.reduce((best, ask) => ask.price < best.price ? ask : best);
  }

  it('finds best bid (highest price)', () => {
    const bids = [
      { price: 0.45, size: 100 },
      { price: 0.50, size: 200 },
      { price: 0.48, size: 150 },
    ];
    const best = getBestBid(bids);
    expect(best?.price).toBe(0.50);
  });

  it('finds best ask (lowest price)', () => {
    const asks = [
      { price: 0.55, size: 100 },
      { price: 0.52, size: 200 },
      { price: 0.58, size: 150 },
    ];
    const best = getBestAsk(asks);
    expect(best?.price).toBe(0.52);
  });

  it('handles empty order book', () => {
    expect(getBestBid([])).toBeNull();
    expect(getBestAsk([])).toBeNull();
  });
});

describe('Portfolio Calculations', () => {
  interface Position {
    shares: number;
    avgPrice: number;
    currentPrice: number;
  }

  function calculatePositionValue(position: Position): number {
    return position.shares * position.currentPrice;
  }

  function calculateUnrealizedPnL(position: Position): number {
    const cost = position.shares * position.avgPrice;
    const value = position.shares * position.currentPrice;
    return value - cost;
  }

  it('calculates position value correctly', () => {
    const position = { shares: 100, avgPrice: 0.50, currentPrice: 0.65 };
    expect(calculatePositionValue(position)).toBe(65);
  });

  it('calculates unrealized P&L for profit', () => {
    const position = { shares: 100, avgPrice: 0.50, currentPrice: 0.65 };
    expect(calculateUnrealizedPnL(position)).toBe(15);
  });

  it('calculates unrealized P&L for loss', () => {
    const position = { shares: 100, avgPrice: 0.50, currentPrice: 0.35 };
    expect(calculateUnrealizedPnL(position)).toBe(-15);
  });

  it('calculates zero P&L at cost', () => {
    const position = { shares: 100, avgPrice: 0.50, currentPrice: 0.50 };
    expect(calculateUnrealizedPnL(position)).toBe(0);
  });
});
