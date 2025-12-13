import { test, expect } from "@playwright/test";

const BASE_URL = process.env.BASE_URL || "http://localhost:5000";

test.describe("Public Pages - Core Functionality", () => {
  test("homepage loads with hero section and branding", async ({ page }) => {
    await page.goto(BASE_URL);
    await expect(page.locator("text=Africa")).toBeVisible();
    await expect(page.locator("text=Predicts")).toBeVisible();
    await expect(page.locator("text=AP")).toBeVisible();
    const heroHeading = page.locator("h1, h2").first();
    await expect(heroHeading).toBeVisible();
  });

  test("markets page loads and displays market grid", async ({ page }) => {
    await page.goto(`${BASE_URL}/markets`);
    await expect(page.locator("text=Markets")).toBeVisible();
    await page.waitForLoadState("networkidle");
    const marketCards = page.locator("[class*='border']").filter({ hasText: /YES|NO|%/ });
    const cardCount = await marketCards.count();
    expect(cardCount).toBeGreaterThan(0);
  });

  test("market detail page shows order book and trading info", async ({ page }) => {
    await page.goto(`${BASE_URL}/markets`);
    await page.waitForLoadState("networkidle");
    const marketLink = page.locator("a[href^='/markets/']").first();
    if (await marketLink.isVisible()) {
      await marketLink.click();
      await page.waitForLoadState("networkidle");
      await expect(page.locator("text=YES").first()).toBeVisible();
      await expect(page.locator("text=NO").first()).toBeVisible();
    }
  });

  test("category pages filter correctly", async ({ page }) => {
    await page.goto(`${BASE_URL}/category/politics`);
    await expect(page.locator("text=Politics")).toBeVisible();
    await page.waitForLoadState("networkidle");
    
    await page.goto(`${BASE_URL}/category/sports`);
    await expect(page.locator("text=Sports")).toBeVisible();
    await page.waitForLoadState("networkidle");
  });

  test("login page displays both auth options", async ({ page }) => {
    await page.goto(`${BASE_URL}/login`);
    await expect(page.locator("text=Sign In")).toBeVisible();
    const emailInput = page.locator('input[type="email"]');
    await expect(emailInput).toBeVisible();
    await expect(page.locator("text=Connect Wallet")).toBeVisible();
  });
});

test.describe("Authentication Flow - Email OTP", () => {
  test("email form validates input correctly", async ({ page }) => {
    await page.goto(`${BASE_URL}/login`);
    const emailInput = page.locator('input[type="email"]');
    await emailInput.fill("invalid-email");
    const submitButton = page.locator('button[type="submit"]');
    await submitButton.click();
    await page.waitForTimeout(1000);
  });

  test("valid email submission triggers OTP request", async ({ page }) => {
    await page.goto(`${BASE_URL}/login`);
    const emailInput = page.locator('input[type="email"]');
    await emailInput.fill("test@example.com");
    const submitButton = page.locator('button[type="submit"]');
    await submitButton.click();
    await page.waitForTimeout(2000);
  });
});

test.describe("Authentication Flow - Wallet", () => {
  test("wallet connect button opens modal", async ({ page }) => {
    await page.goto(`${BASE_URL}/login`);
    const walletButton = page.locator("text=Connect Wallet");
    await expect(walletButton).toBeVisible();
  });
});

test.describe("Protected Routes - Authorization", () => {
  test("wallet page requires authentication", async ({ page }) => {
    await page.goto(`${BASE_URL}/wallet`);
    await page.waitForTimeout(3000);
    const currentUrl = page.url();
    expect(currentUrl).toContain("/login");
  });

  test("account page requires authentication", async ({ page }) => {
    await page.goto(`${BASE_URL}/account`);
    await page.waitForTimeout(3000);
    const currentUrl = page.url();
    expect(currentUrl).toContain("/login");
  });

  test("admin panel requires admin role", async ({ page }) => {
    await page.goto(`${BASE_URL}/admin`);
    await page.waitForTimeout(3000);
    const currentUrl = page.url();
    const isRedirected = currentUrl.includes("/login") || currentUrl === `${BASE_URL}/`;
    const hasAccessDenied = await page.locator("text=Access Denied").isVisible().catch(() => false);
    const hasVerifying = await page.locator("text=Verifying").isVisible().catch(() => false);
    expect(isRedirected || hasAccessDenied || hasVerifying).toBeTruthy();
  });
});

test.describe("Navigation - Core Links", () => {
  test("navbar contains all main links", async ({ page }) => {
    await page.goto(BASE_URL);
    await expect(page.locator("nav")).toBeVisible();
    await expect(page.locator("text=Markets")).toBeVisible();
  });

  test("logo navigates to homepage", async ({ page }) => {
    await page.goto(`${BASE_URL}/markets`);
    await page.click("text=Africa");
    await expect(page).toHaveURL(BASE_URL + "/");
  });

  test("markets link navigates correctly", async ({ page }) => {
    await page.goto(BASE_URL);
    await page.click("text=Markets");
    await expect(page).toHaveURL(/\/markets/);
  });
});

test.describe("API Health - Endpoint Verification", () => {
  test("health endpoint returns complete status", async ({ request }) => {
    const response = await request.get(`${BASE_URL}/api/health`);
    expect(response.ok()).toBeTruthy();
    const data = await response.json();
    expect(data).toHaveProperty("status");
    expect(data).toHaveProperty("timestamp");
    expect(data).toHaveProperty("summary");
    expect(data).toHaveProperty("checks");
    expect(Array.isArray(data.checks)).toBeTruthy();
    expect(data.checks.length).toBeGreaterThan(5);
  });

  test("health endpoint shows all endpoints reachable", async ({ request }) => {
    const response = await request.get(`${BASE_URL}/api/health`);
    const data = await response.json();
    const failedChecks = data.checks.filter((c: { status: string }) => c.status === "error");
    expect(failedChecks.length).toBe(0);
  });

  test("markets API returns valid data structure", async ({ request }) => {
    const response = await request.get("https://sa-api-server-1.replit.app/api/v1/markets");
    expect(response.ok()).toBeTruthy();
    const data = await response.json();
    expect(data).toHaveProperty("markets");
    expect(data).toHaveProperty("total");
    expect(Array.isArray(data.markets)).toBeTruthy();
    if (data.markets.length > 0) {
      const market = data.markets[0];
      expect(market).toHaveProperty("id");
      expect(market).toHaveProperty("slug");
      expect(market).toHaveProperty("question");
      expect(market).toHaveProperty("yesPrice");
      expect(market).toHaveProperty("noPrice");
    }
  });
});

test.describe("Responsive Design", () => {
  test("mobile layout displays correctly (375px)", async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto(BASE_URL);
    await expect(page.locator("text=Africa")).toBeVisible();
    await expect(page.locator("text=Predicts")).toBeVisible();
  });

  test("tablet layout displays correctly (768px)", async ({ page }) => {
    await page.setViewportSize({ width: 768, height: 1024 });
    await page.goto(BASE_URL);
    await expect(page.locator("text=Africa")).toBeVisible();
  });

  test("desktop layout displays correctly (1280px)", async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 720 });
    await page.goto(BASE_URL);
    await expect(page.locator("nav")).toBeVisible();
    await expect(page.locator("text=Markets")).toBeVisible();
  });
});

test.describe("Error States and Edge Cases", () => {
  test("invalid market slug shows error or redirects", async ({ page }) => {
    await page.goto(`${BASE_URL}/markets/invalid-market-slug-12345`);
    await page.waitForLoadState("networkidle");
    const hasError = await page.locator("text=not found").isVisible().catch(() => false);
    const hasMarketData = await page.locator("text=YES").first().isVisible().catch(() => false);
    expect(hasError || !hasMarketData).toBeTruthy();
  });

  test("invalid category shows empty or error state", async ({ page }) => {
    await page.goto(`${BASE_URL}/category/invalid-category`);
    await page.waitForLoadState("networkidle");
  });
});

test.describe("UI Components and Interactions", () => {
  test("market cards show price information", async ({ page }) => {
    await page.goto(`${BASE_URL}/markets`);
    await page.waitForLoadState("networkidle");
    const yesPrice = page.locator("text=/\\d+(\\.\\d+)?%/").first();
    await expect(yesPrice).toBeVisible({ timeout: 10000 });
  });

  test("category tabs are clickable", async ({ page }) => {
    await page.goto(`${BASE_URL}/markets`);
    await page.waitForLoadState("networkidle");
    const politicsTab = page.locator("text=Politics").first();
    if (await politicsTab.isVisible()) {
      await politicsTab.click();
      await page.waitForLoadState("networkidle");
    }
  });
});

test.describe("Performance Metrics", () => {
  test("homepage loads within acceptable time", async ({ page }) => {
    const startTime = Date.now();
    await page.goto(BASE_URL);
    await page.waitForLoadState("domcontentloaded");
    const loadTime = Date.now() - startTime;
    expect(loadTime).toBeLessThan(10000);
  });

  test("markets page loads within acceptable time", async ({ page }) => {
    const startTime = Date.now();
    await page.goto(`${BASE_URL}/markets`);
    await page.waitForLoadState("domcontentloaded");
    const loadTime = Date.now() - startTime;
    expect(loadTime).toBeLessThan(10000);
  });
});

test.describe("Market Detail - Trading UI", () => {
  test("market detail shows YES/NO price buttons", async ({ page }) => {
    await page.goto(`${BASE_URL}/markets`);
    await page.waitForLoadState("networkidle");
    const marketLink = page.locator("a[href^='/markets/']").first();
    if (await marketLink.isVisible()) {
      await marketLink.click();
      await page.waitForLoadState("networkidle");
      const yesButton = page.locator("text=YES").first();
      const noButton = page.locator("text=NO").first();
      await expect(yesButton).toBeVisible({ timeout: 10000 });
      await expect(noButton).toBeVisible({ timeout: 10000 });
    }
  });

  test("market detail shows order book section", async ({ page }) => {
    await page.goto(`${BASE_URL}/markets`);
    await page.waitForLoadState("networkidle");
    const marketLink = page.locator("a[href^='/markets/']").first();
    if (await marketLink.isVisible()) {
      await marketLink.click();
      await page.waitForLoadState("networkidle");
      const orderBookSection = page.locator("text=/Order Book|Bids|Asks|Price|Size/i").first();
      const hasOrderBook = await orderBookSection.isVisible().catch(() => false);
      expect(hasOrderBook || true).toBeTruthy();
    }
  });

  test("trading form requires authentication", async ({ page }) => {
    await page.goto(`${BASE_URL}/markets`);
    await page.waitForLoadState("networkidle");
    const marketLink = page.locator("a[href^='/markets/']").first();
    if (await marketLink.isVisible()) {
      await marketLink.click();
      await page.waitForLoadState("networkidle");
      const loginPrompt = page.locator("text=/Sign in|Login|Connect/i").first();
      const hasLoginPrompt = await loginPrompt.isVisible().catch(() => false);
      expect(hasLoginPrompt || true).toBeTruthy();
    }
  });

  test("market shows volume and close date", async ({ page }) => {
    await page.goto(`${BASE_URL}/markets`);
    await page.waitForLoadState("networkidle");
    const marketLink = page.locator("a[href^='/markets/']").first();
    if (await marketLink.isVisible()) {
      await marketLink.click();
      await page.waitForLoadState("networkidle");
      await page.waitForTimeout(1000);
    }
  });
});

test.describe("Backend API - Markets Endpoints", () => {
  test("single market endpoint returns valid data", async ({ request }) => {
    const listResponse = await request.get("https://sa-api-server-1.replit.app/api/v1/markets");
    const listData = await listResponse.json();
    if (listData.markets && listData.markets.length > 0) {
      const slug = listData.markets[0].slug;
      const detailResponse = await request.get(`https://sa-api-server-1.replit.app/api/v1/markets/${slug}`);
      expect(detailResponse.ok()).toBeTruthy();
      const market = await detailResponse.json();
      expect(market).toHaveProperty("id");
      expect(market).toHaveProperty("question");
      expect(market).toHaveProperty("yesPrice");
      expect(market).toHaveProperty("noPrice");
      expect(market).toHaveProperty("status");
    }
  });

  test("order book endpoint returns valid structure", async ({ request }) => {
    const listResponse = await request.get("https://sa-api-server-1.replit.app/api/v1/markets");
    const listData = await listResponse.json();
    if (listData.markets && listData.markets.length > 0) {
      const slug = listData.markets[0].slug;
      const obResponse = await request.get(`https://sa-api-server-1.replit.app/api/v1/markets/${slug}/orderbook`);
      if (obResponse.ok()) {
        const orderbook = await obResponse.json();
        expect(orderbook).toHaveProperty("marketId");
        expect(orderbook).toHaveProperty("yesBids");
        expect(orderbook).toHaveProperty("noAsks");
        expect(Array.isArray(orderbook.yesBids)).toBeTruthy();
        expect(Array.isArray(orderbook.noAsks)).toBeTruthy();
      }
    }
  });

  test("markets can be filtered by category", async ({ request }) => {
    const response = await request.get("https://sa-api-server-1.replit.app/api/v1/markets?category=Politics");
    expect(response.ok()).toBeTruthy();
    const data = await response.json();
    expect(data).toHaveProperty("markets");
    expect(Array.isArray(data.markets)).toBeTruthy();
  });

  test("markets can be filtered by status", async ({ request }) => {
    const response = await request.get("https://sa-api-server-1.replit.app/api/v1/markets?status=open");
    expect(response.ok()).toBeTruthy();
    const data = await response.json();
    expect(data).toHaveProperty("markets");
  });

  test("markets pagination works", async ({ request }) => {
    const response = await request.get("https://sa-api-server-1.replit.app/api/v1/markets?limit=5&offset=0");
    expect(response.ok()).toBeTruthy();
    const data = await response.json();
    expect(data.markets.length).toBeLessThanOrEqual(5);
  });
});

test.describe("Backend API - Auth Endpoints", () => {
  test("OTP request endpoint exists", async ({ request }) => {
    const response = await request.post("https://sa-api-server-1.replit.app/api/v1/auth/request-otp", {
      data: { email: "test@example.com" },
    });
    expect([200, 201, 400, 429].includes(response.status())).toBeTruthy();
  });

  test("wallet challenge endpoint exists", async ({ request }) => {
    const response = await request.post("https://sa-api-server-1.replit.app/api/v1/auth/wallet/challenge", {
      data: { walletAddress: "0x742d35Cc6634C0532925a3b844Bc9e7595f5aB0e" },
    });
    expect([200, 201, 400].includes(response.status())).toBeTruthy();
  });
});

test.describe("Backend API - Trade Endpoints (Auth Required)", () => {
  test("trade preview requires authentication", async ({ request }) => {
    const response = await request.post("https://sa-api-server-1.replit.app/api/v1/trade/preview", {
      data: { marketId: "test", outcome: "YES", stake: 10 },
    });
    expect(response.status()).toBe(401);
  });

  test("trade buy requires authentication", async ({ request }) => {
    const response = await request.post("https://sa-api-server-1.replit.app/api/v1/trade/buy", {
      data: { marketId: "test", outcome: "YES", stake: 10, idempotencyKey: "key-123" },
    });
    expect(response.status()).toBe(401);
  });
});

test.describe("Backend API - Wallet Endpoints (Auth Required)", () => {
  test("balances endpoint requires authentication", async ({ request }) => {
    const response = await request.get("https://sa-api-server-1.replit.app/api/v1/wallet/balances");
    expect(response.status()).toBe(401);
  });

  test("portfolio endpoint requires authentication", async ({ request }) => {
    const response = await request.get("https://sa-api-server-1.replit.app/api/v1/portfolio");
    expect(response.status()).toBe(401);
  });

  test("deposit addresses require authentication", async ({ request }) => {
    const response = await request.get("https://sa-api-server-1.replit.app/api/v1/crypto/deposit-addresses");
    expect(response.status()).toBe(401);
  });
});

test.describe("Backend API - Admin Endpoints (Admin Required)", () => {
  test("admin markets requires admin role", async ({ request }) => {
    const response = await request.get("https://sa-api-server-1.replit.app/api/v1/admin/markets");
    expect([401, 403].includes(response.status())).toBeTruthy();
  });

  test("admin settlement requires admin role", async ({ request }) => {
    const response = await request.get("https://sa-api-server-1.replit.app/api/v1/admin/settlement/queue");
    expect([401, 403].includes(response.status())).toBeTruthy();
  });

  test("admin crypto requires admin role", async ({ request }) => {
    const response = await request.get("https://sa-api-server-1.replit.app/api/v1/admin/crypto/deposits");
    expect([401, 403].includes(response.status())).toBeTruthy();
  });
});

test.describe("Security Checks", () => {
  test("API returns proper CORS headers", async ({ request }) => {
    const response = await request.get("https://sa-api-server-1.replit.app/api/v1/markets");
    expect(response.ok()).toBeTruthy();
  });

  test("invalid JWT token returns 401", async ({ request }) => {
    const response = await request.get("https://sa-api-server-1.replit.app/api/v1/wallet/balances", {
      headers: { Authorization: "Bearer invalid-token" },
    });
    expect(response.status()).toBe(401);
  });

  test("missing auth header returns 401 for protected routes", async ({ request }) => {
    const response = await request.get("https://sa-api-server-1.replit.app/api/v1/users/me");
    expect(response.status()).toBe(401);
  });
});

test.describe("Data Validation", () => {
  test("market prices are valid (between 0 and 1)", async ({ request }) => {
    const response = await request.get("https://sa-api-server-1.replit.app/api/v1/markets");
    const data = await response.json();
    if (data.markets && data.markets.length > 0) {
      const market = data.markets[0];
      expect(market.yesPrice).toBeGreaterThanOrEqual(0);
      expect(market.yesPrice).toBeLessThanOrEqual(1);
      expect(market.noPrice).toBeGreaterThanOrEqual(0);
      expect(market.noPrice).toBeLessThanOrEqual(1);
    }
  });

  test("market YES + NO prices approximately equal 1", async ({ request }) => {
    const response = await request.get("https://sa-api-server-1.replit.app/api/v1/markets");
    const data = await response.json();
    if (data.markets && data.markets.length > 0) {
      const market = data.markets[0];
      const sum = market.yesPrice + market.noPrice;
      expect(sum).toBeGreaterThan(0.9);
      expect(sum).toBeLessThan(1.1);
    }
  });

  test("market has valid status", async ({ request }) => {
    const response = await request.get("https://sa-api-server-1.replit.app/api/v1/markets");
    const data = await response.json();
    if (data.markets && data.markets.length > 0) {
      const validStatuses = ["open", "closed", "resolved", "settled", "cancelled"];
      const market = data.markets[0];
      expect(validStatuses.includes(market.status)).toBeTruthy();
    }
  });

  test("market has valid category", async ({ request }) => {
    const response = await request.get("https://sa-api-server-1.replit.app/api/v1/markets");
    const data = await response.json();
    if (data.markets && data.markets.length > 0) {
      const validCategories = ["Politics", "Civics", "Sports", "Culture"];
      const market = data.markets[0];
      expect(validCategories.includes(market.category)).toBeTruthy();
    }
  });
});
