# AfricaPredicts — Pan-African Prediction Exchange

## Overview
AfricaPredicts is a Next.js 13 (App Router) Web3 prediction market application focused on African narratives. The app features predictions on politics, civics, sports, and culture across the continent. Built with a futuristic, pan-African dark theme aesthetic.

**Status:** Development - Frontend connected to production API
**Last Updated:** December 2, 2025

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
│   │   └── types.ts       # TypeScript types for API responses
│   ├── hooks/
│   │   ├── useMarkets.ts  # Markets, market detail, order book hooks
│   │   ├── useTrading.ts  # Trade preview and execution
│   │   ├── useWallet.ts   # Balances, transactions, portfolio, deposits
│   │   └── useProfile.ts  # User profile management
│   └── stores/
│       └── useAuthStore.ts # Auth state (OTP, SIWE, logout)
└── data/
    └── predictions.ts     # Categories list (fallback)
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
✅ Wallet dashboard with balances, portfolio, crypto deposits
✅ User profile management
✅ Toast notifications for errors and success messages
✅ Auth-protected routes (Wallet, Account)
✅ Pan-African dark theme with geometric patterns

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

## Notes
- Frontend connected to production API server
- Trading requires authentication
- Wallet deposit addresses generated per-user
- Crypto deposits only (fiat deferred)
- Optimized for Replit's iframe preview environment
