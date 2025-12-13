# AfricaPredicts Frontend API Documentation

**Version:** 1.0  
**Last Updated:** December 2024  
**Base URL (Development):** `https://<replit-dev-url>/api/v1`  
**Base URL (Production):** `https://api.africapredicts.com/api/v1`

---

## Table of Contents

1. [Authentication](#authentication)
2. [Request/Response Format](#requestresponse-format)
3. [Error Handling](#error-handling)
4. [Currencies & Tokens](#currencies--tokens)
5. [Public Endpoints](#public-endpoints)
6. [User Endpoints](#user-endpoints)
7. [Markets Endpoints](#markets-endpoints)
8. [Trading Endpoints](#trading-endpoints)
9. [Portfolio Endpoints](#portfolio-endpoints)
10. [Wallet Endpoints](#wallet-endpoints)
11. [Crypto Endpoints](#crypto-endpoints)
12. [Admin Endpoints](#admin-endpoints)
13. [Common Issues & Solutions](#common-issues--solutions)

---

## Authentication

The API supports two authentication methods:

### 1. Email OTP Authentication

**Request OTP:**
```http
POST /auth/request-otp
Content-Type: application/json

{
  "email": "user@example.com"
}
```

**Response:**
```json
{
  "success": true,
  "message": "OTP sent to user@example.com"
}
```

**Verify OTP:**
```http
POST /auth/verify-otp
Content-Type: application/json

{
  "email": "user@example.com",
  "otp": "123456"
}
```

**Response:**
```json
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "user": {
    "id": "uuid-here",
    "email": "user@example.com",
    "role": "user",
    "displayName": null,
    "defaultCurrency": "ZAR",
    "createdAt": "2024-12-01T00:00:00.000Z"
  }
}
```

### 2. WalletConnect (SIWE) Authentication

**Get Challenge:**
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
  "nonce": "abc123"
}
```

**Verify Signature:**
```http
POST /auth/wallet/verify
Content-Type: application/json

{
  "message": "africapredicts.com wants you to sign in...",
  "signature": "0xsignature..."
}
```

**Response:**
```json
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "user": {
    "id": "uuid-here",
    "email": null,
    "walletAddress": "0x1234567890abcdef...",
    "role": "user",
    "defaultCurrency": "ZAR"
  }
}
```

### Using the Token

Include the JWT token in the `Authorization` header for all authenticated requests:

```http
Authorization: Bearer eyJhbGciOiJIUzI1NiIs...
```

### Get Current User

```http
GET /auth/me
Authorization: Bearer <token>
```

**Response:**
```json
{
  "id": "uuid-here",
  "email": "user@example.com",
  "role": "user",
  "displayName": "John Doe",
  "defaultCurrency": "ZAR",
  "walletAddress": null,
  "createdAt": "2024-12-01T00:00:00.000Z"
}
```

### Logout

```http
POST /auth/logout
Authorization: Bearer <token>
```

---

## Request/Response Format

### Date Format

**CRITICAL:** All dates must be sent in **ISO 8601 format**.

| Correct | Incorrect |
|---------|-----------|
| `2025-12-17T15:29:00Z` | `12/17/2025, 03:29 PM` |
| `2025-12-17T15:29:00.000Z` | `Dec 17, 2025` |

**JavaScript conversion:**
```javascript
// From date picker to API format
const isoDate = new Date(datePickerValue).toISOString();

// Example
const closesAt = new Date("2025-12-17T15:29:00").toISOString();
// Result: "2025-12-17T15:29:00.000Z"
```

### Decimal/Number Format

- Prices are returned as numbers (0.01 to 0.99)
- Currency amounts are returned as numbers
- Send numbers, not strings, in request bodies

### Standard Success Response

```json
{
  "success": true,
  "data": { ... }
}
```

### Standard Error Response

```json
{
  "success": false,
  "error": {
    "code": 4001,
    "message": "Human readable message",
    "details": { ... },
    "requestId": "uuid-for-debugging",
    "timestamp": "2024-12-01T00:00:00.000Z",
    "path": "/api/v1/endpoint"
  }
}
```

---

## Error Handling

### HTTP Status Codes

| Code | Meaning |
|------|---------|
| 200 | Success |
| 201 | Created |
| 400 | Bad Request - Invalid input |
| 401 | Unauthorized - Missing or invalid token |
| 403 | Forbidden - Insufficient permissions (e.g., not admin) |
| 404 | Not Found |
| 429 | Too Many Requests - Rate limited |
| 500 | Server Error |

### Error Codes

| Code | Description |
|------|-------------|
| 1001 | Validation error |
| 2001 | No authorization header |
| 2002 | Invalid or expired token |
| 2003 | User not found |
| 3001 | Market not found |
| 3002 | Market is closed |
| 3003 | Market already resolved |
| 4001 | Insufficient balance |
| 4002 | Invalid currency |
| 4003 | Trade amount too low |
| 5001 | Position not found |
| 5002 | Insufficient shares |

### Rate Limiting

| Endpoint Type | Limit |
|---------------|-------|
| Authentication | 10 requests/minute |
| Trading | 50 requests/minute |
| Read operations | 300 requests/minute |
| Default | 200 requests/minute |

When rate limited, you'll receive a `429` response with `Retry-After` header.

---

## Currencies & Tokens

### Supported Fiat Currencies

```http
GET /wallet/currencies
```

**Response:**
```json
{
  "currencies": [
    { "code": "ZAR", "name": "South African Rand", "symbol": "R", "isActive": true },
    { "code": "NGN", "name": "Nigerian Naira", "symbol": "₦", "isActive": true },
    { "code": "KES", "name": "Kenyan Shilling", "symbol": "KSh", "isActive": true },
    { "code": "GHS", "name": "Ghanaian Cedi", "symbol": "₵", "isActive": true },
    { "code": "EGP", "name": "Egyptian Pound", "symbol": "E£", "isActive": true },
    { "code": "TZS", "name": "Tanzanian Shilling", "symbol": "TSh", "isActive": true },
    { "code": "UGX", "name": "Ugandan Shilling", "symbol": "USh", "isActive": true },
    { "code": "ZMW", "name": "Zambian Kwacha", "symbol": "ZK", "isActive": true },
    { "code": "XOF", "name": "CFA Franc BCEAO", "symbol": "CFA", "isActive": true },
    { "code": "XAF", "name": "CFA Franc BEAC", "symbol": "FCFA", "isActive": true },
    { "code": "MAD", "name": "Moroccan Dirham", "symbol": "DH", "isActive": true }
  ]
}
```

### Supported Crypto Tokens

```http
GET /crypto/tokens
```

**Response:**
```json
{
  "tokens": [
    { 
      "code": "ETH", 
      "name": "Ethereum", 
      "symbol": "ETH", 
      "network": "sepolia",
      "contractAddress": null,
      "decimals": 18
    },
    { 
      "code": "USDC", 
      "name": "USD Coin", 
      "symbol": "USDC", 
      "network": "sepolia",
      "contractAddress": "0x1c7D4B196Cb0C7B01d743Fbc6116a902379C7238",
      "decimals": 6
    },
    { 
      "code": "USDT", 
      "name": "Tether", 
      "symbol": "USDT", 
      "network": "sepolia",
      "contractAddress": "0x7169D38820dfd117C3FA1f22a697dBA58d90BA06",
      "decimals": 6
    }
  ]
}
```

---

## Public Endpoints

These endpoints don't require authentication.

### List Markets

```http
GET /markets?status=open&category=Politics&currency=ZAR&limit=20&offset=0
```

**Query Parameters:**

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| status | string | `open` | Filter: `draft`, `open`, `closed`, `resolved` |
| category | string | - | Filter: `Politics`, `Civics`, `Sports`, `Culture` |
| currency | string | - | Filter by currency code |
| limit | number | 20 | Results per page (1-100) |
| offset | number | 0 | Pagination offset |

**Response:**
```json
{
  "markets": [
    {
      "id": "uuid-here",
      "slug": "will-cyril-complete-term",
      "question": "Will Cyril complete his term?",
      "description": "Resolution criteria...",
      "category": "Politics",
      "status": "open",
      "currency": "ZAR",
      "symbol": "R",
      "yesPrice": 0.65,
      "noPrice": 0.35,
      "volume": 50000,
      "liquidity": 10000,
      "closesAt": "2026-12-31T23:59:59.000Z",
      "createdAt": "2024-12-01T00:00:00.000Z"
    }
  ],
  "total": 50,
  "limit": 20,
  "offset": 0
}
```

### Get Market Detail

```http
GET /markets/:slug
```

**Response:**
```json
{
  "id": "uuid-here",
  "slug": "will-cyril-complete-term",
  "question": "Will Cyril complete his term?",
  "description": "Resolution criteria...",
  "category": "Politics",
  "status": "open",
  "currency": "ZAR",
  "symbol": "R",
  "yesPrice": 0.65,
  "noPrice": 0.35,
  "volume": 50000,
  "liquidity": 10000,
  "imageUrl": "/images/markets/cyril.jpg",
  "closesAt": "2026-12-31T23:59:59.000Z",
  "resolvedAt": null,
  "winningOutcome": null,
  "resolutionNotes": null,
  "createdAt": "2024-12-01T00:00:00.000Z"
}
```

### Get Order Book

```http
GET /markets/:slug/orderbook
```

**Response:**
```json
{
  "bids": [
    { "price": 0.64, "size": 100, "total": 64 },
    { "price": 0.63, "size": 200, "total": 126 }
  ],
  "asks": [
    { "price": 0.66, "size": 150, "total": 99 },
    { "price": 0.67, "size": 100, "total": 67 }
  ],
  "spread": 0.02,
  "currency": "ZAR",
  "symbol": "R"
}
```

### Get Recent Trades

```http
GET /markets/:slug/trades?limit=10
```

**Response:**
```json
{
  "trades": [
    {
      "id": "trade-uuid",
      "side": "YES",
      "price": 0.65,
      "stake": 100,
      "shares": 153.85,
      "currency": "ZAR",
      "symbol": "R",
      "timestamp": "2024-12-01T12:00:00.000Z"
    }
  ],
  "currency": "ZAR",
  "symbol": "R"
}
```

### Health Check

```http
GET /health
```

**Response:**
```json
{
  "status": "ok",
  "timestamp": "2024-12-01T00:00:00.000Z",
  "version": "1.0.0"
}
```

---

## User Endpoints

All user endpoints require authentication.

### Get Profile

```http
GET /users/me
Authorization: Bearer <token>
```

**Response:**
```json
{
  "id": "uuid-here",
  "email": "user@example.com",
  "displayName": "John Doe",
  "defaultCurrency": "ZAR",
  "walletAddress": null,
  "role": "user",
  "riskSettings": {
    "maxTradeAmount": 10000,
    "dailyLimit": 50000,
    "enableNotifications": true
  },
  "createdAt": "2024-12-01T00:00:00.000Z"
}
```

### Update Profile

```http
PATCH /users/me
Authorization: Bearer <token>
Content-Type: application/json

{
  "displayName": "John Doe",
  "defaultCurrency": "NGN"
}
```

### Update Risk Settings

```http
PATCH /users/me/risk-settings
Authorization: Bearer <token>
Content-Type: application/json

{
  "maxTradeAmount": 10000,
  "dailyLimit": 50000,
  "enableNotifications": true
}
```

### Export Account Data

```http
GET /users/me/export
Authorization: Bearer <token>
```

Returns a JSON file with all user data (GDPR compliant).

### Delete Account

```http
DELETE /users/me
Authorization: Bearer <token>
```

---

## Markets Endpoints

### Trading on Markets

See [Trading Endpoints](#trading-endpoints) below.

---

## Trading Endpoints

All trading endpoints require authentication.

### Preview Trade

Get estimated shares before executing a trade.

```http
POST /trade/preview
Authorization: Bearer <token>
Content-Type: application/json

{
  "marketId": "market-uuid",
  "side": "YES",
  "stake": 100,
  "currency": "ZAR"
}
```

**Response:**
```json
{
  "marketId": "market-uuid",
  "side": "YES",
  "stake": 100,
  "currency": "ZAR",
  "symbol": "R",
  "pricePerShare": 0.65,
  "estimatedShares": 151.52,
  "fee": 2,
  "feePercentage": 0.02,
  "totalCost": 102,
  "potentialPayout": 151.52,
  "potentialProfit": 49.52
}
```

### Buy Shares

```http
POST /trade/buy
Authorization: Bearer <token>
Content-Type: application/json

{
  "marketId": "market-uuid",
  "side": "YES",
  "stake": 100,
  "currency": "ZAR"
}
```

**Response:**
```json
{
  "success": true,
  "trade": {
    "id": "trade-uuid",
    "marketId": "market-uuid",
    "side": "YES",
    "stake": 100,
    "shares": 151.52,
    "pricePerShare": 0.65,
    "fee": 2,
    "currency": "ZAR",
    "createdAt": "2024-12-01T12:00:00.000Z"
  },
  "position": {
    "id": "position-uuid",
    "shares": 151.52,
    "avgPrice": 0.65,
    "currentValue": 98.49
  },
  "newBalance": 898
}
```

### Sell Shares

```http
POST /trade/sell
Authorization: Bearer <token>
Content-Type: application/json

{
  "positionId": "position-uuid",
  "shares": 50
}
```

**Validation:**
- `shares` must be a positive number
- `shares` must be finite (not NaN or Infinity)
- `shares` must not exceed position's available shares

**Response:**
```json
{
  "success": true,
  "trade": {
    "id": "trade-uuid",
    "side": "YES",
    "shares": 50,
    "pricePerShare": 0.70,
    "proceeds": 33.32,
    "fee": 0.68,
    "currency": "ZAR"
  },
  "position": {
    "id": "position-uuid",
    "remainingShares": 101.52,
    "currentValue": 71.06
  },
  "newBalance": 931.32
}
```

---

## Portfolio Endpoints

All portfolio endpoints require authentication.

### Get Portfolio

```http
GET /portfolio?currency=ZAR
Authorization: Bearer <token>
```

**Query Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| currency | string | Filter by currency |

**Response:**
```json
{
  "positions": [
    {
      "id": "position-uuid",
      "market": {
        "id": "market-uuid",
        "slug": "will-cyril-complete-term",
        "question": "Will Cyril complete his term?",
        "status": "open",
        "yesPrice": 0.70,
        "noPrice": 0.30
      },
      "side": "YES",
      "shares": 151.52,
      "avgPrice": 0.65,
      "currentPrice": 0.70,
      "currentValue": 106.06,
      "costBasis": 98.49,
      "unrealizedPnL": 7.57,
      "unrealizedPnLPercent": 7.69,
      "currency": "ZAR",
      "symbol": "R"
    }
  ],
  "summary": {
    "totalValue": 1500.50,
    "totalCostBasis": 1350.00,
    "totalUnrealizedPnL": 150.50,
    "positionCount": 5
  }
}
```

### Get Portfolio History

```http
GET /portfolio/history?days=30
Authorization: Bearer <token>
```

**Response:**
```json
{
  "history": [
    {
      "date": "2024-12-01",
      "totalValue": 1500.50,
      "dailyPnL": 25.00
    }
  ]
}
```

---

## Wallet Endpoints

All wallet endpoints require authentication.

### Get Balance (Single Currency)

```http
GET /wallet/balance?currency=ZAR
Authorization: Bearer <token>
```

**Response:**
```json
{
  "currency": "ZAR",
  "symbol": "R",
  "available": 1000.00,
  "reserved": 50.00,
  "total": 1050.00
}
```

### Get All Balances

```http
GET /wallet/balances
Authorization: Bearer <token>
```

**Response:**
```json
{
  "balances": [
    {
      "currency": "ZAR",
      "symbol": "R",
      "available": 1000.00,
      "reserved": 50.00,
      "total": 1050.00
    },
    {
      "currency": "ETH",
      "symbol": "ETH",
      "available": 0.5,
      "reserved": 0,
      "total": 0.5
    }
  ]
}
```

### Get Transaction History

```http
GET /wallet/transactions?currency=ZAR&limit=20&offset=0
Authorization: Bearer <token>
```

**Response:**
```json
{
  "transactions": [
    {
      "id": "txn-uuid",
      "type": "deposit",
      "amount": 1000,
      "currency": "ZAR",
      "symbol": "R",
      "status": "completed",
      "description": "Bank deposit",
      "createdAt": "2024-12-01T00:00:00.000Z"
    },
    {
      "id": "txn-uuid-2",
      "type": "trade",
      "amount": -100,
      "currency": "ZAR",
      "symbol": "R",
      "status": "completed",
      "description": "Bought YES shares in 'Will Cyril complete term?'",
      "relatedId": "trade-uuid",
      "createdAt": "2024-12-01T12:00:00.000Z"
    }
  ],
  "total": 25,
  "limit": 20,
  "offset": 0
}
```

### Deposit (Fiat - for testing)

```http
POST /wallet/deposit
Authorization: Bearer <token>
Content-Type: application/json

{
  "amount": 1000,
  "currency": "ZAR",
  "idempotencyKey": "unique-request-id"
}
```

**Note:** The `idempotencyKey` prevents duplicate deposits if the request is retried.

### Withdraw

```http
POST /wallet/withdraw
Authorization: Bearer <token>
Content-Type: application/json

{
  "amount": 500,
  "currency": "ZAR",
  "destination": "bank-account-details"
}
```

---

## Crypto Endpoints

All crypto endpoints require authentication.

### Get Deposit Address

Get a unique deposit address for a specific token.

```http
GET /crypto/deposit-address/:token
Authorization: Bearer <token>
```

**Example:** `GET /crypto/deposit-address/ETH`

**Response:**
```json
{
  "token": "ETH",
  "address": "0x1234567890abcdef1234567890abcdef12345678",
  "network": "sepolia",
  "minDeposit": "0.001",
  "confirmationsRequired": 12
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
  "addresses": [
    {
      "token": "ETH",
      "address": "0x1234...",
      "network": "sepolia"
    },
    {
      "token": "USDC",
      "address": "0x1234...",
      "network": "sepolia"
    },
    {
      "token": "USDT",
      "address": "0x1234...",
      "network": "sepolia"
    }
  ]
}
```

**Note:** All tokens share the same address per user (HD wallet derived).

### Get Pending Deposits

```http
GET /crypto/deposits/pending
Authorization: Bearer <token>
```

**Response:**
```json
{
  "deposits": [
    {
      "id": "deposit-uuid",
      "token": "ETH",
      "amount": "0.5",
      "txHash": "0xabc123...",
      "confirmations": 8,
      "requiredConfirmations": 12,
      "status": "pending",
      "createdAt": "2024-12-01T12:00:00.000Z"
    }
  ]
}
```

### Get Deposit History

```http
GET /crypto/deposits/history?limit=20
Authorization: Bearer <token>
```

**Response:**
```json
{
  "deposits": [
    {
      "id": "deposit-uuid",
      "token": "ETH",
      "amount": "0.5",
      "txHash": "0xabc123...",
      "status": "credited",
      "creditedAt": "2024-12-01T12:30:00.000Z",
      "createdAt": "2024-12-01T12:00:00.000Z"
    }
  ],
  "total": 5
}
```

---

## Admin Endpoints

All admin endpoints require authentication with `role: "admin"`.

### Markets Management

#### List All Markets (Admin)

```http
GET /admin/markets?status=draft&category=Politics
Authorization: Bearer <admin-token>
```

**Query Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| status | string | Optional: `draft`, `open`, `closed`, `resolved`, `awaiting_resolution` |
| category | string | Optional: `Politics`, `Civics`, `Sports`, `Culture` |

**Note:** If no parameters provided, returns ALL markets (no default filter).

**Response:**
```json
[
  {
    "id": "market-uuid",
    "slug": "will-cyril-complete-term",
    "question": "Will Cyril complete his term?",
    "status": "draft",
    "category": "Politics",
    "currency": "ZAR",
    "yesPrice": 0.50,
    "noPrice": 0.50,
    "closesAt": "2026-12-31T23:59:59.000Z",
    "createdAt": "2024-12-01T00:00:00.000Z"
  }
]
```

#### Create Market

```http
POST /admin/markets
Authorization: Bearer <admin-token>
Content-Type: application/json

{
  "slug": "will-cyril-complete-term",
  "question": "Will Cyril complete his term?",
  "description": "Resolution criteria: YES if...",
  "category": "Politics",
  "currency": "ZAR",
  "status": "draft",
  "closesAt": "2026-12-31T23:59:59Z",
  "initialYesPrice": 0.5
}
```

**Required Fields:**

| Field | Type | Validation |
|-------|------|------------|
| slug | string | URL-friendly, unique |
| question | string | The market question |
| category | string | `Politics`, `Civics`, `Sports`, `Culture` |
| closesAt | string | **ISO 8601 format required** |

**Optional Fields:**

| Field | Type | Default | Validation |
|-------|------|---------|------------|
| description | string | null | Resolution criteria |
| currency | string | `ZAR` | Valid currency code |
| status | string | `draft` | `draft` or `open` |
| initialYesPrice | number | 0.5 | 0.01 to 0.99 |
| imageUrl | string | null | Image URL |

#### Update Market

```http
PATCH /admin/markets/:id
Authorization: Bearer <admin-token>
Content-Type: application/json

{
  "question": "Updated question?",
  "status": "open",
  "closesAt": "2026-12-31T23:59:59Z"
}
```

#### Update Prices

```http
PATCH /admin/markets/:id/prices
Authorization: Bearer <admin-token>
Content-Type: application/json

{
  "yesPrice": 0.65,
  "reason": "Updated based on new polling data"
}
```

**Validation:** `yesPrice` must be between 0.01 and 0.99. `noPrice` is automatically calculated as `1 - yesPrice`.

#### Resolve Market

```http
POST /admin/markets/:id/resolve
Authorization: Bearer <admin-token>
Content-Type: application/json

{
  "winningOutcome": "YES",
  "resolutionNotes": "Cyril completed his term as scheduled."
}
```

### Settlement Management

#### Get Settlement Queue

```http
GET /admin/settlement/queue
Authorization: Bearer <admin-token>
```

Returns markets past their closing time that need resolution.

#### Get Settlement Stats

```http
GET /admin/settlement/stats
Authorization: Bearer <admin-token>
```

**Response:**
```json
{
  "pending": 5,
  "resolvedToday": 2,
  "resolvedThisWeek": 10,
  "totalPayouts": 50000
}
```

#### Preview Settlement

```http
GET /admin/settlement/preview/:marketId
Authorization: Bearer <admin-token>
```

**Response:**
```json
{
  "market": {
    "id": "market-uuid",
    "question": "Will Cyril complete his term?",
    "status": "awaiting_resolution"
  },
  "payouts": {
    "YES": {
      "positions": 25,
      "totalShares": 5000,
      "totalPayout": 5000
    },
    "NO": {
      "positions": 15,
      "totalShares": 3000,
      "totalPayout": 0
    }
  }
}
```

#### Resolve and Settle

```http
POST /admin/settlement/resolve/:marketId
Authorization: Bearer <admin-token>
Content-Type: application/json

{
  "winningOutcome": "YES",
  "resolutionNotes": "Resolved based on official announcement."
}
```

### Crypto Administration

#### Get Crypto Stats

```http
GET /admin/crypto/stats
Authorization: Bearer <admin-token>
```

**Response:**
```json
{
  "deposits": {
    "pending": 3,
    "pendingValue": { "ETH": "1.5", "USDC": "500" },
    "credited": 50,
    "totalValue": { "ETH": "25.5", "USDC": "15000" }
  },
  "withdrawals": {
    "pending": 2,
    "pendingValue": { "ETH": "0.5" },
    "completed": 20
  }
}
```

#### List Pending Deposits

```http
GET /admin/crypto/deposits/pending
Authorization: Bearer <admin-token>
```

#### Credit Deposit

```http
POST /admin/crypto/deposits/:id/credit
Authorization: Bearer <admin-token>
```

#### List Pending Withdrawals

```http
GET /admin/crypto/withdrawals/pending
Authorization: Bearer <admin-token>
```

#### Approve Withdrawal

```http
POST /admin/crypto/withdrawals/:id/approve
Authorization: Bearer <admin-token>
```

#### Reject Withdrawal

```http
POST /admin/crypto/withdrawals/:id/reject
Authorization: Bearer <admin-token>
Content-Type: application/json

{
  "reason": "Insufficient verification"
}
```

---

## Common Issues & Solutions

### 1. "Failed to create market" - 400 Bad Request

**Cause:** Date format is incorrect.

**Solution:** Send dates in ISO 8601 format:
```javascript
// Wrong
closesAt: "12/17/2025, 03:29 PM"

// Correct
closesAt: new Date("2025-12-17T15:29:00").toISOString()
// Result: "2025-12-17T15:29:00.000Z"
```

### 2. Markets created but not showing

**Cause:** Markets are created with `status: "draft"` by default.

**Solution:** 
- Either pass `status: "open"` when creating
- Or use the "DRAFT" filter to see draft markets
- Or update the market status to "open" after creation

### 3. "Currency not supported" error

**Cause:** Invalid currency code.

**Solution:** Use exact currency codes: `ZAR`, `NGN`, `KES`, `GHS`, `EGP`, `TZS`, `UGX`, `ZMW`, `XOF`, `XAF`, `MAD`, `ETH`, `USDC`, `USDT`

### 4. "Unauthorized" - 401 Error

**Causes:**
- Missing `Authorization` header
- Token expired
- Invalid token format

**Solution:**
```javascript
// Correct header format
headers: {
  'Authorization': `Bearer ${token}`,
  'Content-Type': 'application/json'
}
```

### 5. "Forbidden" - 403 Error

**Cause:** User doesn't have admin role.

**Solution:** Ensure the user's `role` field is `"admin"` in the database.

### 6. Rate Limited - 429 Error

**Cause:** Too many requests.

**Solution:** 
- Check `Retry-After` header
- Implement exponential backoff
- Cache responses where appropriate

### 7. Development vs Production Database

**Important:** The development (Replit) and production databases are separate. Markets created in development won't appear in production until the backend is deployed.

---

## Swagger Documentation

Interactive API documentation is available at:
- **Development:** `https://<replit-url>/`
- **Production:** `https://api.africapredicts.com/`

---

## Support

For API issues, include the `requestId` from error responses when reporting bugs.
