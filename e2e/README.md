# E2E Testing Guide for AfricaPredicts

## Overview

This document describes the end-to-end testing approach for AfricaPredicts, covering all user flows and API integrations.

## Test Categories

### 1. Public Flows (No Authentication)

| Test Case | Description | Expected Result |
|-----------|-------------|-----------------|
| View Homepage | Navigate to / | Hero section and top predictions displayed |
| View Markets | Navigate to /markets | Markets grid loads with filters |
| View Market Detail | Click on a market | Market detail page with order book |
| Category Navigation | Click category tabs | Markets filtered by category |
| Country Navigation | Navigate to /country/nigeria | Markets filtered by country |

### 2. Authentication Flows

| Test Case | Description | Expected Result |
|-----------|-------------|-----------------|
| Email OTP Request | Enter email on /login | OTP sent, shows code input |
| Email OTP Verify | Enter valid OTP | Logged in, redirected to /markets |
| Invalid OTP | Enter wrong code | Error message displayed |
| Wallet Connect | Click "Connect Wallet" | RainbowKit modal opens |
| SIWE Sign | Sign message with wallet | Logged in, redirected to /markets |
| Logout | Click logout button | Session cleared, redirected to home |

### 3. Authenticated User Flows

| Test Case | Description | Expected Result |
|-----------|-------------|-----------------|
| View Wallet | Navigate to /wallet | Balances and portfolio displayed |
| View Deposit Tab | Click "Deposit" tab | Deposit addresses with QR codes |
| View Account | Navigate to /account | Profile info and settings |
| Update Profile | Change name/currency | Profile updated successfully |
| Trade Preview | Select market and shares | Preview shows cost/payout |
| Execute Trade | Confirm trade | Trade executed, position created |

### 4. Admin Flows

| Test Case | Description | Expected Result |
|-----------|-------------|-----------------|
| Access Admin | Navigate to /admin | Dashboard with stats |
| Non-Admin Access | Regular user to /admin | Redirected to home |
| View Markets | Navigate to /admin/markets | Markets list with filters |
| Create Market | Fill create form | New market created |
| Resolve Market | Select outcome | Market resolved, payouts triggered |
| View Settlement Queue | Navigate to /admin/settlement | Queue with pending markets |
| Preview Settlement | Click preview | Winners/losers shown |
| View Deposits | Navigate to /admin/crypto | Pending deposits list |
| Credit Deposit | Click credit button | Deposit credited to user |
| Run Audit | Navigate to /admin/audit | All endpoints tested |

## API Endpoints Tested

### Public Endpoints
- `GET /markets` - List all markets
- `GET /markets?category=X` - Filter by category
- `GET /markets?status=X` - Filter by status
- `GET /markets/:slug` - Get market detail
- `GET /markets/:slug/orderbook` - Get order book
- `GET /markets/:slug/trades` - Get recent trades

### Authentication Endpoints
- `POST /auth/request-otp` - Request OTP
- `POST /auth/verify-otp` - Verify OTP
- `POST /auth/wallet/challenge` - Get SIWE message
- `POST /auth/wallet/verify` - Verify signature
- `GET /auth/me` - Get current user
- `POST /auth/logout` - End session

### User Endpoints (Authenticated)
- `GET /users/me` - Get profile
- `PATCH /users/me` - Update profile
- `GET /wallet/balances` - Get all balances
- `GET /wallet/balance/:currency` - Get single balance
- `GET /wallet/transactions` - Get transactions
- `GET /portfolio` - Get positions
- `GET /portfolio/history` - Get position history
- `POST /trade/preview` - Preview trade
- `POST /trade/buy` - Execute buy
- `POST /trade/sell` - Execute sell
- `GET /crypto/tokens` - Get supported tokens
- `GET /crypto/deposit-addresses` - Get all deposit addresses
- `GET /crypto/deposit-address/:token` - Get specific address
- `GET /crypto/deposits/pending` - Get pending deposits
- `GET /crypto/deposits/history` - Get deposit history
- `GET /currencies` - Get supported currencies

### Admin Endpoints
- `GET /admin/markets` - List all markets (admin view)
- `POST /admin/markets` - Create market
- `PATCH /admin/markets/:id` - Update market
- `PATCH /admin/markets/:id/prices` - Update prices
- `POST /admin/markets/:id/resolve` - Resolve market
- `GET /admin/settlement/queue` - Get resolution queue
- `GET /admin/settlement/stats` - Get settlement stats
- `GET /admin/settlement/preview/:id` - Preview settlement
- `POST /admin/settlement/resolve/:id` - Execute settlement
- `POST /admin/settlement/trigger-check` - Trigger check
- `GET /admin/crypto/deposits` - List deposits
- `GET /admin/crypto/deposits/stats` - Deposit stats
- `POST /admin/crypto/deposits/:id/credit` - Credit deposit
- `GET /admin/crypto/withdrawals` - List withdrawals
- `POST /admin/crypto/withdrawals/:id/approve` - Approve
- `POST /admin/crypto/withdrawals/:id/reject` - Reject
- `POST /admin/crypto/withdrawals/:id/complete` - Complete

## Running Tests

### Manual Testing

1. **Health Check**: Visit `/api/health` to verify all endpoints are reachable
2. **Audit Tool**: As admin, visit `/admin/audit` and run full audit
3. **Browser DevTools**: Check Network tab for failed requests

### Automated Testing Setup

```bash
# Install Playwright
npm install -D @playwright/test

# Create test file
touch e2e/flows.spec.ts

# Run tests
npx playwright test
```

## Test Data Requirements

- **Test User Email**: Required for OTP flow testing
- **Test Wallet**: MetaMask or WalletConnect compatible
- **Admin Account**: User with role=admin for admin tests
- **Open Markets**: At least one market with status=open

## Environment Variables

Ensure these are set for testing:
- `NEXT_PUBLIC_API_URL`: API base URL (default: https://sa-api-server-1.replit.app/api/v1)
- `NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID`: WalletConnect project ID

## Known Limitations

1. Email OTP cannot be fully automated without email access
2. Wallet signing requires manual interaction
3. Crypto deposits require on-chain transactions
4. Settlement payouts depend on blockchain confirmations
