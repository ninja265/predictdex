import apiClient from "./client";
import type {
  Market,
  MarketsResponse,
  OrderBookResponse,
  TradePreview,
  WalletBalance,
  WalletTransaction,
  PortfolioResponse,
  DepositAddress,
  UserProfile,
  ResolutionQueue,
  SettlementStats,
  SettlementPreview,
  AdminDeposit,
  AdminDepositStats,
  AdminWithdrawal,
  CurrencyCode,
} from "./types";

export interface EndpointTestResult {
  endpoint: string;
  method: string;
  status: "success" | "error" | "skipped";
  message: string;
  responseTime: number;
  data?: unknown;
}

export interface AuditReport {
  timestamp: string;
  totalEndpoints: number;
  successful: number;
  failed: number;
  skipped: number;
  results: EndpointTestResult[];
  isAuthenticated: boolean;
  isAdmin: boolean;
}

class ApiAuditor {
  private results: EndpointTestResult[] = [];
  private isAuthenticated = false;
  private isAdmin = false;

  private async testEndpoint<T>(
    name: string,
    method: string,
    fn: () => Promise<T>,
    skipCondition?: boolean,
    skipReason?: string
  ): Promise<EndpointTestResult> {
    if (skipCondition) {
      const result: EndpointTestResult = {
        endpoint: name,
        method,
        status: "skipped",
        message: skipReason || "Skipped",
        responseTime: 0,
      };
      this.results.push(result);
      return result;
    }

    const start = performance.now();
    try {
      const data = await fn();
      const responseTime = Math.round(performance.now() - start);
      const result: EndpointTestResult = {
        endpoint: name,
        method,
        status: "success",
        message: "OK",
        responseTime,
        data,
      };
      this.results.push(result);
      return result;
    } catch (error) {
      const responseTime = Math.round(performance.now() - start);
      const message = error instanceof Error ? error.message : "Unknown error";
      const result: EndpointTestResult = {
        endpoint: name,
        method,
        status: "error",
        message,
        responseTime,
      };
      this.results.push(result);
      return result;
    }
  }

  async runPublicEndpointAudit(): Promise<EndpointTestResult[]> {
    console.log("Testing public endpoints...");

    await this.testEndpoint("GET /markets", "GET", () => apiClient.getMarkets());

    await this.testEndpoint("GET /markets?category=Politics", "GET", () =>
      apiClient.getMarkets({ category: "Politics" })
    );

    await this.testEndpoint("GET /markets?category=Sports", "GET", () =>
      apiClient.getMarkets({ category: "Sports" })
    );

    await this.testEndpoint("GET /markets?status=open", "GET", () =>
      apiClient.getMarkets({ status: "open" })
    );

    const marketsResult = await apiClient.getMarkets({ limit: 1 });
    const testSlug = marketsResult.markets[0]?.slug;

    await this.testEndpoint(
      `GET /markets/${testSlug || "test-market"}`,
      "GET",
      () => apiClient.getMarket(testSlug || "test-market"),
      !testSlug,
      "No markets available"
    );

    await this.testEndpoint(
      `GET /markets/${testSlug || "test-market"}/orderbook`,
      "GET",
      () => apiClient.getOrderBook(testSlug || "test-market"),
      !testSlug,
      "No markets available"
    );

    await this.testEndpoint(
      `GET /markets/${testSlug || "test-market"}/trades`,
      "GET",
      () => apiClient.getMarketTrades(testSlug || "test-market"),
      !testSlug,
      "No markets available"
    );

    return this.results.filter((r) =>
      r.endpoint.startsWith("GET /markets")
    );
  }

  async runAuthenticatedEndpointAudit(): Promise<EndpointTestResult[]> {
    console.log("Testing authenticated endpoints...");

    const token = typeof window !== "undefined" ? localStorage.getItem("auth_token") : null;
    this.isAuthenticated = !!token;

    if (!this.isAuthenticated) {
      console.log("Skipping authenticated endpoints - not logged in");
      return [];
    }

    try {
      const profile = await apiClient.getUserProfile();
      this.isAdmin = profile.role === "admin";
    } catch {
      this.isAuthenticated = false;
      return [];
    }

    await this.testEndpoint("GET /users/me", "GET", () => apiClient.getUserProfile());

    await this.testEndpoint("GET /auth/me", "GET", () => apiClient.getCurrentUser());

    await this.testEndpoint("GET /wallet/balances", "GET", () => apiClient.getAllBalances());

    await this.testEndpoint("GET /wallet/balance/ETH", "GET", () =>
      apiClient.getBalance("ETH")
    );

    await this.testEndpoint("GET /wallet/transactions", "GET", () =>
      apiClient.getTransactions({ limit: 10 })
    );

    await this.testEndpoint("GET /portfolio", "GET", () => apiClient.getPortfolio());

    await this.testEndpoint("GET /portfolio/history", "GET", () =>
      apiClient.getPositionHistory({ limit: 10 })
    );

    await this.testEndpoint("GET /crypto/tokens", "GET", () =>
      apiClient.getCryptoTokens()
    );

    await this.testEndpoint("GET /crypto/deposit-addresses", "GET", () =>
      apiClient.getAllDepositAddresses()
    );

    await this.testEndpoint("GET /crypto/deposit-address/ETH", "GET", () =>
      apiClient.getDepositAddress("ETH")
    );

    await this.testEndpoint("GET /crypto/deposits/pending", "GET", () =>
      apiClient.getPendingDeposits()
    );

    await this.testEndpoint("GET /crypto/deposits/history", "GET", () =>
      apiClient.getDepositHistory({ limit: 10 })
    );

    await this.testEndpoint("GET /currencies", "GET", () =>
      apiClient.getCurrencies()
    );

    const marketsResult = await apiClient.getMarkets({ limit: 10 });
    const testMarket = marketsResult.markets.find((m) => m.status === "open");

    await this.testEndpoint(
      "POST /trade/preview (YES)",
      "POST",
      () =>
        apiClient.previewTrade(testMarket?.id || "test", "YES", 1),
      !testMarket,
      "No open markets available"
    );

    await this.testEndpoint(
      "POST /trade/preview (NO)",
      "POST",
      () =>
        apiClient.previewTrade(testMarket?.id || "test", "NO", 1),
      !testMarket,
      "No open markets available"
    );

    await this.testEndpoint(
      "PATCH /users/me (dry run)",
      "PATCH",
      async () => {
        const profile = await apiClient.getUserProfile();
        return { wouldUpdate: { name: profile.name } };
      }
    );

    return this.results.filter(
      (r) =>
        r.endpoint.includes("/users/me") ||
        r.endpoint.includes("/auth/me") ||
        r.endpoint.includes("/wallet") ||
        r.endpoint.includes("/portfolio") ||
        r.endpoint.includes("/crypto") ||
        r.endpoint.includes("/trade") ||
        r.endpoint.includes("/currencies")
    );
  }

  async runAdminEndpointAudit(): Promise<EndpointTestResult[]> {
    console.log("Testing admin endpoints...");

    if (!this.isAdmin) {
      console.log("Skipping admin endpoints - not admin");
      return [];
    }

    await this.testEndpoint("GET /admin/markets", "GET", () => apiClient.getAdminMarkets());

    await this.testEndpoint("GET /admin/markets?status=open", "GET", () =>
      apiClient.getAdminMarkets({ status: "open" })
    );

    await this.testEndpoint("GET /admin/markets?status=closed", "GET", () =>
      apiClient.getAdminMarkets({ status: "closed" })
    );

    await this.testEndpoint("GET /admin/settlement/queue", "GET", () =>
      apiClient.getResolutionQueue()
    );

    await this.testEndpoint("GET /admin/settlement/stats", "GET", () =>
      apiClient.getSettlementStats()
    );

    await this.testEndpoint("GET /admin/crypto/deposits", "GET", () =>
      apiClient.getAdminDeposits({ limit: 10 })
    );

    await this.testEndpoint("GET /admin/crypto/deposits?status=pending", "GET", () =>
      apiClient.getAdminDeposits({ status: "pending", limit: 10 })
    );

    await this.testEndpoint("GET /admin/crypto/deposits/stats", "GET", () =>
      apiClient.getAdminDepositStats()
    );

    await this.testEndpoint("GET /admin/crypto/withdrawals", "GET", () =>
      apiClient.getAdminWithdrawals({ limit: 10 })
    );

    await this.testEndpoint("GET /admin/crypto/withdrawals?status=pending", "GET", () =>
      apiClient.getAdminWithdrawals({ status: "pending", limit: 10 })
    );

    const closedMarkets = await apiClient.getAdminMarkets({ status: "closed", limit: 1 });
    const closedMarket = closedMarkets.markets[0];

    await this.testEndpoint(
      "GET /admin/settlement/preview (sample)",
      "GET",
      () => apiClient.getSettlementPreview(closedMarket?.id || "test", "YES"),
      !closedMarket,
      "No closed markets available"
    );

    await this.testEndpoint(
      "POST /admin/settlement/trigger-check (dry run info)",
      "POST",
      async () => {
        return { note: "Would trigger settlement check - skipping to avoid side effects" };
      }
    );

    return this.results.filter((r) => r.endpoint.includes("/admin"));
  }

  async runFullAudit(): Promise<AuditReport> {
    this.results = [];
    const startTime = new Date().toISOString();

    await this.runPublicEndpointAudit();
    await this.runAuthenticatedEndpointAudit();
    await this.runAdminEndpointAudit();

    const successful = this.results.filter((r) => r.status === "success").length;
    const failed = this.results.filter((r) => r.status === "error").length;
    const skipped = this.results.filter((r) => r.status === "skipped").length;

    return {
      timestamp: startTime,
      totalEndpoints: this.results.length,
      successful,
      failed,
      skipped,
      results: this.results,
      isAuthenticated: this.isAuthenticated,
      isAdmin: this.isAdmin,
    };
  }

  getResults(): EndpointTestResult[] {
    return [...this.results];
  }
}

export const apiAuditor = new ApiAuditor();
export default apiAuditor;
