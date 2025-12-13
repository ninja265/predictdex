import type {
  Market,
  OrderBookResponse,
  OrderBookLevel,
  TradePreview,
  AuthResponse,
} from "@/lib/api/types";

describe("API Types", () => {
  describe("Market type", () => {
    it("should have required fields", () => {
      const market: Market = {
        id: "123",
        slug: "test-market",
        question: "Test question?",
        category: "Politics",
        imageUrl: null,
        status: "open",
        yesPrice: 0.5,
        noPrice: 0.5,
        volume: 1000,
        currency: "USDC",
        symbol: "$",
        closesAt: "2025-12-31T00:00:00Z",
      };

      expect(market.id).toBe("123");
      expect(market.status).toBe("open");
      expect(market.yesPrice + market.noPrice).toBe(1);
    });
  });

  describe("OrderBookResponse type", () => {
    it("should match API response structure", () => {
      const orderbook: OrderBookResponse = {
        marketId: "123",
        currency: "USDC",
        symbol: "$",
        yesBids: [{ price: 0.45, size: 100 }],
        noAsks: [{ price: 0.55, size: 100 }],
        updatedAt: "2025-12-09T00:00:00Z",
      };

      expect(orderbook.yesBids[0].price).toBe(0.45);
      expect(orderbook.noAsks[0].size).toBe(100);
    });
  });

  describe("OrderBookLevel type", () => {
    it("should have price and size", () => {
      const level: OrderBookLevel = {
        price: 0.5,
        size: 1000,
      };

      expect(level.price).toBe(0.5);
      expect(level.size).toBe(1000);
    });
  });

  describe("TradePreview type", () => {
    it("should have all required trade preview fields", () => {
      const preview: TradePreview = {
        marketId: "123",
        outcome: "YES",
        stake: 100,
        currency: "USDC",
        symbol: "$",
        currentPrice: 0.5,
        shares: 200,
        fee: 2,
        totalCost: 102,
        estimatedPayout: 200,
        estimatedProfit: 98,
      };

      expect(preview.shares).toBe(200);
      expect(preview.estimatedProfit).toBe(98);
    });
  });

  describe("AuthResponse type", () => {
    it("should have success, token, and user", () => {
      const auth: AuthResponse = {
        success: true,
        token: "jwt-token",
        expiresAt: "2025-12-10T00:00:00Z",
        user: {
          id: "user-123",
          email: "test@example.com",
          role: "user",
        },
      };

      expect(auth.success).toBe(true);
      expect(auth.user.role).toBe("user");
    });
  });
});
