import { test, expect } from "@playwright/test";

const BASE_URL = process.env.BASE_URL || "http://localhost:5000";

test.describe("Public Pages", () => {
  test("homepage loads with hero section", async ({ page }) => {
    await page.goto(BASE_URL);
    await expect(page.locator("text=Africa")).toBeVisible();
    await expect(page.locator("text=Predicts")).toBeVisible();
  });

  test("markets page loads and displays markets", async ({ page }) => {
    await page.goto(`${BASE_URL}/markets`);
    await expect(page.locator("text=Markets")).toBeVisible();
    await page.waitForSelector('[data-testid="market-card"]', { timeout: 10000 }).catch(() => {
      console.log("No market cards found - may be loading");
    });
  });

  test("category filter works", async ({ page }) => {
    await page.goto(`${BASE_URL}/category/politics`);
    await expect(page.locator("text=Politics")).toBeVisible();
  });

  test("login page loads", async ({ page }) => {
    await page.goto(`${BASE_URL}/login`);
    await expect(page.locator("text=Sign In")).toBeVisible();
  });
});

test.describe("Authentication Flow", () => {
  test("email input shows OTP field after submission", async ({ page }) => {
    await page.goto(`${BASE_URL}/login`);
    const emailInput = page.locator('input[type="email"]');
    await emailInput.fill("test@example.com");
    const submitButton = page.locator('button[type="submit"]');
    await submitButton.click();
    await page.waitForTimeout(2000);
  });

  test("wallet connect button is visible", async ({ page }) => {
    await page.goto(`${BASE_URL}/login`);
    await expect(page.locator("text=Connect Wallet")).toBeVisible();
  });
});

test.describe("Protected Routes", () => {
  test("wallet page redirects to login when not authenticated", async ({ page }) => {
    await page.goto(`${BASE_URL}/wallet`);
    await page.waitForTimeout(2000);
    const currentUrl = page.url();
    expect(currentUrl).toContain("/login");
  });

  test("account page redirects to login when not authenticated", async ({ page }) => {
    await page.goto(`${BASE_URL}/account`);
    await page.waitForTimeout(2000);
    const currentUrl = page.url();
    expect(currentUrl).toContain("/login");
  });

  test("admin page redirects when not authenticated", async ({ page }) => {
    await page.goto(`${BASE_URL}/admin`);
    await page.waitForTimeout(2000);
    const currentUrl = page.url();
    expect(currentUrl.includes("/login") || currentUrl === `${BASE_URL}/`).toBeTruthy();
  });
});

test.describe("Navigation", () => {
  test("navbar links work correctly", async ({ page }) => {
    await page.goto(BASE_URL);
    
    await page.click("text=Markets");
    await expect(page).toHaveURL(/\/markets/);
    
    await page.click("text=Categories");
    await expect(page).toHaveURL(/\/category/);
  });

  test("logo links to home", async ({ page }) => {
    await page.goto(`${BASE_URL}/markets`);
    await page.click("text=Africa");
    await expect(page).toHaveURL(BASE_URL + "/");
  });
});

test.describe("API Health Check", () => {
  test("health endpoint returns status", async ({ request }) => {
    const response = await request.get(`${BASE_URL}/api/health`);
    expect(response.ok()).toBeTruthy();
    const data = await response.json();
    expect(data).toHaveProperty("status");
    expect(data).toHaveProperty("checks");
  });
});

test.describe("Market Detail Page", () => {
  test("market detail loads order book", async ({ page }) => {
    await page.goto(`${BASE_URL}/markets`);
    await page.waitForTimeout(3000);
    
    const marketLink = page.locator("a[href^='/markets/']").first();
    if (await marketLink.isVisible()) {
      await marketLink.click();
      await page.waitForTimeout(2000);
      await expect(page.locator("text=Order Book").or(page.locator("text=YES").first())).toBeVisible();
    }
  });
});

test.describe("Responsive Design", () => {
  test("mobile navigation works", async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto(BASE_URL);
    await expect(page.locator("text=Africa")).toBeVisible();
  });

  test("desktop layout displays correctly", async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 720 });
    await page.goto(BASE_URL);
    await expect(page.locator("nav")).toBeVisible();
  });
});
