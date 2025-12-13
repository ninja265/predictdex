import { NextResponse } from "next/server";

const API_BASE_URL = "https://sa-api-server-1.replit.app/api/v1";

interface EndpointCheck {
  name: string;
  url: string;
  method: string;
  status: "ok" | "error" | "timeout";
  responseTime: number;
  statusCode?: number;
  error?: string;
}

async function checkEndpoint(
  name: string,
  path: string,
  method: string = "GET"
): Promise<EndpointCheck> {
  const url = `${API_BASE_URL}${path}`;
  const start = Date.now();

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 10000);

    const response = await fetch(url, {
      method,
      signal: controller.signal,
      headers: {
        "Content-Type": "application/json",
      },
    });

    clearTimeout(timeout);
    const responseTime = Date.now() - start;

    return {
      name,
      url,
      method,
      status: response.ok || response.status === 401 ? "ok" : "error",
      responseTime,
      statusCode: response.status,
    };
  } catch (error) {
    const responseTime = Date.now() - start;
    const errorMessage = error instanceof Error ? error.message : "Unknown error";

    return {
      name,
      url,
      method,
      status: errorMessage.includes("abort") ? "timeout" : "error",
      responseTime,
      error: errorMessage,
    };
  }
}

export async function GET() {
  const checks: EndpointCheck[] = [];

  checks.push(await checkEndpoint("Markets List", "/markets"));
  checks.push(await checkEndpoint("Markets (Politics)", "/markets?category=Politics"));
  checks.push(await checkEndpoint("Markets (Sports)", "/markets?category=Sports"));

  const marketsRes = await fetch(`${API_BASE_URL}/markets?limit=1`);
  if (marketsRes.ok) {
    const data = await marketsRes.json();
    if (data.markets && data.markets.length > 0) {
      const slug = data.markets[0].slug;
      checks.push(await checkEndpoint("Market Detail", `/markets/${slug}`));
      checks.push(await checkEndpoint("Order Book", `/markets/${slug}/orderbook`));
    }
  }

  checks.push(await checkEndpoint("User Profile (requires auth)", "/users/me"));
  checks.push(await checkEndpoint("Wallet Balances (requires auth)", "/wallet/balances"));
  checks.push(await checkEndpoint("Portfolio (requires auth)", "/portfolio"));
  checks.push(await checkEndpoint("Deposit Addresses (requires auth)", "/crypto/deposit-addresses"));

  checks.push(await checkEndpoint("Admin Markets (requires admin)", "/admin/markets"));
  checks.push(await checkEndpoint("Settlement Queue (requires admin)", "/admin/settlement/queue"));
  checks.push(await checkEndpoint("Settlement Stats (requires admin)", "/admin/settlement/stats"));
  checks.push(await checkEndpoint("Admin Deposits (requires admin)", "/admin/crypto/deposits"));

  const successful = checks.filter((c) => c.status === "ok").length;
  const failed = checks.filter((c) => c.status === "error").length;
  const timeouts = checks.filter((c) => c.status === "timeout").length;
  const avgResponseTime = Math.round(
    checks.reduce((sum, c) => sum + c.responseTime, 0) / checks.length
  );

  return NextResponse.json({
    status: failed === 0 && timeouts === 0 ? "healthy" : "degraded",
    timestamp: new Date().toISOString(),
    apiBaseUrl: API_BASE_URL,
    summary: {
      total: checks.length,
      successful,
      failed,
      timeouts,
      avgResponseTime: `${avgResponseTime}ms`,
    },
    checks,
  });
}
