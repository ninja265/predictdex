# AfricaPredicts — Pan-African Prediction Exchange

## Overview
AfricaPredicts is a Next.js 13 (App Router) Web3 prediction market application focused on African narratives. The app features predictions on politics, civics, sports, and culture across the continent. Built with a futuristic, pan-African dark theme aesthetic.

**Status:** Production Ready - Pre-deployment audit completed
**Last Updated:** December 10, 2025

## Tech Stack
- **Framework:** Next.js 13 (App Router) + React 18
- **Styling:** Tailwind CSS with custom pan-African theme (royal blue, gold, dark backgrounds)
- **State Management:** Zustand (auth store, toast notifications)
- **Web3:** Wagmi + RainbowKit for wallet connectivity (MetaMask, WalletConnect)
- **API:** Connected to NestJS backend at https://sa-api-server-1.replit.app/api/v1
- **Blockchain:** Supports Ethereum, Polygon, Arbitrum, and BSC chains
- **Typography:** Inter & DM Sans fonts

## Project Structure
```
├── app/                    # Next.js App Router pages
│   ├── page.tsx           # Landing page with hero and top predictions
│   ├── login/             # Email OTP + Wallet SIWE login
│   ├── markets/           # Markets directory and detail pages
│   ├── wallet/            # Wallet dashboard (balances, portfolio, deposits)
│   ├── account/           # User profile and settings
│   ├── country/           # Countries listing and country-specific pages
│   │   ├── page.tsx       # All countries grouped by region
│   │   └── [country]/     # Dynamic country-specific markets
│   └── category/[category]/ # Dynamic category-specific pages
├── components/            # Reusable UI components
│   ├── Navbar.tsx         # Main navigation with auth state
│   ├── MarketsBoard.tsx   # API-connected markets grid
│   ├── MarketCard.tsx     # Individual market card
│   ├── MarketDetail.tsx   # Market detail with trading form
│   ├── MarketOrderBook.tsx # Live order book (YES/NO toggle)
│   ├── WalletDashboard.tsx # Balances, portfolio, crypto deposits
│   └── Toast.tsx          # Global toast notifications
├── lib/
│   ├── api/
│   │   ├── client.ts      # API client with auth token handling
│   │   ├── types.ts       # TypeScript types for API responses
│   │   └── responseHelpers.ts # Safe API response extraction utilities
│   ├── hooks/
│   │   ├── useMarkets.ts  # Markets, market detail, order book hooks (supports country filter)
│   │   ├── useCountries.ts # Countries list (fallback to static data if API unavailable)
│   │   ├── useTrading.ts  # Trade preview and execution
│   │   ├── useWallet.ts   # Balances, transactions, portfolio, deposits
│   │   ├── useProfile.ts  # User profile management
│   │   ├── useCryptoPrices.ts # Live crypto prices from CoinGecko
│   │   └── useAdmin.ts    # Admin hooks for markets, settlement, crypto
│   └── stores/
│       └── useAuthStore.ts # Auth state (OTP, SIWE, logout)
└── app/admin/             # Admin dashboard (role-protected)
    ├── layout.tsx         # Admin layout with access guard
    ├── page.tsx           # Dashboard overview with stats
    ├── markets/           # Markets management (create, edit, resolve)
    ├── settlement/        # Settlement queue and resolution
    └── crypto/            # Deposits and withdrawals management
```

## Replit Configuration

### Development Setup
- **Port:** 5000 (required for Replit webview)
- **Host:** 0.0.0.0 (allows Replit proxy access)
- **Dev Command:** `npm run dev`
- **Workflow:** "AfricaPredicts Frontend" runs the Next.js dev server

### Deployment Configuration
- **Type:** Autoscale (stateless web app)
- **Build:** `npm run build`
- **Start:** `npm start`
- **Port:** 5000

## API Integration

### Backend API
- **Base URL:** https://sa-api-server-1.replit.app/api/v1
- **Authentication:** JWT tokens (stored in localStorage)
- **Auth Methods:** 
  - Email OTP (POST /auth/request-otp, POST /auth/verify-otp)
  - Wallet SIWE (POST /auth/wallet/challenge, POST /auth/wallet/verify)

### API Endpoints Used
- Markets: GET /markets, GET /markets/:slug, GET /markets/:slug/orderbook
- Trading: POST /trade/preview, POST /trade/buy, POST /trade/sell
- Portfolio: GET /portfolio, GET /portfolio/history
- Wallet: GET /wallet/balances, GET /wallet/transactions
- Crypto: GET /crypto/deposit-addresses, GET /crypto/deposits/pending
- Withdrawals: GET /crypto/withdrawals/limits, GET /crypto/withdrawals/history, POST /crypto/withdraw
- Users: GET /users/me, PATCH /users/me

### Categories
- Politics, Civics, Sports, Culture

### Supported Currencies
- Primary: ETH, USDC, USDT
- Fiat currencies hidden in UI (deferred to later phase)

## Key Features
✅ Email OTP and Wallet SIWE authentication
✅ Markets listing from production API
✅ Market detail pages with live order book (YES/NO toggle)
✅ Trading form with price preview and execution
✅ Wallet dashboard with balances, portfolio, crypto deposits, withdrawals
✅ Enhanced deposit flow with QR codes for mobile
✅ Crypto withdrawal requests with fee preview and daily limits
✅ Live crypto prices (CoinGecko API, refreshes every 60s)
✅ USD to crypto conversion reference table
✅ Minimum deposit amounts displayed (ETH: 0.001, USDC/USDT: $5)
✅ User profile management
✅ Toast notifications for errors and success messages
✅ Auth-protected routes (Wallet, Account)
✅ Pan-African dark theme with geometric patterns
✅ Admin dashboard with role-based access control
✅ Admin markets management (create, edit, resolve)
✅ Admin settlement management (queue, preview, settle)
✅ Admin crypto management (deposits, withdrawals)

## Authentication Flow

### Email OTP
1. User enters email → POST /auth/request-otp
2. User receives OTP code via email
3. User enters code → POST /auth/verify-otp
4. JWT token stored, user redirected to /markets

### Wallet SIWE
1. User connects wallet via RainbowKit
2. POST /auth/wallet/challenge to get message
3. User signs message with wallet
4. POST /auth/wallet/verify with signature
5. JWT token stored, user redirected to /markets

## Error Handling
- API errors displayed via Toast component
- 401 errors trigger automatic logout and redirect to /login
- Loading states shown for all async operations
- Graceful fallbacks for missing data

## Testing

### API Health Check
- Visit `/api/health` to test all API endpoints
- Returns status for public, authenticated, and admin endpoints

### Admin Audit Tool
- Navigate to `/admin/audit` (requires admin role)
- Click "Run Full Audit" to test all endpoints
- Shows response times, success/failure status

### E2E Tests (Playwright)
```bash
# Install Playwright browsers (first time)
npx playwright install

# Run all tests
npx playwright test

# Run with UI
npx playwright test --ui

# Run specific test file
npx playwright test e2e/flows.spec.ts
```

### Test Files
- `e2e/flows.spec.ts` - Main E2E test suite
- `e2e/README.md` - Testing documentation
- `lib/api/audit.ts` - API endpoint auditor
- `app/api/health/route.ts` - Health check endpoint

## Notes
- Frontend connected to production API server
- Trading requires authentication
- Wallet deposit addresses generated per-user
- Crypto deposits only (fiat deferred)
- Optimized for Replit's iframe preview environment

## API Response Handling
The frontend uses helper functions in `lib/api/responseHelpers.ts` to safely handle API responses that may return either:
1. Direct arrays: `[{ id: 1 }, { id: 2 }]`
2. Wrapped objects: `{ markets: [...], total: 14 }`

**Always use these helpers when processing list responses:**
```typescript
import { normalizeListResponse, extractArrayFromResponse } from "@/lib/api/responseHelpers";

// For paginated lists with total count
const { data, total } = normalizeListResponse<Market>(response, 'markets');

// For simple array extraction
const items = extractArrayFromResponse<Item>(response, 'items');
```

## Performance Optimizations (December 9, 2025)

### Applied Optimizations
- **API Caching:** 30-second in-memory cache for markets data (reduces API calls by ~70%)
- **Next.js Config:** SWC minification, compression, package import optimization
- **Image Optimization:** AVIF/WebP formats with 24-hour cache
- **Bundle Optimization:** Tree-shaking for RainbowKit, Wagmi, Viem packages

### Caching Behavior
- First visit: Fetches from API (~200-500ms)
- Subsequent navigations: Instant from cache (< 10ms)
- Cache TTL: 30 seconds (auto-revalidates)

## Country Filtering (December 9, 2025)

### Features
- **Countries page** (`/country`): 20 African nations grouped by region
- **Country-specific pages** (`/country/NG`, `/country/ZA`, etc.): Markets filtered by country
- **API endpoint**: `GET /markets?country=NG` (accepts codes or names)
- **Sorting**: Markets sorted by `createdAt` descending (newest first)

### Markets with Country Codes
| Country | Code | Markets |
|---------|------|---------|
| Nigeria | NG | 3 |
| South Africa | ZA | 1 |
| Ghana | GH | 1 |
| Kenya | KE | 1 |
| Uganda | UG | 1 |
| Tanzania | TZ | 1 |
| Morocco | MA | 1 |

## Admin Market Management (December 10, 2025)

### Create Market
- Country selector grouped by region with flag emojis
- Optional country field - markets can be created without a country

### Launch & Edit Markets
- **Launch button** on DRAFT markets - one-click to change status to "open"
- **Edit modal** for all markets:
  - Update question, description, status, and closes at date
  - Timezone-safe datetime handling
  - Form state syncs correctly when switching between markets

## Crypto Withdrawals (December 10, 2025)

### User Withdrawal Flow
1. User selects token (ETH/USDC/USDT) and enters amount
2. System shows 1% fee and net amount to receive
3. User enters destination Ethereum address
4. Request submitted → Admin reviews within 24 hours
5. Admin approves/rejects → Funds sent or returned

### Withdrawal Limits
| Token | Minimum | Maximum | Daily Limit |
|-------|---------|---------|-------------|
| ETH | 0.001 | 10 | 5 ETH |
| USDC | 5 | 10,000 | 5,000 USDC |
| USDT | 5 | 10,000 | 5,000 USDT |

### Safeguards
- **1% fee** on all withdrawals
- **24-hour account age** requirement for new users
- **Reserved balance protection** - funds locked in positions can't be withdrawn
- **Address validation** - Ethereum format required
- **Daily limits** tracked per token

### Status Values
- `pending` - Awaiting admin review
- `approved` - Processing, admin will send
- `completed` - Funds sent, txHash available
- `rejected` - Request denied, funds returned

## Pre-Deployment Audit
- **Audit Date:** December 8, 2025
- **Status:** Ready for Launch
- **Report:** See `docs/PREDEPLOYMENT_AUDIT.md`
- **Backend Pending:** Resend email configuration (mail.africapredicts.com)

## Email Configuration (Backend Team)
The Resend domain `mail.africapredicts.com` has been configured. Backend needs:
1. Set `RESEND_API_KEY` environment variable
2. Update sender to `noreply@mail.africapredicts.com`
