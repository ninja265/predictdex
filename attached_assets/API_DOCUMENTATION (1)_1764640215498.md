# AfricaPredicts API Documentation

## Overview

AfricaPredicts is a prediction market platform for African narratives. This API powers markets for Politics, Civics, Sports, and Culture across the continent.

**Base URL:** `https://sa-api-server-1.replit.app/api/v1`

**API Version:** 1.0.0

---

## Table of Contents

1. [Authentication](#authentication)
2. [Markets](#markets)
3. [Trading](#trading)
4. [Portfolio](#portfolio)
5. [Wallet](#wallet)
6. [Crypto](#crypto)
7. [Users](#users)
8. [Admin Endpoints](#admin-endpoints)
9. [Common Patterns](#common-patterns)
10. [Error Handling](#error-handling)
11. [Frontend Integration Guide](#frontend-integration-guide)

---

## Authentication

All protected endpoints require a Bearer token in the Authorization header:
```
Authorization: Bearer <token>
```

### Dual Auth Support
The API supports two authentication methods:
1. **Email OTP** - Passwordless email-based authentication
2. **WalletConnect (SIWE)** - Sign-In with Ethereum for Web3 users

---

### Email OTP Flow

#### 1. Request OTP
```http
POST /auth/request-otp
Content-Type: application/json

{
  "email": "user@example.co.za"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Code sent to email",
  "expiresIn": 300
}
```

#### 2. Verify OTP
```http
POST /auth/verify-otp
Content-Type: application/json

{
  "email": "user@example.co.za",
  "code": "123456"
}
```

**Response:**
```json
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "expiresAt": "2025-12-03T00:00:00.000Z",
  "user": {
    "id": "uuid",
    "email": "user@example.co.za",
    "name": null,
    "balance": 25000,
    "role": "user"
  }
}
```

---

### WalletConnect (SIWE) Flow

#### 1. Get Challenge
```http
POST /auth/wallet/challenge
Content-Type: application/json

{
  "address": "0x1234567890abcdef..."
}
```

**Response:**
```json
{
  "message": "africapredicts.com wants you to sign in with your Ethereum account...",
  "nonce": "abc123",
  "expiresAt": "2025-12-02T01:00:00.000Z"
}
```

#### 2. Verify Signature
```http
POST /auth/wallet/verify
Content-Type: application/json

{
  "message": "<SIWE message from challenge>",
  "signature": "0xsignature..."
}
```

**Response:**
```json
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "expiresAt": "2025-12-03T00:00:00.000Z",
  "user": {
    "id": "uuid",
    "walletAddress": "0x1234...",
    "role": "user"
  }
}
```

---

### Get Current User
```http
GET /auth/me
Authorization: Bearer <token>
```

**Response:**
```json
{
  "user": {
    "id": "uuid",
    "email": "user@example.co.za",
    "name": "John Doe",
    "role": "user"
  }
}
```

### Logout
```http
POST /auth/logout
Authorization: Bearer <token>
```

**Response:**
```json
{
  "success": true
}
```

---

## Markets

### List Markets
```http
GET /markets?category=Politics&status=open&limit=20&offset=0
```

**Query Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| category | string | No | Filter: `Politics`, `Civics`, `Sports`, `Culture` |
| status | string | No | Filter: `draft`, `open`, `closed`, `resolved` (default: `open`) |
| currency | string | No | Filter by currency code |
| limit | number | No | Results per page (default: 20) |
| offset | number | No | Pagination offset (default: 0) |

**Response:**
```json
{
  "markets": [
    {
      "id": "uuid",
      "slug": "nigeria-2027-election-apc-win",
      "question": "Will the APC win the 2027 Nigerian Presidential Election?",
      "category": "Politics",
      "imageUrl": null,
      "status": "open",
      "yesPrice": 0.45,
      "noPrice": 0.55,
      "volume": 150000,
      "currency": "NGN",
      "symbol": "₦",
      "closesAt": "2025-12-31T23:59:59.000Z"
    }
  ],
  "total": 12,
  "limit": 20,
  "offset": 0
}
```

### Get Market Details
```http
GET /markets/:slug
```

**Response:**
```json
{
  "id": "uuid",
  "slug": "nigeria-2027-election-apc-win",
  "question": "Will the APC win the 2027 Nigerian Presidential Election?",
  "description": "This market resolves YES if the APC candidate wins...",
  "category": "Politics",
  "imageUrl": null,
  "status": "open",
  "yesPrice": 0.45,
  "noPrice": 0.55,
  "volume": 150000,
  "currency": "NGN",
  "symbol": "₦",
  "closesAt": "2025-12-31T23:59:59.000Z",
  "createdAt": "2025-01-01T00:00:00.000Z",
  "resolvedAt": null,
  "winningOutcome": null
}
```

### Get Order Book
```http
GET /markets/:slug/orderbook
```

**Response:**
```json
{
  "market": {
    "id": "uuid",
    "slug": "nigeria-2027-election-apc-win",
    "question": "Will the APC win?",
    "yesPrice": 0.45,
    "noPrice": 0.55
  },
  "orderbook": {
    "yes": {
      "bids": [
        { "price": 0.44, "shares": 100 },
        { "price": 0.43, "shares": 250 }
      ],
      "asks": [
        { "price": 0.46, "shares": 150 }
      ]
    },
    "no": {
      "bids": [
        { "price": 0.54, "shares": 120 }
      ],
      "asks": [
        { "price": 0.56, "shares": 200 }
      ]
    }
  }
}
```

### Get Recent Trades
```http
GET /markets/:slug/trades?limit=50
```

**Response:**
```json
{
  "trades": [
    {
      "id": "uuid",
      "outcome": "YES",
      "shares": 50,
      "price": 0.45,
      "stake": 22.5,
      "fee": 0.45,
      "timestamp": "2025-12-01T12:00:00.000Z"
    }
  ],
  "currency": "NGN",
  "symbol": "₦"
}
```

---

## Trading

All trading endpoints require authentication.

### Preview Trade
Calculate trade details before executing.
```http
POST /trade/preview
Authorization: Bearer <token>
Content-Type: application/json

{
  "marketId": "uuid",
  "outcome": "YES",
  "stake": 1000
}
```

**Response:**
```json
{
  "marketId": "uuid",
  "outcome": "YES",
  "stake": 1000,
  "currency": "NGN",
  "symbol": "₦",
  "currentPrice": 0.45,
  "shares": 2178.26,
  "fee": 20,
  "totalCost": 1020,
  "estimatedPayout": 2178.26,
  "estimatedProfit": 1158.26,
  "impliedOdds": 0.45
}
```

### Buy Shares
```http
POST /trade/buy
Authorization: Bearer <token>
Content-Type: application/json

{
  "marketId": "uuid",
  "outcome": "YES",
  "stake": 1000,
  "idempotencyKey": "unique-key-123"
}
```

**Response:**
```json
{
  "success": true,
  "trade": {
    "id": "uuid",
    "marketId": "uuid",
    "outcome": "YES",
    "shares": 2178.26,
    "avgPrice": 0.45,
    "stake": 1000,
    "fee": 20,
    "totalCost": 1020,
    "currency": "NGN",
    "symbol": "₦",
    "timestamp": "2025-12-01T12:00:00.000Z"
  },
  "position": {
    "id": "uuid",
    "marketId": "uuid",
    "outcome": "YES",
    "shares": 2178.26,
    "avgPrice": 0.45,
    "stake": 1000,
    "status": "open",
    "currency": "NGN"
  },
  "newBalance": 24000
}
```

### Sell Shares
```http
POST /trade/sell
Authorization: Bearer <token>
Content-Type: application/json

{
  "positionId": "uuid",
  "sharesToSell": 1000
}
```

**Response:**
```json
{
  "success": true,
  "trade": {
    "id": "uuid",
    "type": "sell",
    "shares": 1000,
    "avgPrice": 0.50,
    "proceeds": 500,
    "fee": 10,
    "netProceeds": 490,
    "timestamp": "2025-12-01T12:00:00.000Z"
  },
  "position": {
    "id": "uuid",
    "shares": 1178.26,
    "status": "open"
  },
  "newBalance": 24490
}
```

---

## Portfolio

### Get Current Portfolio
```http
GET /portfolio?currency=NGN
Authorization: Bearer <token>
```

**Response:**
```json
{
  "rows": [
    {
      "position": {
        "id": "uuid",
        "marketId": "uuid",
        "marketSlug": "nigeria-2027-election-apc-win",
        "marketQuestion": "Will the APC win?",
        "outcome": "YES",
        "shares": 2178.26,
        "stake": 1000,
        "price": 0.45,
        "currency": "NGN",
        "symbol": "₦",
        "timestamp": "2025-12-01T12:00:00.000Z"
      },
      "markPrice": 0.50,
      "markPayout": 1089.13,
      "markProfit": 89.13
    }
  ],
  "summaryByCurrency": [
    {
      "currency": "NGN",
      "symbol": "₦",
      "totalStake": 1000,
      "totalPayout": 1089.13,
      "totalProfit": 89.13
    }
  ]
}
```

### Get Position History
```http
GET /portfolio/history?status=won&limit=20&offset=0
Authorization: Bearer <token>
```

**Query Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| currency | string | Filter by currency |
| status | string | Filter: `won`, `lost`, `sold`, `all` |
| limit | number | Results per page |
| offset | number | Pagination offset |

**Response:**
```json
{
  "positions": [
    {
      "id": "uuid",
      "marketSlug": "afcon-2025-nigeria-winner",
      "marketQuestion": "Will Nigeria win AFCON 2025?",
      "outcome": "YES",
      "shares": 500,
      "stake": 250,
      "payout": 500,
      "profit": 250,
      "status": "won",
      "currency": "NGN",
      "symbol": "₦",
      "settledAt": "2025-02-15T00:00:00.000Z"
    }
  ],
  "total": 5
}
```

---

## Wallet

### Get Supported Currencies
```http
GET /wallet/currencies
```

**Response:**
```json
[
  { "code": "ZAR", "name": "South African Rand", "symbol": "R" },
  { "code": "NGN", "name": "Nigerian Naira", "symbol": "₦" },
  { "code": "KES", "name": "Kenyan Shilling", "symbol": "KSh" },
  { "code": "GHS", "name": "Ghanaian Cedi", "symbol": "GH₵" },
  { "code": "EGP", "name": "Egyptian Pound", "symbol": "E£" },
  { "code": "TZS", "name": "Tanzanian Shilling", "symbol": "TSh" },
  { "code": "UGX", "name": "Ugandan Shilling", "symbol": "USh" },
  { "code": "ZMW", "name": "Zambian Kwacha", "symbol": "ZK" },
  { "code": "XOF", "name": "West African CFA Franc", "symbol": "CFA" },
  { "code": "XAF", "name": "Central African CFA Franc", "symbol": "FCFA" },
  { "code": "MAD", "name": "Moroccan Dirham", "symbol": "MAD" },
  { "code": "ETH", "name": "Ethereum", "symbol": "ETH" },
  { "code": "USDC", "name": "USD Coin", "symbol": "USDC" },
  { "code": "USDT", "name": "Tether", "symbol": "USDT" }
]
```

### Get Balance (Single Currency)
```http
GET /wallet/balance?currency=NGN
Authorization: Bearer <token>
```

**Response:**
```json
{
  "available": 24000,
  "reserved": 1000,
  "total": 25000,
  "currency": "NGN",
  "symbol": "₦"
}
```

### Get All Balances
```http
GET /wallet/balances
Authorization: Bearer <token>
```

**Response:**
```json
[
  {
    "currency": "NGN",
    "symbol": "₦",
    "available": 24000,
    "reserved": 1000,
    "total": 25000
  },
  {
    "currency": "USDC",
    "symbol": "USDC",
    "available": 100,
    "reserved": 0,
    "total": 100
  }
]
```

### Get Transactions
```http
GET /wallet/transactions?currency=NGN&type=trade&limit=50&offset=0
Authorization: Bearer <token>
```

**Query Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| currency | string | Filter by currency |
| type | string | Filter: `deposit`, `withdrawal`, `trade`, `trade_payout`, `fee` |
| limit | number | Results per page |
| offset | number | Pagination offset |

**Response:**
```json
{
  "transactions": [
    {
      "id": "uuid",
      "type": "trade",
      "amount": -1020,
      "currency": "NGN",
      "symbol": "₦",
      "description": "Buy YES shares - Nigeria 2027 Election",
      "createdAt": "2025-12-01T12:00:00.000Z"
    }
  ],
  "total": 25
}
```

### Deposit (Fiat)
```http
POST /wallet/deposit
Authorization: Bearer <token>
Content-Type: application/json

{
  "amount": 10000,
  "currency": "NGN",
  "method": "bank"
}
```

**Response (Bank):**
```json
{
  "transactionId": "uuid",
  "method": "bank",
  "amount": 10000,
  "currency": "NGN",
  "symbol": "₦",
  "status": "pending",
  "bankDetails": {
    "bankName": "First Bank",
    "accountNumber": "1234567890",
    "accountName": "AfricaPredicts Ltd",
    "reference": "DEP-ABC123"
  },
  "expiresAt": "2025-12-02T12:00:00.000Z"
}
```

### Withdraw
```http
POST /wallet/withdraw
Authorization: Bearer <token>
Content-Type: application/json

{
  "amount": 5000,
  "currency": "NGN",
  "method": "bank",
  "bankDetails": {
    "bankName": "GTBank",
    "accountNumber": "0123456789",
    "accountName": "John Doe"
  }
}
```

**Response:**
```json
{
  "transactionId": "uuid",
  "status": "pending",
  "amount": 5000,
  "currency": "NGN",
  "symbol": "₦",
  "estimatedArrival": "2025-12-03T12:00:00.000Z",
  "newBalance": 19000
}
```

---

## Crypto

### Get Supported Tokens
```http
GET /crypto/tokens
```

**Response:**
```json
[
  {
    "token": "ETH",
    "name": "Ethereum",
    "decimals": 18,
    "contractAddress": null
  },
  {
    "token": "USDC",
    "name": "USD Coin",
    "decimals": 6,
    "contractAddress": "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48"
  },
  {
    "token": "USDT",
    "name": "Tether",
    "decimals": 6,
    "contractAddress": "0xdAC17F958D2ee523a2206206994597C13D831ec7"
  }
]
```

### Get Deposit Address
```http
GET /crypto/deposit-address/ETH
Authorization: Bearer <token>
```

**Response:**
```json
{
  "address": "0x1234567890abcdef...",
  "token": "ETH",
  "network": "Ethereum (Sepolia Testnet)",
  "minConfirmations": 12,
  "isTestnet": true,
  "note": "Only send ETH to this address on the Sepolia network"
}
```

### Get All Deposit Addresses
```http
GET /crypto/deposit-addresses
Authorization: Bearer <token>
```

**Response:**
```json
{
  "ETH": {
    "address": "0x1234...",
    "network": "Ethereum (Sepolia)"
  },
  "USDC": {
    "address": "0x1234...",
    "network": "Ethereum (Sepolia)"
  },
  "USDT": {
    "address": "0x1234...",
    "network": "Ethereum (Sepolia)"
  }
}
```

### Get Pending Deposits
```http
GET /crypto/deposits/pending
Authorization: Bearer <token>
```

**Response:**
```json
[
  {
    "id": "uuid",
    "txHash": "0xabc123...",
    "token": "ETH",
    "amount": 0.5,
    "confirmations": 6,
    "requiredConfirmations": 12,
    "status": "pending",
    "createdAt": "2025-12-01T12:00:00.000Z"
  }
]
```

### Get Deposit History
```http
GET /crypto/deposits/history?limit=20&offset=0
Authorization: Bearer <token>
```

**Response:**
```json
{
  "deposits": [
    {
      "id": "uuid",
      "txHash": "0xabc123...",
      "token": "ETH",
      "amount": 0.5,
      "status": "credited",
      "creditedAt": "2025-12-01T12:30:00.000Z"
    }
  ],
  "total": 5
}
```

---

## Users

### Get Profile
```http
GET /users/me
Authorization: Bearer <token>
```

**Response:**
```json
{
  "id": "uuid",
  "email": "user@example.co.za",
  "name": "John Doe",
  "role": "user",
  "kycStatus": "verified",
  "defaultCurrency": "ZAR",
  "createdAt": "2025-01-01T00:00:00.000Z",
  "lastLoginAt": "2025-12-01T12:00:00.000Z",
  "balances": [
    {
      "currency": "ZAR",
      "symbol": "R",
      "available": 25000,
      "reserved": 0,
      "total": 25000
    }
  ],
  "riskSettings": [
    {
      "currency": "ZAR",
      "symbol": "R",
      "maxStake": 10000,
      "maxDailyVolume": 50000
    }
  ]
}
```

### Update Profile
```http
PATCH /users/me
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "John Doe",
  "defaultCurrency": "NGN"
}
```

### Update Risk Settings
```http
PATCH /users/me/risk-settings
Authorization: Bearer <token>
Content-Type: application/json

{
  "currency": "NGN",
  "maxStake": 5000,
  "maxDailyVolume": 25000
}
```

### Export User Data (GDPR)
```http
GET /users/me/export
Authorization: Bearer <token>
```

### Delete Account
```http
DELETE /users/me
Authorization: Bearer <token>
```

**Response:**
```json
{
  "success": true,
  "message": "Account scheduled for deletion",
  "retentionNotice": "Your data will be retained for 30 days for regulatory compliance"
}
```

---

## Admin Endpoints

Admin endpoints require `role: admin` in the JWT token.

### Markets Management

#### List All Markets (Admin)
```http
GET /admin/markets
Authorization: Bearer <admin-token>
```

#### Create Market
```http
POST /admin/markets
Authorization: Bearer <admin-token>
Content-Type: application/json

{
  "slug": "new-market-slug",
  "question": "Will X happen?",
  "description": "Detailed description...",
  "category": "Politics",
  "currency": "NGN",
  "closesAt": "2025-12-31T23:59:59.000Z",
  "yesPrice": 0.50,
  "noPrice": 0.50
}
```

#### Update Market
```http
PATCH /admin/markets/:id
Authorization: Bearer <admin-token>
Content-Type: application/json

{
  "description": "Updated description",
  "status": "open"
}
```

#### Update Prices
```http
PATCH /admin/markets/:id/prices
Authorization: Bearer <admin-token>
Content-Type: application/json

{
  "yesPrice": 0.60,
  "reason": "Market sentiment shift"
}
```

#### Resolve Market
```http
POST /admin/markets/:id/resolve
Authorization: Bearer <admin-token>
Content-Type: application/json

{
  "winningOutcome": "YES",
  "resolutionNotes": "Official results announced"
}
```

### Settlement Management

#### Get Resolution Queue
```http
GET /admin/settlement/queue
Authorization: Bearer <admin-token>
```

**Response:**
```json
{
  "count": 3,
  "markets": [
    {
      "id": "uuid",
      "slug": "market-slug",
      "question": "Market question?",
      "category": "Politics",
      "currency": "NGN",
      "symbol": "₦",
      "closesAt": "2025-12-01T00:00:00.000Z",
      "closedForHours": 24.5,
      "volume": 150000,
      "positionCount": 25,
      "totalStaked": 50000,
      "yesStaked": 30000,
      "noStaked": 20000,
      "status": "awaiting_resolution"
    }
  ]
}
```

#### Get Settlement Stats
```http
GET /admin/settlement/stats
Authorization: Bearer <admin-token>
```

**Response:**
```json
{
  "marketsAwaitingResolution": 3,
  "marketsResolvedToday": 2,
  "marketsResolvedThisWeek": 8,
  "totalPayoutsToday": 125000,
  "totalPayoutsThisWeek": 450000
}
```

#### Preview Settlement
```http
GET /admin/settlement/preview/:id?outcome=YES
Authorization: Bearer <admin-token>
```

**Response:**
```json
{
  "market": {
    "id": "uuid",
    "slug": "market-slug",
    "question": "Market question?",
    "currency": "NGN",
    "symbol": "₦"
  },
  "proposedOutcome": "YES",
  "summary": {
    "totalPositions": 25,
    "winnersCount": 15,
    "losersCount": 10,
    "totalPayout": 45000,
    "totalStaked": 50000
  },
  "winners": [
    {
      "positionId": "uuid",
      "userId": "uuid",
      "userEmail": "user@example.com",
      "outcome": "YES",
      "stake": 1000,
      "shares": 2000,
      "payout": 2000,
      "profit": 1000
    }
  ],
  "losers": [
    {
      "positionId": "uuid",
      "userId": "uuid",
      "userEmail": "loser@example.com",
      "outcome": "NO",
      "stake": 500,
      "shares": 1000,
      "payout": 0,
      "profit": -500
    }
  ]
}
```

#### Resolve & Settle Market
```http
POST /admin/settlement/resolve/:id
Authorization: Bearer <admin-token>
Content-Type: application/json

{
  "outcome": "YES",
  "notes": "Official results confirmed"
}
```

#### Trigger Settlement Check
```http
POST /admin/settlement/trigger-check
Authorization: Bearer <admin-token>
```

### Crypto Management

#### List All Deposits
```http
GET /admin/crypto/deposits?status=pending&token=ETH&limit=50
Authorization: Bearer <admin-token>
```

#### Get Deposit Stats
```http
GET /admin/crypto/deposits/stats
Authorization: Bearer <admin-token>
```

#### Manual Credit Deposit
```http
POST /admin/crypto/deposits/:id/credit
Authorization: Bearer <admin-token>
```

#### List Withdrawals
```http
GET /admin/crypto/withdrawals?status=pending
Authorization: Bearer <admin-token>
```

#### Approve Withdrawal
```http
POST /admin/crypto/withdrawals/:id/approve
Authorization: Bearer <admin-token>
Content-Type: application/json

{
  "notes": "Verified and approved"
}
```

#### Reject Withdrawal
```http
POST /admin/crypto/withdrawals/:id/reject
Authorization: Bearer <admin-token>
Content-Type: application/json

{
  "reason": "Suspicious activity detected"
}
```

#### Complete Withdrawal
```http
POST /admin/crypto/withdrawals/:id/complete
Authorization: Bearer <admin-token>
Content-Type: application/json

{
  "txHash": "0xabc123..."
}
```

---

## Common Patterns

### Pagination
All list endpoints support pagination:
```
?limit=20&offset=0
```

Response includes:
```json
{
  "items": [...],
  "total": 100,
  "limit": 20,
  "offset": 0
}
```

### Idempotency
For critical operations (trades, deposits, withdrawals), use idempotency keys:
```json
{
  "idempotencyKey": "unique-uuid-per-request"
}
```

### Currency Formatting
- Fiat amounts are in minor units (cents, kobo, etc.)
- Crypto amounts use native decimals (ETH: 18, USDC/USDT: 6)
- Always use the `symbol` field for display

### Rate Limiting
- 100 requests per minute for authenticated users
- 20 requests per minute for unauthenticated endpoints
- 429 status code when exceeded

---

## Error Handling

### Error Response Format
```json
{
  "success": false,
  "error": "Error message",
  "code": "ERROR_CODE",
  "requestId": "uuid",
  "timestamp": "2025-12-01T12:00:00.000Z"
}
```

### Common Error Codes
| Code | HTTP Status | Description |
|------|-------------|-------------|
| `UNAUTHORIZED` | 401 | Missing or invalid token |
| `FORBIDDEN` | 403 | Insufficient permissions |
| `NOT_FOUND` | 404 | Resource not found |
| `VALIDATION_ERROR` | 400 | Invalid request body |
| `INSUFFICIENT_BALANCE` | 400 | Not enough funds |
| `MARKET_CLOSED` | 400 | Market not accepting trades |
| `RATE_LIMITED` | 429 | Too many requests |
| `INTERNAL_ERROR` | 500 | Server error |

---

## Frontend Integration Guide

### Recommended Architecture

```
src/
├── api/
│   ├── client.ts          # Axios instance with interceptors
│   ├── auth.api.ts         # Auth endpoints
│   ├── markets.api.ts      # Markets endpoints
│   ├── trading.api.ts      # Trading endpoints
│   ├── portfolio.api.ts    # Portfolio endpoints
│   ├── wallet.api.ts       # Wallet endpoints
│   └── crypto.api.ts       # Crypto endpoints
├── hooks/
│   ├── useAuth.ts          # Auth state management
│   ├── useMarkets.ts       # Markets queries
│   ├── useTrade.ts         # Trade mutations
│   └── useWallet.ts        # Wallet queries
├── stores/
│   ├── authStore.ts        # Auth state (Zustand)
│   └── currencyStore.ts    # Currency preferences
└── utils/
    ├── currency.ts         # Currency formatting
    └── validation.ts       # Form validation
```

### API Client Setup (Axios)

```typescript
import axios from 'axios';

const api = axios.create({
  baseURL: 'https://sa-api-server-1.replit.app/api/v1',
  timeout: 30000,
});

// Request interceptor - add auth token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor - handle errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;
```

### React Query Integration

```typescript
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from './client';

// Markets hook
export const useMarkets = (filters?: MarketFilters) => {
  return useQuery({
    queryKey: ['markets', filters],
    queryFn: () => api.get('/markets', { params: filters }),
    staleTime: 30000, // 30 seconds
  });
};

// Trade mutation with optimistic update
export const useBuyTrade = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: BuyTradeDto) => api.post('/trade/buy', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['portfolio'] });
      queryClient.invalidateQueries({ queryKey: ['wallet'] });
    },
  });
};
```

### Currency Formatting Utility

```typescript
const CURRENCY_CONFIG = {
  ZAR: { symbol: 'R', decimals: 2 },
  NGN: { symbol: '₦', decimals: 2 },
  KES: { symbol: 'KSh', decimals: 2 },
  GHS: { symbol: 'GH₵', decimals: 2 },
  ETH: { symbol: 'ETH', decimals: 6 },
  USDC: { symbol: 'USDC', decimals: 2 },
  USDT: { symbol: 'USDT', decimals: 2 },
};

export const formatCurrency = (amount: number, currency: string): string => {
  const config = CURRENCY_CONFIG[currency] || { symbol: currency, decimals: 2 };
  return `${config.symbol}${amount.toLocaleString(undefined, {
    minimumFractionDigits: config.decimals,
    maximumFractionDigits: config.decimals,
  })}`;
};
```

### WalletConnect Integration

```typescript
import { createWeb3Modal } from '@web3modal/wagmi/react';
import { SiweMessage } from 'siwe';

// Get challenge from API
const getChallenge = async (address: string) => {
  const { data } = await api.post('/auth/wallet/challenge', { address });
  return data;
};

// Sign and verify
const signIn = async (address: string) => {
  const challenge = await getChallenge(address);
  
  const signature = await signMessage({ message: challenge.message });
  
  const { data } = await api.post('/auth/wallet/verify', {
    message: challenge.message,
    signature,
  });
  
  localStorage.setItem('token', data.token);
  return data.user;
};
```

### Real-time Updates (Polling Strategy)

```typescript
// Poll for market price updates
export const useMarketPrices = (marketId: string) => {
  return useQuery({
    queryKey: ['market', marketId, 'prices'],
    queryFn: () => api.get(`/markets/${marketId}`),
    refetchInterval: 10000, // 10 seconds
    refetchIntervalInBackground: false,
  });
};

// Poll for pending crypto deposits
export const usePendingDeposits = () => {
  return useQuery({
    queryKey: ['crypto', 'pending'],
    queryFn: () => api.get('/crypto/deposits/pending'),
    refetchInterval: 30000, // 30 seconds
    enabled: !!localStorage.getItem('token'),
  });
};
```

---

## Health Check

```http
GET /health
```

**Response:**
```json
{
  "status": "ok",
  "timestamp": "2025-12-01T12:00:00.000Z",
  "database": "connected",
  "version": "1.0.0"
}
```

---

## Swagger Documentation

Interactive API documentation is available at:
```
https://sa-api-server-1.replit.app/
```

---

*Last Updated: December 2025*
