# AfricaPredicts — Backend Architecture Document (BAD)

**Version:** 1.0  
**Date:** November 28, 2025  
**Status:** Web3Auth-First Production Architecture  
**Classification:** Internal Engineering Reference

---

## Table of Contents

### Part I: Foundation
1. [Executive Summary](#1-executive-summary)
2. [Architecture Overview](#2-architecture-overview)
3. [Technology Stack](#3-technology-stack)
4. [Project Phases](#4-project-phases)

### Part II: Phase 1 — Core Backend Foundation (MVP)
5. [Authentication & Identity (Web3Auth-First)](#5-authentication--identity-web3auth-first)
6. [Markets Service](#6-markets-service)
7. [Wallet & Balance Ledger](#7-wallet--balance-ledger)
8. [User Profile & Risk Settings](#8-user-profile--risk-settings)
9. [Notification Settings](#9-notification-settings)
10. [Minimal Admin APIs](#10-minimal-admin-apis)

### Part III: Phase 2 — Trading Engine & Real-Time
11. [Trading Engine](#11-trading-engine)
12. [Positions & Settlement](#12-positions--settlement)
13. [WebSocket Real-Time Infrastructure](#13-websocket-real-time-infrastructure)
14. [Notification Workers](#14-notification-workers)

### Part IV: Phase 3 — Oracle & On-Chain Integration
15. [Market Resolution Oracle](#15-market-resolution-oracle)
16. [Smart Contract Integration](#16-smart-contract-integration)
17. [Advanced Admin & Analytics](#17-advanced-admin--analytics)

### Part V: Infrastructure & Operations
18. [Database Architecture](#18-database-architecture)
19. [Non-Functional Requirements](#19-non-functional-requirements)
20. [DevOps & Environments](#20-devops--environments)
21. [Acceptance Criteria](#21-acceptance-criteria)

---

# PART I: FOUNDATION

---

## 1. Executive Summary

### 1.1 Purpose

This document provides the complete technical architecture for the AfricaPredicts backend server implementation. The backend will replace all frontend mock data with a production-grade system using a **Web3Auth-first authentication model** and deliver a complete trading, market, and wallet backend.

### 1.2 Architecture Principles

| Principle | Implementation |
|-----------|----------------|
| **Web3Auth-First** | Email/social login with MPC wallet generation; SIWE optional for advanced users |
| **Off-Chain First** | Internal ledger for fast trading; on-chain settlement in Phase 3 |
| **API-First** | RESTful APIs with OpenAPI documentation; frontend-agnostic |
| **Event-Driven** | Redis pub/sub for real-time updates and worker coordination |
| **Horizontal Scaling** | Stateless services; Redis for shared state; queue-based workers |

### 1.3 Scope

**In Scope:**
- Web3Auth authentication with MPC wallet provisioning
- Markets service (listings, orderbook, trades, price history)
- Wallet & balance ledger (deposits, withdrawals, internal accounting)
- User profile & risk settings
- Notification system (Telegram, Email, SMS)
- Trading engine with order matching
- Positions tracking & settlement
- Real-time WebSocket infrastructure
- Market resolution oracle service
- Smart contract integration (integration only, not contract development)
- Admin APIs & analytics

**Out of Scope:**
- Mobile apps
- Fiat on-ramp/off-ramp integration
- Smart contract authoring & audits
- Advanced market types (multi-outcome, numeric)
- Full admin UI (beyond minimal endpoints)

---

## 2. Architecture Overview

### 2.1 System Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                              AFRICAPREDICTS BACKEND                              │
└─────────────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────────────┐
│                                  CLIENTS                                         │
│                                                                                  │
│  ┌────────────────┐   ┌────────────────┐   ┌────────────────┐                   │
│  │  Next.js Web   │   │   Mobile App   │   │  Admin Portal  │                   │
│  │   (Frontend)   │   │    (Future)    │   │    (Future)    │                   │
│  └───────┬────────┘   └───────┬────────┘   └───────┬────────┘                   │
│          │                    │                    │                             │
│          └────────────────────┴────────────────────┘                             │
│                               │                                                  │
└───────────────────────────────┼──────────────────────────────────────────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────────────────────────────┐
│                              API GATEWAY LAYER                                   │
│  ┌─────────────────────────────────────────────────────────────────────────┐    │
│  │  • Rate Limiting (IP + Endpoint)                                         │    │
│  │  • Web3Auth Token Verification (JWKS)                                    │    │
│  │  • Request Validation                                                    │    │
│  │  • API Versioning (/api/v1/*)                                            │    │
│  └─────────────────────────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────────────────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────────────────────────────┐
│                              NestJS APPLICATION                                  │
│                                                                                  │
│  ┌───────────────────────────────────────────────────────────────────────────┐  │
│  │                           CORE SERVICES                                    │  │
│  │                                                                            │  │
│  │  ┌────────────┐  ┌────────────┐  ┌────────────┐  ┌────────────────────┐   │  │
│  │  │   Auth     │  │  Markets   │  │   Wallet   │  │  User Profile      │   │  │
│  │  │  Service   │  │  Service   │  │  Service   │  │    Service         │   │  │
│  │  │            │  │            │  │            │  │                    │   │  │
│  │  │ • Web3Auth │  │ • Listings │  │ • Balances │  │ • Profile CRUD     │   │  │
│  │  │ • SIWE     │  │ • Orderbook│  │ • Deposits │  │ • Risk Settings    │   │  │
│  │  │ • Sessions │  │ • Trades   │  │ • Withdraw │  │ • Notifications    │   │  │
│  │  └────────────┘  └────────────┘  └────────────┘  └────────────────────┘   │  │
│  │                                                                            │  │
│  │  ┌────────────┐  ┌────────────┐  ┌────────────┐  ┌────────────────────┐   │  │
│  │  │  Trading   │  │ Positions  │  │   Oracle   │  │     Admin          │   │  │
│  │  │   Engine   │  │  Service   │  │  Service   │  │    Service         │   │  │
│  │  │            │  │            │  │            │  │                    │   │  │
│  │  │ • Orders   │  │ • Holdings │  │ • Resolution│ │ • Market CRUD      │   │  │
│  │  │ • Matching │  │ • P&L      │  │ • Disputes │  │ • User Mgmt        │   │  │
│  │  │ • Fills    │  │ • Claims   │  │ • Data Feed│  │ • Analytics        │   │  │
│  │  └────────────┘  └────────────┘  └────────────┘  └────────────────────┘   │  │
│  │                                                                            │  │
│  └───────────────────────────────────────────────────────────────────────────┘  │
│                                                                                  │
│  ┌───────────────────────────────────────────────────────────────────────────┐  │
│  │                        REAL-TIME LAYER                                     │  │
│  │  ┌─────────────────────────────────┐  ┌─────────────────────────────────┐ │  │
│  │  │      WebSocket Gateway          │  │     Event Emitter               │ │  │
│  │  │  • marketPriceUpdate            │  │  • Trade Events                 │ │  │
│  │  │  • orderBookUpdate              │  │  • Balance Updates              │ │  │
│  │  │  • recentTradesUpdate           │  │  • Notification Triggers        │ │  │
│  │  └─────────────────────────────────┘  └─────────────────────────────────┘ │  │
│  └───────────────────────────────────────────────────────────────────────────┘  │
│                                                                                  │
└─────────────────────────────────────────────────────────────────────────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────────────────────────────┐
│                              DATA LAYER                                          │
│                                                                                  │
│  ┌────────────────────┐  ┌────────────────────┐  ┌────────────────────────────┐ │
│  │    PostgreSQL      │  │      Redis         │  │      BullMQ               │ │
│  │                    │  │                    │  │                           │ │
│  │  • Users           │  │  • Session Cache   │  │  • Order Matching Queue   │ │
│  │  • Markets         │  │  • Rate Limiting   │  │  • Notification Queue     │ │
│  │  • Orders          │  │  • Orderbook Cache │  │  • Settlement Queue       │ │
│  │  • Trades          │  │  • Pub/Sub Events  │  │  • Oracle Resolution      │ │
│  │  • Positions       │  │  • Lock Manager    │  │                           │ │
│  │  • Balances        │  │                    │  │                           │ │
│  └────────────────────┘  └────────────────────┘  └────────────────────────────┘ │
│                                                                                  │
└─────────────────────────────────────────────────────────────────────────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────────────────────────────┐
│                           EXTERNAL INTEGRATIONS                                  │
│                                                                                  │
│  ┌────────────────┐  ┌────────────────┐  ┌────────────────┐  ┌───────────────┐ │
│  │   Web3Auth     │  │   Blockchain   │  │  Oracle Feeds  │  │  Notification │ │
│  │                │  │    Networks    │  │                │  │   Providers   │ │
│  │  • JWKS Keys   │  │  • Ethereum    │  │  • Chainlink   │  │  • Telegram   │ │
│  │  • User Info   │  │  • Polygon     │  │  • APIs        │  │  • SendGrid   │ │
│  │  • MPC Wallet  │  │  • Arbitrum    │  │  • Scrapers    │  │  • Twilio     │ │
│  └────────────────┘  └────────────────┘  └────────────────┘  └───────────────┘ │
│                                                                                  │
└─────────────────────────────────────────────────────────────────────────────────┘
```

### 2.2 Request Flow

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                          TYPICAL API REQUEST FLOW                                │
└─────────────────────────────────────────────────────────────────────────────────┘

  Client                 API Gateway              Service              Database
    │                        │                       │                     │
    │  1. HTTP Request       │                       │                     │
    │  + Web3Auth Token      │                       │                     │
    ├───────────────────────►│                       │                     │
    │                        │                       │                     │
    │                        │  2. Verify Token      │                     │
    │                        │  (Web3Auth JWKS)      │                     │
    │                        ├──────────────────────►│                     │
    │                        │                       │                     │
    │                        │  3. Rate Limit Check  │                     │
    │                        │  (Redis Counter)      │                     │
    │                        ├──────────────────────►│                     │
    │                        │                       │                     │
    │                        │  4. Route to Service  │                     │
    │                        ├──────────────────────►│                     │
    │                        │                       │                     │
    │                        │                       │  5. Query Data      │
    │                        │                       ├────────────────────►│
    │                        │                       │                     │
    │                        │                       │  6. Response        │
    │                        │                       │◄────────────────────┤
    │                        │                       │                     │
    │                        │  7. Service Response  │                     │
    │                        │◄──────────────────────┤                     │
    │                        │                       │                     │
    │  8. JSON Response      │                       │                     │
    │◄───────────────────────┤                       │                     │
    │                        │                       │                     │
```

---

## 3. Technology Stack

### 3.1 Core Technologies

| Component | Technology | Version | Rationale |
|-----------|------------|---------|-----------|
| **Language** | TypeScript | 5.x | Type safety, modern JS features |
| **Framework** | NestJS | 10.x | Enterprise-grade, modular, decorators |
| **Database** | PostgreSQL | 15.x | ACID transactions, JSON support, proven at scale |
| **ORM** | Prisma | 5.x | Type-safe queries, migrations, excellent DX |
| **Cache** | Redis | 7.x | Session cache, rate limiting, pub/sub |
| **Queue** | BullMQ | 4.x | Redis-backed job queues, reliable |
| **WebSocket** | Socket.io | 4.x | Broad browser support, room management |
| **Blockchain** | Viem | 2.x | TypeScript-first, lightweight, modern |
| **Auth** | Web3Auth | Latest | MPC wallets, social login, email passwordless |

### 3.2 Infrastructure

| Component | Technology | Purpose |
|-----------|------------|---------|
| **Container** | Docker | Consistent deployments |
| **Orchestration** | Kubernetes / ECS | Auto-scaling, health checks |
| **CI/CD** | GitHub Actions | Automated test/build/deploy |
| **Monitoring** | DataDog / Grafana | Metrics, logs, traces |
| **API Docs** | Swagger/OpenAPI | Interactive documentation |

### 3.3 External Services

| Service | Provider | Purpose |
|---------|----------|---------|
| **Auth** | Web3Auth | User authentication, MPC wallets |
| **Email** | SendGrid | Transactional emails, notifications |
| **SMS** | Twilio | SMS notifications |
| **Telegram** | Telegram Bot API | Instant notifications |
| **Oracle Data** | Chainlink, APIs | Market resolution data |

---

## 4. Project Phases

### 4.1 Phase Overview

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                           PROJECT PHASES                                         │
└─────────────────────────────────────────────────────────────────────────────────┘

Phase 1: Core Backend Foundation (MVP)              Phase 2: Trading Engine
┌─────────────────────────────────────────┐        ┌─────────────────────────────┐
│  • Web3Auth Integration                 │        │  • Order Placement          │
│  • Markets API (public)                 │   ───► │  • Order Matching Engine    │
│  • Wallet/Balance Ledger                │        │  • Positions Tracking       │
│  • User Profile & Settings              │        │  • WebSocket Real-Time      │
│  • Notification Config                  │        │  • Notification Workers     │
│  • Minimal Admin                        │        │                             │
└─────────────────────────────────────────┘        └─────────────────────────────┘
         │                                                   │
         │                                                   │
         └─────────────────────┬─────────────────────────────┘
                               │
                               ▼
                      Phase 3: Oracle & On-Chain
                      ┌─────────────────────────────┐
                      │  • Market Resolution Oracle │
                      │  • Settlement Engine        │
                      │  • Smart Contract Integration│
                      │  • Advanced Analytics       │
                      │  • Admin Dashboard APIs     │
                      └─────────────────────────────┘
```

### 4.2 Phase Timeline

| Phase | Duration | Key Deliverables |
|-------|----------|------------------|
| **Phase 1** | 4-6 weeks | Auth, Markets, Wallet, Profile, Basic Admin |
| **Phase 2** | 4-6 weeks | Trading Engine, Positions, WebSockets, Notifications |
| **Phase 3** | 4-6 weeks | Oracle, Settlement, Contracts, Analytics |

---

# PART II: PHASE 1 — CORE BACKEND FOUNDATION (MVP)

---

## 5. Authentication & Identity (Web3Auth-First)

### 5.1 Authentication Architecture

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                       WEB3AUTH-FIRST AUTHENTICATION                              │
└─────────────────────────────────────────────────────────────────────────────────┘

       ┌─────────────────┐                    ┌─────────────────────────────────┐
       │    Frontend     │                    │         Web3Auth SDK            │
       │   (Next.js)     │                    │                                 │
       └────────┬────────┘                    │  • Email Login                  │
                │                             │  • Social Login (Google, etc)  │
                │  1. User clicks login       │  • Passwordless                 │
                ├────────────────────────────►│  • MPC Wallet Generation        │
                │                             └────────────────────────────────┘
                │                                           │
                │                             2. Web3Auth authenticates user
                │                                + generates MPC wallet
                │                                           │
                │◄──────────────────────────────────────────┤
                │  3. Returns ID Token + User Info          │
                │     + Wallet Address                      │
                │                                           │
       ┌────────▼────────┐                                  │
       │    Frontend     │                                  │
       │  stores token   │                                  │
       └────────┬────────┘                                  │
                │                                           │
                │  4. API Request with Bearer Token         │
                ├─────────────────────────────────────────────────────────────►
                │                                           │
                │                              ┌────────────────────────────────┐
                │                              │      AfricaPredicts Backend    │
                │                              │                                │
                │                              │  5. Verify token via JWKS      │
                │                              │  6. Extract user_id, wallet    │
                │                              │  7. Create/fetch user record   │
                │                              │  8. Process request            │
                │◄─────────────────────────────│  9. Return response            │
                │                              └────────────────────────────────┘
```

### 5.2 Web3Auth Configuration

```typescript
// Backend Web3Auth Token Verification
import { JwksClient } from 'jwks-rsa';
import * as jwt from 'jsonwebtoken';

const WEB3AUTH_JWKS_URL = 'https://authjs.web3auth.io/jwks';

interface Web3AuthPayload {
  iat: number;
  iss: string;
  aud: string;
  exp: number;
  email?: string;
  name?: string;
  profileImage?: string;
  verifier: string;
  verifierId: string;
  aggregateVerifier?: string;
  wallets: Array<{
    public_key: string;
    type: string;
    curve: string;
    address?: string;
  }>;
}

@Injectable()
export class Web3AuthService {
  private jwksClient: JwksClient;

  constructor() {
    this.jwksClient = new JwksClient({
      jwksUri: WEB3AUTH_JWKS_URL,
      cache: true,
      cacheMaxAge: 86400000, // 24 hours
    });
  }

  async verifyToken(idToken: string): Promise<Web3AuthPayload> {
    const decodedHeader = jwt.decode(idToken, { complete: true });
    
    if (!decodedHeader || !decodedHeader.header.kid) {
      throw new UnauthorizedException('Invalid token header');
    }

    const key = await this.jwksClient.getSigningKey(decodedHeader.header.kid);
    const signingKey = key.getPublicKey();

    const payload = jwt.verify(idToken, signingKey, {
      algorithms: ['ES256'],
    }) as Web3AuthPayload;

    return payload;
  }

  extractWalletAddress(payload: Web3AuthPayload): string {
    const evmWallet = payload.wallets.find(w => w.type === 'ethereum');
    if (!evmWallet?.address) {
      throw new UnauthorizedException('No EVM wallet found');
    }
    return evmWallet.address;
  }
}
```

### 5.3 User Creation Flow

```typescript
// On first login, create user in database
@Injectable()
export class AuthService {
  async authenticateUser(idToken: string): Promise<AuthResponse> {
    // 1. Verify Web3Auth token
    const payload = await this.web3AuthService.verifyToken(idToken);
    
    // 2. Extract wallet address
    const walletAddress = this.web3AuthService.extractWalletAddress(payload);
    
    // 3. Find or create user
    let user = await this.prisma.user.findUnique({
      where: { walletAddress: walletAddress.toLowerCase() }
    });

    if (!user) {
      user = await this.prisma.user.create({
        data: {
          walletAddress: walletAddress.toLowerCase(),
          web3authUserId: payload.verifierId,
          authProvider: 'web3auth',
          email: payload.email,
          displayName: payload.name,
          profileImage: payload.profileImage,
          createdAt: new Date(),
        }
      });

      // Initialize wallet balances
      await this.walletService.initializeBalances(user.id);
    }

    // 4. Generate internal session (optional)
    const sessionToken = await this.createSession(user.id);

    return {
      user: this.toUserDto(user),
      sessionToken,
    };
  }
}
```

### 5.4 Auth Middleware

```typescript
@Injectable()
export class AuthGuard implements CanActivate {
  constructor(private web3AuthService: Web3AuthService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const authHeader = request.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new UnauthorizedException('Missing authorization header');
    }

    const token = authHeader.substring(7);
    
    try {
      const payload = await this.web3AuthService.verifyToken(token);
      const walletAddress = this.web3AuthService.extractWalletAddress(payload);
      
      // Attach user to request
      request.user = await this.prisma.user.findUnique({
        where: { walletAddress: walletAddress.toLowerCase() }
      });

      if (!request.user) {
        throw new UnauthorizedException('User not found');
      }

      return true;
    } catch (error) {
      throw new UnauthorizedException('Invalid token');
    }
  }
}
```

### 5.5 SIWE Support (Optional - Phase 2)

```typescript
// For advanced users with existing wallets
@Post('auth/siwe')
async authenticateWithSIWE(@Body() body: SIWEAuthDto): Promise<AuthResponse> {
  const { message, signature } = body;
  
  // Verify SIWE signature
  const siweMessage = new SiweMessage(message);
  const fields = await siweMessage.verify({ signature });
  
  if (!fields.success) {
    throw new UnauthorizedException('Invalid SIWE signature');
  }

  // Find or create user with SIWE
  let user = await this.prisma.user.findUnique({
    where: { walletAddress: fields.data.address.toLowerCase() }
  });

  if (!user) {
    user = await this.prisma.user.create({
      data: {
        walletAddress: fields.data.address.toLowerCase(),
        authProvider: 'siwe',
        createdAt: new Date(),
      }
    });
    await this.walletService.initializeBalances(user.id);
  }

  const sessionToken = await this.createSession(user.id);
  return { user: this.toUserDto(user), sessionToken };
}
```

### 5.6 Database Schema - Users

```sql
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    wallet_address VARCHAR(42) NOT NULL UNIQUE,
    web3auth_user_id VARCHAR(255),
    auth_provider VARCHAR(20) NOT NULL DEFAULT 'web3auth',  -- 'web3auth' | 'siwe'
    
    -- Profile
    email VARCHAR(255),
    display_name VARCHAR(100),
    profile_image TEXT,
    bio TEXT,
    
    -- Status
    status VARCHAR(20) DEFAULT 'active',  -- 'active' | 'suspended' | 'banned'
    role VARCHAR(20) DEFAULT 'user',      -- 'user' | 'admin' | 'moderator'
    
    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    last_login_at TIMESTAMPTZ,
    
    CONSTRAINT valid_auth_provider CHECK (auth_provider IN ('web3auth', 'siwe'))
);

CREATE INDEX idx_users_wallet ON users(wallet_address);
CREATE INDEX idx_users_web3auth ON users(web3auth_user_id);
CREATE INDEX idx_users_email ON users(email);
```

---

## 6. Markets Service

### 6.1 Markets API Endpoints

```yaml
# PUBLIC ENDPOINTS (no auth required)

GET /api/v1/markets
  Description: List all markets with filtering
  Query Parameters:
    - category: politics, entertainment, sports, business, crypto
    - country: nigeria, kenya, south-africa, egypt, ghana, etc.
    - status: active, paused, resolved, cancelled
    - liquidityTier: Low, Medium, High
    - sort: trending, newest, endingSoon, highestVolume
    - page: number (default: 1)
    - limit: number (default: 20, max: 100)
  Response:
    {
      "markets": [
        {
          "id": "uuid",
          "slug": "nigeria-2027-election",
          "title": "Will Tinubu win the 2027 Nigerian Presidential Election?",
          "description": "Full market description...",
          "category": "politics",
          "country": "nigeria",
          "status": "active",
          "timeline": "Resolves Feb 28, 2027",
          "source": "https://inecnigeria.org",
          "sentiment": 68,
          "liquidityTier": "High",
          "yesPrice": 0.63,
          "noPrice": 0.37,
          "volume24h": 45000,
          "totalVolume": 125000,
          "liquidity": 50000,
          "expiresAt": "2027-02-28T00:00:00Z",
          "createdAt": "2025-11-01T00:00:00Z"
        }
      ],
      "pagination": {
        "page": 1,
        "limit": 20,
        "total": 150,
        "totalPages": 8
      }
    }

GET /api/v1/markets/:slug
  Description: Get single market with full details
  Response:
    {
      "market": {
        "id": "uuid",
        "slug": "nigeria-2027-election",
        "title": "...",
        "description": "...",
        "resolution_criteria": "Market resolves YES if...",
        "category": "politics",
        "country": "nigeria",
        "status": "active",
        "timeline": "Resolves Feb 28, 2027",
        "source": "https://inecnigeria.org",
        "sentiment": 68,
        "liquidityTier": "High",
        
        // Pricing
        "yesPrice": 0.63,
        "noPrice": 0.37,
        "priceChange24h": 0.05,
        
        // Volume
        "volume24h": 45000,
        "totalVolume": 125000,
        "liquidity": 50000,
        
        // Stats
        "participantCount": 234,
        "tradeCount": 1567,
        
        // Dates
        "expiresAt": "2027-02-28T00:00:00Z",
        "createdAt": "2025-11-01T00:00:00Z",
        
        // Admin info (if resolved)
        "resolvedAt": null,
        "resolution": null,
        "resolutionSource": null
      }
    }

GET /api/v1/markets/:slug/orderbook
  Description: Get current order book for market
  Query Parameters:
    - depth: number (default: 10, max: 50)
  Response:
    {
      "marketId": "uuid",
      "lastUpdated": "2025-11-28T10:00:00Z",
      "yes": {
        "bids": [
          { "price": 0.62, "size": 1500, "orders": 3 },
          { "price": 0.61, "size": 2000, "orders": 5 }
        ],
        "asks": [
          { "price": 0.64, "size": 1200, "orders": 2 },
          { "price": 0.65, "size": 1800, "orders": 4 }
        ]
      },
      "no": {
        "bids": [
          { "price": 0.36, "size": 1200, "orders": 2 },
          { "price": 0.35, "size": 1800, "orders": 4 }
        ],
        "asks": [
          { "price": 0.38, "size": 1500, "orders": 3 },
          { "price": 0.39, "size": 2000, "orders": 5 }
        ]
      },
      "spread": {
        "yes": 0.02,
        "no": 0.02
      }
    }

GET /api/v1/markets/:slug/trades
  Description: Get recent trades for market
  Query Parameters:
    - limit: number (default: 50, max: 200)
    - before: timestamp (for pagination)
  Response:
    {
      "trades": [
        {
          "id": "uuid",
          "outcome": "yes",
          "price": 0.63,
          "size": 150,
          "side": "buy",
          "timestamp": "2025-11-28T10:05:23Z"
        }
      ],
      "pagination": {
        "hasMore": true,
        "nextCursor": "2025-11-28T10:00:00Z"
      }
    }

GET /api/v1/markets/:slug/price-history
  Description: Get historical price data for charting
  Query Parameters:
    - interval: 1m, 5m, 15m, 1h, 4h, 1d
    - from: timestamp
    - to: timestamp
  Response:
    {
      "marketId": "uuid",
      "interval": "1h",
      "candles": [
        {
          "timestamp": "2025-11-28T10:00:00Z",
          "yesOpen": 0.60,
          "yesHigh": 0.65,
          "yesLow": 0.58,
          "yesClose": 0.63,
          "volume": 12500
        }
      ]
    }
```

### 6.2 Market Data Generation (MVP)

For MVP, orderbook, trades, and price history may be synthetic:

```typescript
@Injectable()
export class MarketDataService {
  // Generate realistic orderbook based on current price
  generateOrderbook(market: Market, depth: number = 10): OrderBook {
    const yesPrice = market.yesPrice;
    const noPrice = 1 - yesPrice;
    
    return {
      marketId: market.id,
      lastUpdated: new Date(),
      yes: this.generateSide(yesPrice, depth),
      no: this.generateSide(noPrice, depth),
      spread: { yes: 0.02, no: 0.02 }
    };
  }

  private generateSide(midPrice: number, depth: number): OrderBookSide {
    const bids = [];
    const asks = [];
    
    for (let i = 0; i < depth; i++) {
      const bidPrice = Math.max(0.01, midPrice - 0.01 * (i + 1));
      const askPrice = Math.min(0.99, midPrice + 0.01 * (i + 1));
      
      bids.push({
        price: bidPrice,
        size: Math.floor(Math.random() * 5000) + 500,
        orders: Math.floor(Math.random() * 5) + 1
      });
      
      asks.push({
        price: askPrice,
        size: Math.floor(Math.random() * 5000) + 500,
        orders: Math.floor(Math.random() * 5) + 1
      });
    }
    
    return { bids, asks };
  }
}
```

### 6.3 Database Schema - Markets

```sql
CREATE TABLE markets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    slug VARCHAR(255) NOT NULL UNIQUE,
    title VARCHAR(500) NOT NULL,
    description TEXT,
    resolution_criteria TEXT,
    
    -- Classification
    category VARCHAR(50) NOT NULL,
    country VARCHAR(50) NOT NULL,
    tags TEXT[],
    
    -- Status
    status VARCHAR(20) DEFAULT 'active',  -- 'active' | 'paused' | 'resolved' | 'cancelled'
    
    -- Display fields (matching frontend)
    timeline VARCHAR(255),
    source TEXT,
    sentiment INTEGER DEFAULT 50,  -- 0-100
    liquidity_tier VARCHAR(20) DEFAULT 'Medium',  -- 'Low' | 'Medium' | 'High'
    
    -- Pricing (cached from trading engine)
    yes_price DECIMAL(10,4) DEFAULT 0.5000,
    no_price DECIMAL(10,4) DEFAULT 0.5000,
    price_change_24h DECIMAL(10,4) DEFAULT 0,
    
    -- Volume
    volume_24h DECIMAL(20,2) DEFAULT 0,
    total_volume DECIMAL(20,2) DEFAULT 0,
    liquidity DECIMAL(20,2) DEFAULT 0,
    
    -- Stats
    participant_count INTEGER DEFAULT 0,
    trade_count INTEGER DEFAULT 0,
    
    -- Dates
    expires_at TIMESTAMPTZ NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    -- Resolution
    resolved_at TIMESTAMPTZ,
    resolution VARCHAR(20),  -- 'yes' | 'no' | 'invalid'
    resolution_source TEXT,
    resolved_by UUID REFERENCES users(id),
    
    -- Admin
    created_by UUID REFERENCES users(id),
    
    CONSTRAINT valid_category CHECK (category IN ('politics', 'entertainment', 'sports', 'business', 'crypto')),
    CONSTRAINT valid_status CHECK (status IN ('active', 'paused', 'resolved', 'cancelled'))
);

CREATE INDEX idx_markets_slug ON markets(slug);
CREATE INDEX idx_markets_category ON markets(category);
CREATE INDEX idx_markets_country ON markets(country);
CREATE INDEX idx_markets_status ON markets(status);
CREATE INDEX idx_markets_expires ON markets(expires_at);
```

---

## 7. Wallet & Balance Ledger

### 7.1 Ledger Architecture

The backend maintains a centralized ledger for user balances. This enables fast trading without on-chain transactions for every trade.

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                          INTERNAL LEDGER SYSTEM                                  │
└─────────────────────────────────────────────────────────────────────────────────┘

  User Wallet                    Internal Ledger                    Trading Engine
  (MetaMask)                     (PostgreSQL)                       
      │                               │                                   │
      │  1. Deposit USDC             │                                   │
      │  (on-chain tx)               │                                   │
      ├──────────────────────────────►│                                   │
      │                               │                                   │
      │                               │  2. Credit balance               │
      │                               │  (off-chain)                     │
      │                               ├─────────────────────────────────►│
      │                               │                                   │
      │                               │  3. Place orders                 │
      │                               │  (lock funds)                    │
      │                               │◄─────────────────────────────────┤
      │                               │                                   │
      │                               │  4. Execute trades              │
      │                               │  (update balances)               │
      │                               │◄─────────────────────────────────┤
      │                               │                                   │
      │  5. Withdraw USDC            │                                   │
      │  (on-chain tx)               │                                   │
      │◄──────────────────────────────┤                                   │
```

### 7.2 Wallet API Endpoints

```yaml
# AUTHENTICATED ENDPOINTS

GET /api/v1/wallet/state
  Description: Get full wallet state (matches frontend Zustand store)
  Headers: Authorization: Bearer <token>
  Response:
    {
      "isConnected": true,
      "address": "0x1234...abcd",
      "stableBalances": {
        "USDT": "2500.00",
        "USDC": "15000.00"
      },
      "selectedChain": "Polygon",
      "chainBalances": {
        "Polygon": { "USDT": "2500.00", "USDC": "15000.00" },
        "BNB": { "USDT": "0.00", "USDC": "0.00" },
        "Arbitrum": { "USDT": "0.00", "USDC": "0.00" }
      },
      "transactions": [
        {
          "id": "uuid",
          "type": "Deposit",
          "amount": "5000.00",
          "asset": "USDC",
          "chain": "Polygon",
          "status": "Completed",
          "timestamp": "2025-11-28T10:00:00Z",
          "txHash": "0x..."
        }
      ]
    }

GET /api/v1/wallet/balances
  Description: Get user balances
  Headers: Authorization: Bearer <token>
  Response:
    {
      "available": {
        "USDC": "15000.00",
        "USDT": "2500.00"
      },
      "locked": {
        "USDC": "1200.00",
        "USDT": "0.00"
      },
      "total": {
        "USDC": "16200.00",
        "USDT": "2500.00"
      }
    }

POST /api/v1/wallet/deposit
  Description: Create deposit intent
  Headers: Authorization: Bearer <token>
  Request:
    {
      "asset": "USDC",
      "amount": "1000.00",
      "chain": "Polygon"
    }
  Response:
    {
      "depositId": "uuid",
      "vaultAddress": "0x...",
      "asset": "USDC",
      "amount": "1000.00",
      "chain": "Polygon",
      "chainId": 137,
      "tokenAddress": "0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174",
      "status": "pending",
      "expiresAt": "2025-11-28T11:00:00Z"
    }

POST /api/v1/wallet/deposit/confirm
  Description: Confirm deposit after on-chain transaction
  Headers: Authorization: Bearer <token>
  Request:
    {
      "depositId": "uuid",
      "txHash": "0x..."
    }
  Response:
    {
      "depositId": "uuid",
      "status": "confirmed",
      "creditedAmount": "1000.00",
      "newBalance": "16000.00"
    }

POST /api/v1/wallet/withdraw
  Description: Request withdrawal
  Headers: Authorization: Bearer <token>
  Request:
    {
      "asset": "USDC",
      "amount": "500.00",
      "toAddress": "0x...",
      "chain": "Polygon"
    }
  Response:
    {
      "withdrawalId": "uuid",
      "asset": "USDC",
      "amount": "500.00",
      "toAddress": "0x...",
      "status": "pending_signature",
      "signatureRequest": {
        "message": "...",
        "domain": { ... }
      }
    }

POST /api/v1/wallet/withdraw/sign
  Description: Submit EIP-712 signature for withdrawal
  Headers: Authorization: Bearer <token>
  Request:
    {
      "withdrawalId": "uuid",
      "signature": "0x..."
    }
  Response:
    {
      "withdrawalId": "uuid",
      "status": "processing",
      "estimatedCompletion": "2025-11-28T11:00:00Z"
    }

GET /api/v1/wallet/transactions
  Description: Get transaction history
  Headers: Authorization: Bearer <token>
  Query Parameters:
    - type: Deposit, Withdraw, Trade
    - asset: USDT, USDC
    - status: Completed, Pending, Failed
    - limit: number (default: 20)
    - before: timestamp
  Response:
    {
      "transactions": [
        {
          "id": "uuid",
          "type": "Deposit",
          "amount": "1000.00",
          "asset": "USDC",
          "chain": "Polygon",
          "status": "Completed",
          "timestamp": "2025-11-28T10:00:00Z",
          "txHash": "0x..."
        }
      ],
      "pagination": {
        "hasMore": true,
        "nextCursor": "2025-11-28T09:00:00Z"
      }
    }

PATCH /api/v1/wallet/chain
  Description: Set selected chain for display
  Headers: Authorization: Bearer <token>
  Request:
    {
      "chain": "Polygon"
    }
  Response:
    {
      "selectedChain": "Polygon"
    }
```

### 7.3 Balance Management Service

```typescript
@Injectable()
export class WalletService {
  constructor(
    private prisma: PrismaService,
    private redisLock: RedisLockService,
  ) {}

  async getBalances(userId: string): Promise<UserBalances> {
    const balances = await this.prisma.userBalance.findMany({
      where: { userId },
    });

    return {
      available: this.aggregateByAsset(balances, 'available'),
      locked: this.aggregateByAsset(balances, 'locked'),
      total: this.aggregateByAsset(balances, 'total'),
    };
  }

  async lockFunds(
    userId: string,
    asset: string,
    amount: Decimal,
    reason: string,
    referenceId: string
  ): Promise<boolean> {
    // Use distributed lock to prevent race conditions
    const lockKey = `balance:${userId}:${asset}`;
    
    return await this.redisLock.withLock(lockKey, async () => {
      const balance = await this.prisma.userBalance.findUnique({
        where: { userId_asset: { userId, asset } }
      });

      if (!balance || balance.available.lessThan(amount)) {
        throw new InsufficientFundsError(asset, amount.toString());
      }

      await this.prisma.$transaction([
        // Update balance
        this.prisma.userBalance.update({
          where: { userId_asset: { userId, asset } },
          data: {
            available: { decrement: amount },
            locked: { increment: amount },
          }
        }),
        // Create lock record
        this.prisma.balanceLock.create({
          data: {
            userId,
            asset,
            amount,
            reason,
            referenceId,
            lockedAt: new Date(),
          }
        })
      ]);

      return true;
    });
  }

  async releaseFunds(
    userId: string,
    asset: string,
    amount: Decimal,
    referenceId: string
  ): Promise<void> {
    const lockKey = `balance:${userId}:${asset}`;
    
    await this.redisLock.withLock(lockKey, async () => {
      await this.prisma.$transaction([
        this.prisma.userBalance.update({
          where: { userId_asset: { userId, asset } },
          data: {
            available: { increment: amount },
            locked: { decrement: amount },
          }
        }),
        this.prisma.balanceLock.updateMany({
          where: { referenceId },
          data: { releasedAt: new Date() }
        })
      ]);
    });
  }

  async creditBalance(
    userId: string,
    asset: string,
    amount: Decimal,
    source: string,
    txHash?: string
  ): Promise<void> {
    await this.prisma.$transaction([
      this.prisma.userBalance.upsert({
        where: { userId_asset: { userId, asset } },
        create: {
          userId,
          asset,
          available: amount,
          locked: new Decimal(0),
        },
        update: {
          available: { increment: amount },
        }
      }),
      this.prisma.balanceTransaction.create({
        data: {
          userId,
          asset,
          amount,
          type: 'credit',
          source,
          txHash,
          createdAt: new Date(),
        }
      })
    ]);
  }
}
```

### 7.4 Database Schema - Wallet & Ledger

```sql
-- User balances (internal ledger)
CREATE TABLE user_balances (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    asset VARCHAR(10) NOT NULL,  -- 'USDC' | 'USDT'
    
    available DECIMAL(20,6) DEFAULT 0,  -- Available for trading
    locked DECIMAL(20,6) DEFAULT 0,     -- Locked in open orders
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    UNIQUE(user_id, asset)
);

-- Balance locks (for order placement)
CREATE TABLE balance_locks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id),
    asset VARCHAR(10) NOT NULL,
    amount DECIMAL(20,6) NOT NULL,
    reason VARCHAR(50) NOT NULL,  -- 'order' | 'withdrawal'
    reference_id UUID NOT NULL,   -- Order ID or Withdrawal ID
    locked_at TIMESTAMPTZ DEFAULT NOW(),
    released_at TIMESTAMPTZ,
    
    UNIQUE(reference_id)
);

-- Balance transactions (audit log)
CREATE TABLE balance_transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id),
    asset VARCHAR(10) NOT NULL,
    amount DECIMAL(20,6) NOT NULL,
    type VARCHAR(20) NOT NULL,  -- 'credit' | 'debit'
    source VARCHAR(50) NOT NULL,  -- 'deposit' | 'withdrawal' | 'trade' | 'settlement'
    reference_id UUID,
    tx_hash VARCHAR(66),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Deposit intents
CREATE TABLE deposit_intents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id),
    asset VARCHAR(10) NOT NULL,
    amount DECIMAL(20,6) NOT NULL,
    chain VARCHAR(20) NOT NULL,
    chain_id INTEGER NOT NULL,
    vault_address VARCHAR(42) NOT NULL,
    status VARCHAR(20) DEFAULT 'pending',  -- 'pending' | 'confirmed' | 'expired'
    tx_hash VARCHAR(66),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    confirmed_at TIMESTAMPTZ,
    expires_at TIMESTAMPTZ NOT NULL
);

-- Withdrawal requests
CREATE TABLE withdrawal_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id),
    asset VARCHAR(10) NOT NULL,
    amount DECIMAL(20,6) NOT NULL,
    to_address VARCHAR(42) NOT NULL,
    chain VARCHAR(20) NOT NULL,
    status VARCHAR(30) DEFAULT 'pending_signature',
    -- Status: pending_signature | pending_approval | processing | completed | failed
    signature TEXT,
    tx_hash VARCHAR(66),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    processed_at TIMESTAMPTZ,
    error_message TEXT
);

CREATE INDEX idx_balances_user ON user_balances(user_id);
CREATE INDEX idx_locks_reference ON balance_locks(reference_id);
CREATE INDEX idx_balance_tx_user ON balance_transactions(user_id);
CREATE INDEX idx_deposits_user ON deposit_intents(user_id);
CREATE INDEX idx_withdrawals_user ON withdrawal_requests(user_id);
```

---

## 8. User Profile & Risk Settings

### 8.1 Profile API Endpoints

```yaml
GET /api/v1/users/me
  Description: Get current user profile
  Headers: Authorization: Bearer <token>
  Response:
    {
      "user": {
        "id": "uuid",
        "walletAddress": "0x1234...abcd",
        "authProvider": "web3auth",
        "email": "user@example.com",
        "displayName": "CryptoTrader",
        "bio": "Prediction market enthusiast",
        "profileImage": "https://...",
        "createdAt": "2025-01-15T00:00:00Z",
        "lastLoginAt": "2025-11-28T10:00:00Z",
        "stats": {
          "totalTrades": 156,
          "winRate": 62.5,
          "totalPnl": 2340.50,
          "activePositions": 5
        }
      }
    }

PATCH /api/v1/users/me
  Description: Update user profile
  Headers: Authorization: Bearer <token>
  Request:
    {
      "displayName": "NewName",
      "bio": "Updated bio",
      "profileImage": "https://..."
    }
  Response:
    {
      "success": true,
      "user": { ... }
    }

GET /api/v1/users/me/risk-settings
  Description: Get risk settings
  Headers: Authorization: Bearer <token>
  Response:
    {
      "settings": {
        "weeklyTradingLimit": 5000,
        "weeklyTradingUsed": 1250,
        "maxPositionSize": 1000,
        "stopLossPercentage": 20,
        "autoStopLossEnabled": true,
        "preferredMarkets": ["politics", "sports"],
        "excludedCountries": []
      }
    }

PATCH /api/v1/users/me/risk-settings
  Description: Update risk settings
  Headers: Authorization: Bearer <token>
  Request:
    {
      "weeklyTradingLimit": 10000,
      "maxPositionSize": 2000,
      "stopLossPercentage": 25,
      "autoStopLossEnabled": true
    }
  Response:
    {
      "success": true,
      "settings": { ... }
    }

GET /api/v1/users/:walletAddress/public
  Description: Get public profile (no auth required)
  Response:
    {
      "user": {
        "walletAddress": "0x1234...abcd",
        "displayName": "CryptoTrader",
        "profileImage": "https://...",
        "createdAt": "2025-01-15T00:00:00Z",
        "stats": {
          "totalTrades": 156,
          "winRate": 62.5
        }
      }
    }
```

### 8.2 Risk Settings Enforcement

```typescript
@Injectable()
export class RiskSettingsService {
  async validateOrder(userId: string, order: CreateOrderDto): Promise<void> {
    const settings = await this.getUserRiskSettings(userId);
    const weeklyUsage = await this.getWeeklyTradingUsage(userId);
    
    // Check weekly limit
    if (weeklyUsage.add(order.total) > settings.weeklyTradingLimit) {
      throw new RiskLimitExceededError(
        'WEEKLY_LIMIT',
        `Weekly trading limit of $${settings.weeklyTradingLimit} exceeded`
      );
    }
    
    // Check position size
    if (order.total > settings.maxPositionSize) {
      throw new RiskLimitExceededError(
        'POSITION_SIZE',
        `Order exceeds max position size of $${settings.maxPositionSize}`
      );
    }
    
    // Check stop loss
    if (settings.autoStopLossEnabled) {
      const currentPosition = await this.getPosition(userId, order.marketId);
      if (currentPosition) {
        const potentialLoss = this.calculatePotentialLoss(currentPosition, order);
        const maxLoss = currentPosition.entryValue * (settings.stopLossPercentage / 100);
        
        if (potentialLoss > maxLoss) {
          throw new RiskLimitExceededError(
            'STOP_LOSS',
            `Order would exceed stop loss limit of ${settings.stopLossPercentage}%`
          );
        }
      }
    }
  }
}

// Background job for stop loss enforcement
@Processor('risk')
export class StopLossProcessor {
  @Process('check-stop-losses')
  async checkStopLosses() {
    const positions = await this.prisma.position.findMany({
      where: { status: 'open' },
      include: { user: { include: { riskSettings: true } } }
    });

    for (const position of positions) {
      const settings = position.user.riskSettings;
      if (!settings?.autoStopLossEnabled) continue;

      const currentValue = await this.calculateCurrentValue(position);
      const lossPercent = ((position.entryValue - currentValue) / position.entryValue) * 100;

      if (lossPercent >= settings.stopLossPercentage) {
        await this.executeStopLoss(position);
        await this.notifyUser(position.userId, 'STOP_LOSS_TRIGGERED', position);
      }
    }
  }
}
```

### 8.3 Database Schema - Risk Settings

```sql
CREATE TABLE user_risk_settings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    
    weekly_trading_limit DECIMAL(20,2) DEFAULT 5000,
    max_position_size DECIMAL(20,2) DEFAULT 1000,
    stop_loss_percentage INTEGER DEFAULT 20,
    auto_stop_loss_enabled BOOLEAN DEFAULT false,
    
    preferred_markets TEXT[],  -- ['politics', 'sports']
    excluded_countries TEXT[],
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    UNIQUE(user_id)
);

CREATE TABLE weekly_trading_usage (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id),
    week_start DATE NOT NULL,
    total_traded DECIMAL(20,2) DEFAULT 0,
    trade_count INTEGER DEFAULT 0,
    
    UNIQUE(user_id, week_start)
);

CREATE INDEX idx_risk_settings_user ON user_risk_settings(user_id);
CREATE INDEX idx_weekly_usage_user ON weekly_trading_usage(user_id, week_start);
```

---

## 9. Notification Settings

### 9.1 Notification API Endpoints

```yaml
GET /api/v1/notifications/settings
  Description: Get notification settings
  Headers: Authorization: Bearer <token>
  Response:
    {
      "settings": {
        "channels": {
          "telegram": {
            "enabled": true,
            "chatId": "123456789",
            "verified": true
          },
          "email": {
            "enabled": true,
            "address": "user@example.com",
            "verified": true
          },
          "sms": {
            "enabled": false,
            "phone": null,
            "verified": false
          },
          "push": {
            "enabled": true,
            "deviceTokens": ["token1", "token2"]
          }
        },
        "preferences": {
          "volatilitySpike": ["telegram", "push"],
          "positionUpdate": ["email"],
          "settlement": ["telegram", "email", "sms"],
          "marketResolution": ["email"],
          "weeklyDigest": ["email"]
        },
        "thresholds": {
          "volatilitySpikePercent": 10,
          "smsMinAmount": 100
        }
      }
    }

PATCH /api/v1/notifications/settings
  Description: Update notification settings
  Headers: Authorization: Bearer <token>
  Request:
    {
      "channels": {
        "telegram": { "enabled": true },
        "email": { "enabled": true }
      },
      "preferences": {
        "volatilitySpike": ["telegram", "email"]
      },
      "thresholds": {
        "volatilitySpikePercent": 15
      }
    }
  Response:
    {
      "success": true,
      "settings": { ... }
    }

POST /api/v1/notifications/channels/telegram/connect
  Description: Get Telegram bot link for connecting
  Headers: Authorization: Bearer <token>
  Response:
    {
      "botUsername": "AfricaPredictsBot",
      "connectLink": "https://t.me/AfricaPredictsBot?start=connect_abc123",
      "connectCode": "abc123",
      "expiresAt": "2025-11-28T11:00:00Z"
    }

POST /api/v1/notifications/channels/email/verify
  Description: Send verification email
  Headers: Authorization: Bearer <token>
  Request:
    {
      "email": "user@example.com"
    }
  Response:
    {
      "success": true,
      "message": "Verification email sent"
    }

POST /api/v1/notifications/test
  Description: Send test notification
  Headers: Authorization: Bearer <token>
  Request:
    {
      "channel": "telegram",
      "message": "Test notification from AfricaPredicts"
    }
  Response:
    {
      "success": true,
      "sentAt": "2025-11-28T10:30:00Z"
    }

GET /api/v1/notifications/history
  Description: Get notification history
  Headers: Authorization: Bearer <token>
  Query Parameters:
    - channel: telegram, email, sms, push
    - limit: number (default: 50)
    - before: timestamp
  Response:
    {
      "notifications": [
        {
          "id": "uuid",
          "channel": "telegram",
          "type": "volatility_spike",
          "title": "Price Alert: Nigeria Election",
          "message": "YES price moved +15% in 1 hour",
          "sentAt": "2025-11-28T10:00:00Z",
          "read": true
        }
      ],
      "pagination": {
        "hasMore": true,
        "nextCursor": "..."
      }
    }
```

### 9.2 Database Schema - Notifications

```sql
CREATE TABLE notification_settings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    
    -- Telegram
    telegram_enabled BOOLEAN DEFAULT false,
    telegram_chat_id VARCHAR(50),
    telegram_verified BOOLEAN DEFAULT false,
    
    -- Email
    email_enabled BOOLEAN DEFAULT true,
    email_address VARCHAR(255),
    email_verified BOOLEAN DEFAULT false,
    
    -- SMS
    sms_enabled BOOLEAN DEFAULT false,
    sms_phone VARCHAR(20),
    sms_verified BOOLEAN DEFAULT false,
    sms_min_amount DECIMAL(20,2) DEFAULT 100,
    
    -- Push
    push_enabled BOOLEAN DEFAULT false,
    push_device_tokens TEXT[],
    
    -- Preferences (JSON)
    preferences JSONB DEFAULT '{}',
    
    -- Thresholds
    volatility_spike_percent INTEGER DEFAULT 10,
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    UNIQUE(user_id)
);

CREATE TABLE notification_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id),
    channel VARCHAR(20) NOT NULL,
    type VARCHAR(50) NOT NULL,
    title VARCHAR(255),
    message TEXT,
    metadata JSONB,
    sent_at TIMESTAMPTZ DEFAULT NOW(),
    read_at TIMESTAMPTZ,
    
    CONSTRAINT valid_channel CHECK (channel IN ('telegram', 'email', 'sms', 'push'))
);

CREATE TABLE notification_connect_codes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id),
    channel VARCHAR(20) NOT NULL,
    code VARCHAR(50) NOT NULL UNIQUE,
    expires_at TIMESTAMPTZ NOT NULL,
    used_at TIMESTAMPTZ
);

CREATE INDEX idx_notif_settings_user ON notification_settings(user_id);
CREATE INDEX idx_notif_history_user ON notification_history(user_id);
CREATE INDEX idx_notif_connect_code ON notification_connect_codes(code);
```

---

## 10. Minimal Admin APIs

### 10.1 Admin Endpoints (Phase 1)

```yaml
# ADMIN ENDPOINTS (role: admin required)

POST /api/v1/admin/markets
  Description: Create new market
  Headers: Authorization: Bearer <token>
  Request:
    {
      "title": "Will Ghana win AFCON 2025?",
      "description": "...",
      "resolutionCriteria": "...",
      "category": "sports",
      "country": "ghana",
      "expiresAt": "2025-02-28T00:00:00Z",
      "timeline": "Resolves after AFCON 2025 final",
      "source": "https://cafonline.com"
    }
  Response:
    {
      "market": { ... }
    }

PATCH /api/v1/admin/markets/:id
  Description: Update market
  Headers: Authorization: Bearer <token>
  Request:
    {
      "description": "Updated description",
      "status": "active"
    }
  Response:
    {
      "market": { ... }
    }

POST /api/v1/admin/markets/:id/activate
  Description: Activate paused market
  Response:
    {
      "success": true,
      "market": { ... }
    }

POST /api/v1/admin/markets/:id/pause
  Description: Pause active market
  Request:
    {
      "reason": "Awaiting clarification on resolution criteria"
    }
  Response:
    {
      "success": true,
      "market": { ... }
    }

GET /api/v1/admin/stats
  Description: Get platform statistics
  Response:
    {
      "stats": {
        "totalUsers": 15234,
        "activeUsers24h": 856,
        "totalMarkets": 156,
        "activeMarkets": 89,
        "volume24h": 125000,
        "volumeTotal": 2500000,
        "pendingWithdrawals": 12,
        "pendingWithdrawalsAmount": 8500
      }
    }

GET /api/v1/admin/users
  Description: List users with search
  Query Parameters:
    - search: wallet address or display name
    - status: active, suspended, banned
    - page, limit
  Response:
    {
      "users": [ ... ],
      "pagination": { ... }
    }

PATCH /api/v1/admin/users/:id/status
  Description: Update user status
  Request:
    {
      "status": "suspended",
      "reason": "Suspicious activity"
    }
  Response:
    {
      "success": true
    }
```

### 10.2 Admin Authentication

```typescript
@Injectable()
export class AdminGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (!user || user.role !== 'admin') {
      throw new ForbiddenException('Admin access required');
    }

    return true;
  }
}

// Usage in controller
@Controller('admin')
@UseGuards(AuthGuard, AdminGuard)
export class AdminController {
  @Post('markets')
  async createMarket(@Body() dto: CreateMarketDto) {
    return this.adminService.createMarket(dto);
  }
}
```

---

# PART III: PHASE 2 — TRADING ENGINE & REAL-TIME

---

## 11. Trading Engine

### 11.1 Order Types

```typescript
enum OrderType {
  LIMIT = 'limit',
  MARKET = 'market',
}

enum OrderSide {
  BUY = 'buy',
  SELL = 'sell',
}

enum OrderStatus {
  PENDING = 'pending',
  OPEN = 'open',
  PARTIALLY_FILLED = 'partially_filled',
  FILLED = 'filled',
  CANCELLED = 'cancelled',
  EXPIRED = 'expired',
}

interface Order {
  id: string;
  userId: string;
  marketId: string;
  outcome: 'yes' | 'no';
  type: OrderType;
  side: OrderSide;
  price: Decimal;        // For limit orders
  size: Decimal;         // Total shares
  filledSize: Decimal;   // Shares filled
  remainingSize: Decimal;
  status: OrderStatus;
  createdAt: Date;
  updatedAt: Date;
  expiresAt?: Date;
}
```

### 11.2 Trading API Endpoints

```yaml
POST /api/v1/orders
  Description: Place limit order
  Headers: Authorization: Bearer <token>
  Request:
    {
      "marketId": "uuid",
      "outcome": "yes",
      "side": "buy",
      "price": 0.65,
      "size": 100,
      "expiresAt": "2025-12-01T00:00:00Z"  // optional
    }
  Response:
    {
      "order": {
        "id": "uuid",
        "marketId": "uuid",
        "outcome": "yes",
        "type": "limit",
        "side": "buy",
        "price": 0.65,
        "size": 100,
        "filledSize": 0,
        "remainingSize": 100,
        "status": "open",
        "lockedAmount": 65.00,
        "createdAt": "2025-11-28T10:00:00Z"
      }
    }

POST /api/v1/orders/market
  Description: Place market order (immediate execution)
  Headers: Authorization: Bearer <token>
  Request:
    {
      "marketId": "uuid",
      "outcome": "yes",
      "side": "buy",
      "size": 100,
      "maxSlippage": 0.05  // 5% max slippage
    }
  Response:
    {
      "order": {
        "id": "uuid",
        "type": "market",
        "status": "filled",
        "size": 100,
        "filledSize": 100,
        "avgPrice": 0.64,
        "totalCost": 64.00
      },
      "fills": [
        { "price": 0.63, "size": 50 },
        { "price": 0.65, "size": 50 }
      ]
    }

GET /api/v1/orders
  Description: Get user's orders
  Headers: Authorization: Bearer <token>
  Query Parameters:
    - marketId: filter by market
    - status: open, filled, cancelled
    - limit: number
  Response:
    {
      "orders": [ ... ],
      "pagination": { ... }
    }

DELETE /api/v1/orders/:id
  Description: Cancel order
  Headers: Authorization: Bearer <token>
  Response:
    {
      "success": true,
      "releasedAmount": 65.00
    }
```

### 11.3 Order Matching Engine

```typescript
@Injectable()
export class MatchingEngine {
  constructor(
    private prisma: PrismaService,
    private redis: RedisService,
    private eventEmitter: EventEmitter2,
  ) {}

  async processOrder(order: Order): Promise<MatchResult> {
    // Get orderbook from Redis cache
    const orderbook = await this.getOrderbook(order.marketId, order.outcome);
    
    // Find matching orders (price-time priority)
    const matches = this.findMatches(order, orderbook);
    
    if (matches.length === 0) {
      // No matches, add to orderbook
      await this.addToOrderbook(order);
      return { status: 'open', fills: [] };
    }

    // Execute matches
    const fills = await this.executeMatches(order, matches);
    
    // Update order status
    const remainingSize = order.size.minus(
      fills.reduce((sum, f) => sum.plus(f.size), new Decimal(0))
    );
    
    if (remainingSize.equals(0)) {
      order.status = OrderStatus.FILLED;
    } else if (remainingSize.lessThan(order.size)) {
      order.status = OrderStatus.PARTIALLY_FILLED;
      order.remainingSize = remainingSize;
      await this.addToOrderbook(order);
    }

    // Emit events for WebSocket broadcast
    this.eventEmitter.emit('trade.executed', { order, fills });
    this.eventEmitter.emit('orderbook.updated', { marketId: order.marketId });

    return { status: order.status, fills };
  }

  private findMatches(order: Order, orderbook: OrderBook): Order[] {
    const oppositeSide = order.side === OrderSide.BUY ? 'asks' : 'bids';
    const levels = orderbook[oppositeSide];
    
    const matches: Order[] = [];
    let remainingSize = order.size;

    for (const level of levels) {
      if (order.side === OrderSide.BUY && level.price > order.price) break;
      if (order.side === OrderSide.SELL && level.price < order.price) break;
      if (remainingSize.equals(0)) break;

      for (const existingOrder of level.orders) {
        const fillSize = Decimal.min(remainingSize, existingOrder.remainingSize);
        matches.push({ ...existingOrder, matchSize: fillSize });
        remainingSize = remainingSize.minus(fillSize);
        if (remainingSize.equals(0)) break;
      }
    }

    return matches;
  }

  private async executeMatches(taker: Order, matches: Order[]): Promise<Fill[]> {
    const fills: Fill[] = [];

    for (const maker of matches) {
      const fill = await this.prisma.$transaction(async (tx) => {
        const fillSize = maker.matchSize;
        const fillPrice = maker.price;
        const fillValue = fillSize.times(fillPrice);

        // Create trade record
        const trade = await tx.trade.create({
          data: {
            marketId: taker.marketId,
            outcome: taker.outcome,
            takerOrderId: taker.id,
            makerOrderId: maker.id,
            takerId: taker.userId,
            makerId: maker.userId,
            price: fillPrice,
            size: fillSize,
            takerSide: taker.side,
            createdAt: new Date(),
          }
        });

        // Update maker order
        await tx.order.update({
          where: { id: maker.id },
          data: {
            filledSize: { increment: fillSize },
            remainingSize: { decrement: fillSize },
            status: maker.remainingSize.equals(fillSize) 
              ? OrderStatus.FILLED 
              : OrderStatus.PARTIALLY_FILLED,
          }
        });

        // Update positions for both users
        await this.updatePositions(tx, taker, maker, fillSize, fillPrice);

        // Update balances
        await this.settleBalances(tx, taker, maker, fillSize, fillPrice);

        return {
          tradeId: trade.id,
          price: fillPrice,
          size: fillSize,
          makerId: maker.userId,
        };
      });

      fills.push(fill);
    }

    return fills;
  }
}
```

### 11.4 Database Schema - Trading

```sql
CREATE TABLE orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id),
    market_id UUID NOT NULL REFERENCES markets(id),
    outcome VARCHAR(10) NOT NULL,  -- 'yes' | 'no'
    
    type VARCHAR(10) NOT NULL,     -- 'limit' | 'market'
    side VARCHAR(10) NOT NULL,     -- 'buy' | 'sell'
    
    price DECIMAL(10,4),           -- NULL for market orders
    size DECIMAL(20,6) NOT NULL,
    filled_size DECIMAL(20,6) DEFAULT 0,
    remaining_size DECIMAL(20,6) NOT NULL,
    
    status VARCHAR(20) DEFAULT 'pending',
    -- Status: pending, open, partially_filled, filled, cancelled, expired
    
    locked_amount DECIMAL(20,6),   -- Amount locked from balance
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    expires_at TIMESTAMPTZ,
    cancelled_at TIMESTAMPTZ,
    
    CONSTRAINT valid_outcome CHECK (outcome IN ('yes', 'no')),
    CONSTRAINT valid_type CHECK (type IN ('limit', 'market')),
    CONSTRAINT valid_side CHECK (side IN ('buy', 'sell'))
);

CREATE TABLE trades (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    market_id UUID NOT NULL REFERENCES markets(id),
    outcome VARCHAR(10) NOT NULL,
    
    taker_order_id UUID REFERENCES orders(id),
    maker_order_id UUID REFERENCES orders(id),
    taker_id UUID REFERENCES users(id),
    maker_id UUID REFERENCES users(id),
    
    price DECIMAL(10,4) NOT NULL,
    size DECIMAL(20,6) NOT NULL,
    taker_side VARCHAR(10) NOT NULL,
    
    taker_fee DECIMAL(20,6) DEFAULT 0,
    maker_fee DECIMAL(20,6) DEFAULT 0,
    
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_orders_user ON orders(user_id);
CREATE INDEX idx_orders_market ON orders(market_id);
CREATE INDEX idx_orders_status ON orders(status) WHERE status IN ('open', 'partially_filled');
CREATE INDEX idx_trades_market ON trades(market_id);
CREATE INDEX idx_trades_time ON trades(created_at DESC);
```

---

## 12. Positions & Settlement

### 12.1 Position Tracking

```yaml
GET /api/v1/positions
  Description: Get all user positions
  Headers: Authorization: Bearer <token>
  Query Parameters:
    - status: open, closed
    - marketId: filter by market
  Response:
    {
      "positions": [
        {
          "id": "uuid",
          "marketId": "uuid",
          "market": {
            "slug": "nigeria-2027-election",
            "title": "..."
          },
          "outcome": "yes",
          "shares": 150,
          "avgEntryPrice": 0.62,
          "entryValue": 93.00,
          "currentPrice": 0.68,
          "currentValue": 102.00,
          "unrealizedPnl": 9.00,
          "unrealizedPnlPercent": 9.68,
          "realizedPnl": 0,
          "status": "open",
          "createdAt": "2025-11-20T10:00:00Z"
        }
      ],
      "summary": {
        "totalPositions": 5,
        "totalInvested": 450.00,
        "totalCurrentValue": 520.00,
        "totalUnrealizedPnl": 70.00
      }
    }

GET /api/v1/positions/:marketId
  Description: Get position for specific market
  Headers: Authorization: Bearer <token>
  Response:
    {
      "position": { ... }
    }

POST /api/v1/positions/:marketId/claim
  Description: Claim winnings after market resolution
  Headers: Authorization: Bearer <token>
  Response:
    {
      "claim": {
        "marketId": "uuid",
        "outcome": "yes",
        "shares": 150,
        "resolution": "yes",
        "payoutPerShare": 1.00,
        "grossPayout": 150.00,
        "fee": 1.50,
        "netPayout": 148.50,
        "creditedAt": "2025-11-28T10:00:00Z"
      }
    }
```

### 12.2 Settlement Engine

```typescript
@Injectable()
export class SettlementService {
  async settleMarket(marketId: string, resolution: 'yes' | 'no' | 'invalid'): Promise<void> {
    const market = await this.prisma.market.findUnique({
      where: { id: marketId },
    });

    if (market.status !== 'active') {
      throw new Error('Market not active');
    }

    // Get all open positions
    const positions = await this.prisma.position.findMany({
      where: { marketId, status: 'open' },
    });

    // Calculate and credit payouts
    for (const position of positions) {
      await this.prisma.$transaction(async (tx) => {
        let payout: Decimal;
        let fee: Decimal;

        if (resolution === 'invalid') {
          // Refund at entry price
          payout = position.entryValue;
          fee = new Decimal(0);
        } else if (position.outcome === resolution) {
          // Winner: $1 per share
          payout = new Decimal(position.shares);
          fee = payout.times(0.01); // 1% settlement fee
        } else {
          // Loser: $0
          payout = new Decimal(0);
          fee = new Decimal(0);
        }

        const netPayout = payout.minus(fee);

        // Update position
        await tx.position.update({
          where: { id: position.id },
          data: {
            status: 'settled',
            realizedPnl: netPayout.minus(position.entryValue),
            settledAt: new Date(),
            settlementAmount: netPayout,
          }
        });

        // Credit balance
        if (netPayout.greaterThan(0)) {
          await tx.userBalance.update({
            where: { userId_asset: { userId: position.userId, asset: 'USDC' } },
            data: { available: { increment: netPayout } }
          });
        }

        // Create settlement record
        await tx.settlement.create({
          data: {
            positionId: position.id,
            userId: position.userId,
            marketId,
            resolution,
            shares: position.shares,
            payoutPerShare: resolution === 'invalid' ? position.avgEntryPrice : 
                           (position.outcome === resolution ? new Decimal(1) : new Decimal(0)),
            grossPayout: payout,
            fee,
            netPayout,
            settledAt: new Date(),
          }
        });
      });

      // Notify user
      await this.notificationService.send(position.userId, 'settlement', {
        marketId,
        outcome: position.outcome,
        resolution,
        payout: netPayout,
      });
    }

    // Update market status
    await this.prisma.market.update({
      where: { id: marketId },
      data: {
        status: 'resolved',
        resolution,
        resolvedAt: new Date(),
      }
    });
  }
}
```

### 12.3 Database Schema - Positions

```sql
CREATE TABLE positions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id),
    market_id UUID NOT NULL REFERENCES markets(id),
    outcome VARCHAR(10) NOT NULL,
    
    shares DECIMAL(20,6) NOT NULL,
    avg_entry_price DECIMAL(10,4) NOT NULL,
    entry_value DECIMAL(20,6) NOT NULL,
    
    realized_pnl DECIMAL(20,6) DEFAULT 0,
    
    status VARCHAR(20) DEFAULT 'open',  -- 'open' | 'closed' | 'settled'
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    closed_at TIMESTAMPTZ,
    settled_at TIMESTAMPTZ,
    settlement_amount DECIMAL(20,6),
    
    UNIQUE(user_id, market_id, outcome)
);

CREATE TABLE settlements (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    position_id UUID REFERENCES positions(id),
    user_id UUID NOT NULL REFERENCES users(id),
    market_id UUID NOT NULL REFERENCES markets(id),
    
    resolution VARCHAR(10) NOT NULL,
    shares DECIMAL(20,6) NOT NULL,
    payout_per_share DECIMAL(10,4) NOT NULL,
    gross_payout DECIMAL(20,6) NOT NULL,
    fee DECIMAL(20,6) NOT NULL,
    net_payout DECIMAL(20,6) NOT NULL,
    
    settled_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_positions_user ON positions(user_id);
CREATE INDEX idx_positions_market ON positions(market_id);
CREATE INDEX idx_positions_open ON positions(status) WHERE status = 'open';
```

---

## 13. WebSocket Real-Time Infrastructure

### 13.1 WebSocket Gateway

```typescript
@WebSocketGateway({
  cors: { origin: '*' },
  namespace: '/ws',
})
export class TradingGateway {
  @WebSocketServer()
  server: Server;

  constructor(
    private redis: RedisService,
  ) {}

  afterInit() {
    // Subscribe to Redis pub/sub for scaling
    this.redis.subscribe('ws:broadcast', (message) => {
      const { channel, data } = JSON.parse(message);
      this.server.to(channel).emit(channel, data);
    });
  }

  @SubscribeMessage('subscribe:market')
  handleSubscribeMarket(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { marketId: string }
  ) {
    client.join(`market:${data.marketId}`);
    return { subscribed: true, marketId: data.marketId };
  }

  @SubscribeMessage('unsubscribe:market')
  handleUnsubscribeMarket(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { marketId: string }
  ) {
    client.leave(`market:${data.marketId}`);
    return { unsubscribed: true };
  }

  // Broadcast methods (called from services)
  async broadcastPriceUpdate(marketId: string, priceData: any) {
    await this.redis.publish('ws:broadcast', JSON.stringify({
      channel: `market:${marketId}`,
      event: 'marketPriceUpdate',
      data: priceData,
    }));
  }

  async broadcastOrderbookUpdate(marketId: string, orderbook: any) {
    await this.redis.publish('ws:broadcast', JSON.stringify({
      channel: `market:${marketId}`,
      event: 'orderBookUpdate',
      data: orderbook,
    }));
  }

  async broadcastTrade(marketId: string, trade: any) {
    await this.redis.publish('ws:broadcast', JSON.stringify({
      channel: `market:${marketId}`,
      event: 'recentTradesUpdate',
      data: trade,
    }));
  }
}
```

### 13.2 WebSocket Events

```typescript
// Events emitted to clients

interface MarketPriceUpdate {
  marketId: string;
  yesPrice: number;
  noPrice: number;
  priceChange24h: number;
  timestamp: string;
}

interface OrderBookUpdate {
  marketId: string;
  outcome: 'yes' | 'no';
  bids: Array<{ price: number; size: number; orders: number }>;
  asks: Array<{ price: number; size: number; orders: number }>;
  timestamp: string;
}

interface RecentTradesUpdate {
  marketId: string;
  trade: {
    id: string;
    outcome: 'yes' | 'no';
    price: number;
    size: number;
    side: 'buy' | 'sell';
    timestamp: string;
  };
}

interface MarketVolumeUpdate {
  marketId: string;
  volume24h: number;
  volumeChange: number;
  timestamp: string;
}

// Personal events (authenticated)
interface OrderUpdate {
  orderId: string;
  status: string;
  filledSize: number;
  remainingSize: number;
  avgFillPrice?: number;
}

interface BalanceUpdate {
  asset: string;
  available: string;
  locked: string;
}
```

### 13.3 Redis Pub/Sub Architecture

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                         WEBSOCKET SCALING ARCHITECTURE                           │
└─────────────────────────────────────────────────────────────────────────────────┘

  ┌───────────┐     ┌───────────┐     ┌───────────┐
  │  Client 1 │     │  Client 2 │     │  Client 3 │
  └─────┬─────┘     └─────┬─────┘     └─────┬─────┘
        │                 │                 │
        ▼                 ▼                 ▼
  ┌───────────┐     ┌───────────┐     ┌───────────┐
  │   WS      │     │   WS      │     │   WS      │
  │  Server 1 │     │  Server 2 │     │  Server 3 │
  └─────┬─────┘     └─────┬─────┘     └─────┬─────┘
        │                 │                 │
        └─────────────────┼─────────────────┘
                          │
                          ▼
                   ┌─────────────┐
                   │    REDIS    │
                   │   Pub/Sub   │
                   └─────────────┘
                          │
                          ▼
             ┌────────────────────────┐
             │   Trading Engine       │
             │   (publishes events)   │
             └────────────────────────┘
```

---

## 14. Notification Workers

### 14.1 Worker Architecture

```typescript
// BullMQ notification workers

@Processor('notifications')
export class NotificationProcessor {
  constructor(
    private telegramService: TelegramService,
    private emailService: EmailService,
    private smsService: SmsService,
  ) {}

  @Process('volatility-spike')
  async handleVolatilitySpike(job: Job<VolatilitySpikeEvent>) {
    const { marketId, priceChange, direction } = job.data;
    
    // Get users who want this notification
    const subscribers = await this.getSubscribers('volatilitySpike', marketId);
    
    for (const user of subscribers) {
      const settings = user.notificationSettings;
      const channels = settings.preferences.volatilitySpike || [];
      
      const message = this.formatVolatilitySpikeMessage(job.data);
      
      for (const channel of channels) {
        await this.sendNotification(user, channel, 'volatility_spike', message);
      }
    }
  }

  @Process('order-executed')
  async handleOrderExecuted(job: Job<OrderExecutedEvent>) {
    const { userId, orderId, fills } = job.data;
    
    const user = await this.getUser(userId);
    const settings = user.notificationSettings;
    const channels = settings.preferences.positionUpdate || [];
    
    const message = this.formatOrderExecutedMessage(job.data);
    
    for (const channel of channels) {
      await this.sendNotification(user, channel, 'order_executed', message);
    }
  }

  @Process('settlement')
  async handleSettlement(job: Job<SettlementEvent>) {
    const { userId, marketId, payout } = job.data;
    
    const user = await this.getUser(userId);
    const settings = user.notificationSettings;
    const channels = settings.preferences.settlement || [];
    
    // SMS only if payout exceeds threshold
    const filteredChannels = channels.filter(ch => {
      if (ch === 'sms' && payout < settings.smsMinAmount) {
        return false;
      }
      return true;
    });
    
    const message = this.formatSettlementMessage(job.data);
    
    for (const channel of filteredChannels) {
      await this.sendNotification(user, channel, 'settlement', message);
    }
  }

  private async sendNotification(
    user: User,
    channel: string,
    type: string,
    message: NotificationMessage
  ) {
    try {
      switch (channel) {
        case 'telegram':
          await this.telegramService.send(user.telegramChatId, message);
          break;
        case 'email':
          await this.emailService.send(user.email, message);
          break;
        case 'sms':
          await this.smsService.send(user.phone, message);
          break;
      }
      
      // Log to history
      await this.prisma.notificationHistory.create({
        data: {
          userId: user.id,
          channel,
          type,
          title: message.title,
          message: message.body,
          sentAt: new Date(),
        }
      });
    } catch (error) {
      console.error(`Failed to send ${channel} notification:`, error);
    }
  }
}
```

### 14.2 Event Triggers

```typescript
// Events that trigger notifications

@Injectable()
export class NotificationTriggerService {
  constructor(
    @InjectQueue('notifications') private notificationQueue: Queue,
  ) {}

  // Called when price moves significantly
  async onVolatilitySpike(marketId: string, priceChange: number, direction: 'up' | 'down') {
    await this.notificationQueue.add('volatility-spike', {
      marketId,
      priceChange,
      direction,
      timestamp: new Date(),
    });
  }

  // Called when order is filled
  async onOrderExecuted(userId: string, orderId: string, fills: Fill[]) {
    await this.notificationQueue.add('order-executed', {
      userId,
      orderId,
      fills,
      timestamp: new Date(),
    });
  }

  // Called when market is resolved
  async onMarketResolution(marketId: string, resolution: string) {
    await this.notificationQueue.add('market-resolution', {
      marketId,
      resolution,
      timestamp: new Date(),
    });
  }

  // Called when user's position is settled
  async onSettlement(userId: string, settlement: Settlement) {
    await this.notificationQueue.add('settlement', {
      userId,
      marketId: settlement.marketId,
      payout: settlement.netPayout,
      outcome: settlement.resolution,
      timestamp: new Date(),
    });
  }

  // Called when stop-loss is triggered
  async onStopLossTriggered(userId: string, position: Position) {
    await this.notificationQueue.add('stop-loss', {
      userId,
      positionId: position.id,
      marketId: position.marketId,
      lossAmount: position.realizedPnl,
      timestamp: new Date(),
    });
  }
}
```

---

# PART IV: PHASE 3 — ORACLE & ON-CHAIN INTEGRATION

---

## 15. Market Resolution Oracle

### 15.1 Oracle Service Architecture

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                          MARKET RESOLUTION ORACLE                                │
└─────────────────────────────────────────────────────────────────────────────────┘

  ┌──────────────────┐     ┌──────────────────┐     ┌──────────────────┐
  │  Official APIs   │     │   News Feeds     │     │    Chainlink     │
  │  (Gov, Sports)   │     │  (Reuters, AFP)  │     │   (Price Feeds)  │
  └────────┬─────────┘     └────────┬─────────┘     └────────┬─────────┘
           │                        │                        │
           └────────────────────────┴────────────────────────┘
                                    │
                                    ▼
                        ┌───────────────────────┐
                        │    DATA AGGREGATOR    │
                        │                       │
                        │  • Fetch from sources │
                        │  • Validate data      │
                        │  • Cross-reference    │
                        └───────────┬───────────┘
                                    │
                                    ▼
                        ┌───────────────────────┐
                        │   RESOLUTION ENGINE   │
                        │                       │
                        │  • Propose resolution │
                        │  • Wait for disputes  │
                        │  • Finalize outcome   │
                        └───────────┬───────────┘
                                    │
                                    ▼
                        ┌───────────────────────┐
                        │   SETTLEMENT ENGINE   │
                        │                       │
                        │  • Calculate payouts  │
                        │  • Credit balances    │
                        │  • Close positions    │
                        └───────────────────────┘
```

### 15.2 Oracle API Endpoints

```yaml
# ORACLE SERVICE ENDPOINTS (internal/admin)

POST /api/v1/oracle/markets/:id/resolve
  Description: Propose market resolution
  Headers: Authorization: Bearer <admin-token>
  Request:
    {
      "resolution": "yes",
      "evidence": [
        {
          "source": "https://inecnigeria.org/results/2027",
          "description": "Official INEC results",
          "capturedAt": "2027-03-01T10:00:00Z"
        }
      ],
      "notes": "Resolution based on official election commission results"
    }
  Response:
    {
      "resolutionId": "uuid",
      "status": "proposed",
      "resolution": "yes",
      "disputeDeadline": "2027-03-02T10:00:00Z"
    }

POST /api/v1/oracle/markets/:id/dispute
  Description: Dispute proposed resolution
  Headers: Authorization: Bearer <token>
  Request:
    {
      "proposedResolution": "no",
      "reason": "Evidence provided is incorrect",
      "evidence": [ ... ],
      "stake": 50.00
    }
  Response:
    {
      "disputeId": "uuid",
      "status": "under_review",
      "stakeAmount": 50.00
    }

POST /api/v1/oracle/markets/:id/finalize
  Description: Finalize resolution after dispute period
  Headers: Authorization: Bearer <admin-token>
  Response:
    {
      "status": "finalized",
      "resolution": "yes",
      "settlementsProcessed": 234
    }

GET /api/v1/oracle/markets/:id/resolution-status
  Description: Get resolution status
  Response:
    {
      "marketId": "uuid",
      "status": "proposed",
      "proposedResolution": "yes",
      "proposedAt": "2027-03-01T10:00:00Z",
      "disputeDeadline": "2027-03-02T10:00:00Z",
      "disputeCount": 0,
      "evidence": [ ... ]
    }
```

### 15.3 Resolution Workflow

```typescript
@Injectable()
export class OracleService {
  async proposeResolution(
    marketId: string,
    resolution: 'yes' | 'no',
    evidence: Evidence[],
    proposedBy: string
  ): Promise<ResolutionProposal> {
    const market = await this.prisma.market.findUnique({
      where: { id: marketId },
    });

    if (!market || market.status !== 'active') {
      throw new Error('Market not eligible for resolution');
    }

    if (market.expiresAt > new Date()) {
      throw new Error('Market has not expired yet');
    }

    // Create proposal
    const proposal = await this.prisma.resolutionProposal.create({
      data: {
        marketId,
        resolution,
        evidence,
        proposedBy,
        proposedAt: new Date(),
        disputeDeadline: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours
        status: 'proposed',
      }
    });

    // Update market status
    await this.prisma.market.update({
      where: { id: marketId },
      data: { status: 'pending_resolution' }
    });

    // Notify users with positions
    await this.notifyPositionHolders(marketId, 'resolution_proposed', proposal);

    return proposal;
  }

  async finalizeResolution(marketId: string): Promise<void> {
    const proposal = await this.prisma.resolutionProposal.findFirst({
      where: { marketId, status: 'proposed' },
    });

    if (!proposal) {
      throw new Error('No pending proposal found');
    }

    if (proposal.disputeDeadline > new Date()) {
      throw new Error('Dispute period has not ended');
    }

    // Check for unresolved disputes
    const openDisputes = await this.prisma.dispute.count({
      where: { proposalId: proposal.id, status: 'open' }
    });

    if (openDisputes > 0) {
      throw new Error('Unresolved disputes exist');
    }

    // Finalize
    await this.prisma.$transaction(async (tx) => {
      // Update proposal
      await tx.resolutionProposal.update({
        where: { id: proposal.id },
        data: { status: 'finalized', finalizedAt: new Date() }
      });

      // Trigger settlement
      await this.settlementService.settleMarket(marketId, proposal.resolution);
    });
  }
}
```

---

## 16. Smart Contract Integration

### 16.1 On-Chain Integration (Phase 3)

```typescript
@Injectable()
export class BlockchainService {
  private clients: Map<number, PublicClient> = new Map();
  private walletClients: Map<number, WalletClient> = new Map();

  constructor(private configService: ConfigService) {
    // Initialize clients for each supported chain
    this.initializeClients();
  }

  private initializeClients() {
    const chains = [
      { id: 1, rpc: 'https://eth-mainnet.g.alchemy.com/v2/...' },
      { id: 137, rpc: 'https://polygon-mainnet.g.alchemy.com/v2/...' },
      { id: 42161, rpc: 'https://arb-mainnet.g.alchemy.com/v2/...' },
    ];

    for (const chain of chains) {
      this.clients.set(chain.id, createPublicClient({
        transport: http(chain.rpc),
      }));
    }
  }

  // Listen for deposit events
  async watchDeposits(vaultAddress: string, chainId: number) {
    const client = this.clients.get(chainId);
    
    client.watchContractEvent({
      address: vaultAddress,
      abi: COLLATERAL_VAULT_ABI,
      eventName: 'Deposit',
      onLogs: async (logs) => {
        for (const log of logs) {
          await this.handleDepositEvent(log, chainId);
        }
      },
    });
  }

  private async handleDepositEvent(log: any, chainId: number) {
    const { user, token, amount, nonce } = log.args;
    
    // Find pending deposit intent
    const deposit = await this.prisma.depositIntent.findFirst({
      where: {
        vaultAddress: log.address,
        chainId,
        status: 'pending',
      }
    });

    if (!deposit) {
      console.warn('Unknown deposit:', log);
      return;
    }

    // Credit user balance
    await this.walletService.creditBalance(
      deposit.userId,
      this.tokenToAsset(token),
      new Decimal(formatUnits(amount, 6)),
      'deposit',
      log.transactionHash
    );

    // Update deposit status
    await this.prisma.depositIntent.update({
      where: { id: deposit.id },
      data: {
        status: 'confirmed',
        txHash: log.transactionHash,
        confirmedAt: new Date(),
      }
    });
  }

  // Execute withdrawal
  async executeWithdrawal(withdrawal: WithdrawalRequest): Promise<string> {
    const client = this.walletClients.get(withdrawal.chainId);
    const operatorKey = this.configService.get('OPERATOR_PRIVATE_KEY');
    
    const hash = await client.writeContract({
      address: withdrawal.vaultAddress,
      abi: COLLATERAL_VAULT_ABI,
      functionName: 'withdraw',
      args: [
        withdrawal.toAddress,
        withdrawal.tokenAddress,
        parseUnits(withdrawal.amount, 6),
        withdrawal.signature,
      ],
    });

    return hash;
  }
}
```

### 16.2 Contract ABIs

```typescript
export const COLLATERAL_VAULT_ABI = [
  {
    type: 'event',
    name: 'Deposit',
    inputs: [
      { name: 'user', type: 'address', indexed: true },
      { name: 'token', type: 'address', indexed: true },
      { name: 'amount', type: 'uint256', indexed: false },
      { name: 'nonce', type: 'bytes32', indexed: false },
      { name: 'timestamp', type: 'uint256', indexed: false },
    ],
  },
  {
    type: 'event',
    name: 'Withdrawal',
    inputs: [
      { name: 'user', type: 'address', indexed: true },
      { name: 'token', type: 'address', indexed: true },
      { name: 'amount', type: 'uint256', indexed: false },
      { name: 'toAddress', type: 'address', indexed: true },
      { name: 'timestamp', type: 'uint256', indexed: false },
    ],
  },
  {
    type: 'function',
    name: 'depositERC20',
    inputs: [
      { name: 'token', type: 'address' },
      { name: 'amount', type: 'uint256' },
      { name: 'nonce', type: 'bytes32' },
    ],
    outputs: [],
  },
  {
    type: 'function',
    name: 'withdraw',
    inputs: [
      { name: 'user', type: 'address' },
      { name: 'token', type: 'address' },
      { name: 'amount', type: 'uint256' },
      { name: 'toAddress', type: 'address' },
      { name: 'signature', type: 'bytes' },
    ],
    outputs: [],
  },
] as const;
```

---

## 17. Advanced Admin & Analytics

### 17.1 Analytics Endpoints

```yaml
GET /api/v1/admin/analytics/overview
  Description: Platform overview metrics
  Response:
    {
      "users": {
        "total": 15234,
        "active24h": 856,
        "active7d": 3421,
        "newToday": 45
      },
      "markets": {
        "total": 156,
        "active": 89,
        "resolved": 67,
        "pending": 5
      },
      "volume": {
        "today": 125000,
        "week": 850000,
        "month": 2500000,
        "allTime": 15000000
      },
      "trades": {
        "today": 1256,
        "week": 8934,
        "month": 35678
      }
    }

GET /api/v1/admin/analytics/volume
  Description: Volume breakdown
  Query Parameters:
    - period: day, week, month
    - groupBy: category, country
  Response:
    {
      "period": "week",
      "total": 850000,
      "breakdown": {
        "politics": 350000,
        "sports": 280000,
        "entertainment": 120000,
        "business": 60000,
        "crypto": 40000
      },
      "timeSeries": [
        { "date": "2025-11-22", "volume": 110000 },
        { "date": "2025-11-23", "volume": 125000 }
      ]
    }

GET /api/v1/admin/analytics/users/top
  Description: Top users by volume
  Query Parameters:
    - limit: number
    - period: week, month, allTime
  Response:
    {
      "users": [
        {
          "walletAddress": "0x...",
          "displayName": "TraderJoe",
          "volume": 125000,
          "trades": 234,
          "winRate": 65.5,
          "pnl": 12500
        }
      ]
    }

GET /api/v1/admin/analytics/markets/:id
  Description: Single market analytics
  Response:
    {
      "marketId": "uuid",
      "participants": 234,
      "trades": 1567,
      "volume": 125000,
      "liquidity": 50000,
      "priceHistory": [ ... ],
      "volumeByDay": [ ... ],
      "topTraders": [ ... ]
    }
```

### 17.2 Admin Dashboard Data

```yaml
GET /api/v1/admin/dashboard
  Description: Admin dashboard summary
  Response:
    {
      "pendingWithdrawals": {
        "count": 12,
        "totalAmount": 8500,
        "needsApproval": 3
      },
      "pendingResolutions": {
        "count": 5,
        "marketIds": ["uuid1", "uuid2", ...]
      },
      "disputes": {
        "open": 2,
        "underReview": 1
      },
      "alerts": [
        {
          "type": "large_withdrawal",
          "message": "Withdrawal of $15,000 requires multi-sig",
          "actionRequired": true
        }
      ],
      "recentActivity": [
        {
          "type": "market_created",
          "description": "New market: Ghana AFCON 2025",
          "timestamp": "2025-11-28T09:00:00Z"
        }
      ]
    }
```

---

# PART V: INFRASTRUCTURE & OPERATIONS

---

## 18. Database Architecture

### 18.1 Complete Schema Overview

```sql
-- =====================================================
-- AFRICAPREDICTS DATABASE SCHEMA
-- =====================================================

-- USERS & AUTH
CREATE TABLE users ( ... );  -- See Section 5.6
CREATE TABLE user_risk_settings ( ... );  -- See Section 8.3
CREATE TABLE notification_settings ( ... );  -- See Section 9.2

-- MARKETS
CREATE TABLE markets ( ... );  -- See Section 6.3

-- WALLET & LEDGER
CREATE TABLE user_balances ( ... );  -- See Section 7.4
CREATE TABLE balance_locks ( ... );
CREATE TABLE balance_transactions ( ... );
CREATE TABLE deposit_intents ( ... );
CREATE TABLE withdrawal_requests ( ... );

-- TRADING
CREATE TABLE orders ( ... );  -- See Section 11.4
CREATE TABLE trades ( ... );
CREATE TABLE positions ( ... );  -- See Section 12.3
CREATE TABLE settlements ( ... );

-- ORACLE & RESOLUTION
CREATE TABLE resolution_proposals (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    market_id UUID NOT NULL REFERENCES markets(id),
    resolution VARCHAR(10) NOT NULL,
    evidence JSONB,
    proposed_by UUID REFERENCES users(id),
    proposed_at TIMESTAMPTZ DEFAULT NOW(),
    dispute_deadline TIMESTAMPTZ NOT NULL,
    status VARCHAR(20) DEFAULT 'proposed',
    finalized_at TIMESTAMPTZ,
    notes TEXT
);

CREATE TABLE disputes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    proposal_id UUID NOT NULL REFERENCES resolution_proposals(id),
    user_id UUID NOT NULL REFERENCES users(id),
    proposed_resolution VARCHAR(10) NOT NULL,
    reason TEXT NOT NULL,
    evidence JSONB,
    stake DECIMAL(20,6) NOT NULL,
    status VARCHAR(20) DEFAULT 'open',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    resolved_at TIMESTAMPTZ,
    verdict VARCHAR(20)
);

-- NOTIFICATIONS
CREATE TABLE notification_history ( ... );  -- See Section 9.2
CREATE TABLE notification_connect_codes ( ... );

-- ANALYTICS (read replicas / materialized views)
CREATE MATERIALIZED VIEW daily_volume AS
SELECT 
    DATE(created_at) as date,
    market_id,
    SUM(price * size) as volume,
    COUNT(*) as trade_count
FROM trades
GROUP BY DATE(created_at), market_id;

CREATE MATERIALIZED VIEW user_stats AS
SELECT 
    user_id,
    COUNT(*) as total_trades,
    SUM(CASE WHEN pnl > 0 THEN 1 ELSE 0 END)::FLOAT / COUNT(*) * 100 as win_rate,
    SUM(pnl) as total_pnl
FROM (
    SELECT user_id, realized_pnl as pnl FROM positions WHERE status = 'settled'
) t
GROUP BY user_id;
```

### 18.2 Database Indexes

```sql
-- Performance indexes
CREATE INDEX idx_orders_matching ON orders(market_id, outcome, side, price, created_at)
    WHERE status IN ('open', 'partially_filled');

CREATE INDEX idx_trades_recent ON trades(market_id, created_at DESC);

CREATE INDEX idx_positions_active ON positions(user_id, status)
    WHERE status = 'open';

CREATE INDEX idx_markets_active ON markets(status, expires_at)
    WHERE status = 'active';

CREATE INDEX idx_balances_user_asset ON user_balances(user_id, asset);
```

---

## 19. Non-Functional Requirements

### 19.1 Security

| Requirement | Implementation |
|-------------|----------------|
| **Token Verification** | Web3Auth JWKS endpoint validation |
| **Rate Limiting** | Redis-backed sliding window (IP + endpoint) |
| **Input Validation** | class-validator DTOs, SQL injection prevention |
| **RBAC** | Role-based access for admin endpoints |
| **Secrets Management** | Environment variables, no hardcoded keys |
| **HTTPS Only** | TLS termination at load balancer |

### 19.2 Performance

| Metric | Target | Implementation |
|--------|--------|----------------|
| **API Latency (p95)** | < 200ms | Redis caching, connection pooling |
| **WebSocket Latency** | < 1s | Redis pub/sub, efficient serialization |
| **Order Matching** | < 50ms | In-memory orderbook, optimistic locking |
| **Concurrent Users** | 10,000+ | Horizontal scaling, stateless services |

### 19.3 Reliability

| Requirement | Implementation |
|-------------|----------------|
| **Uptime** | 99.9% SLA |
| **Order Replay** | Event sourcing, idempotent operations |
| **Balance Consistency** | Distributed locks, transaction isolation |
| **Event Delivery** | At-least-once with BullMQ retries |

### 19.4 Scalability

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                          HORIZONTAL SCALING ARCHITECTURE                         │
└─────────────────────────────────────────────────────────────────────────────────┘

                          ┌─────────────────┐
                          │  Load Balancer  │
                          └────────┬────────┘
                                   │
           ┌───────────────────────┼───────────────────────┐
           │                       │                       │
     ┌─────▼─────┐           ┌─────▼─────┐           ┌─────▼─────┐
     │  API      │           │  API      │           │  API      │
     │  Node 1   │           │  Node 2   │           │  Node 3   │
     └─────┬─────┘           └─────┬─────┘           └─────┬─────┘
           │                       │                       │
           └───────────────────────┼───────────────────────┘
                                   │
                    ┌──────────────┴──────────────┐
                    │                             │
              ┌─────▼─────┐                 ┌─────▼─────┐
              │  Redis    │                 │  PostgreSQL│
              │  Cluster  │                 │  Primary  │
              └───────────┘                 └─────┬─────┘
                                                  │
                                            ┌─────▼─────┐
                                            │  Read     │
                                            │  Replicas │
                                            └───────────┘
```

---

## 20. DevOps & Environments

### 20.1 Docker Configuration

```dockerfile
# Dockerfile
FROM node:20-alpine AS builder

WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM node:20-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production

COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./

EXPOSE 3000

CMD ["node", "dist/main"]
```

```yaml
# docker-compose.yml
version: '3.8'

services:
  api:
    build: .
    ports:
      - "3000:3000"
    environment:
      - DATABASE_URL=postgresql://postgres:password@db:5432/africapredicts
      - REDIS_URL=redis://redis:6379
    depends_on:
      - db
      - redis

  db:
    image: postgres:15-alpine
    volumes:
      - postgres_data:/var/lib/postgresql/data
    environment:
      - POSTGRES_DB=africapredicts
      - POSTGRES_PASSWORD=password

  redis:
    image: redis:7-alpine
    volumes:
      - redis_data:/data

  worker:
    build: .
    command: npm run worker
    environment:
      - DATABASE_URL=postgresql://postgres:password@db:5432/africapredicts
      - REDIS_URL=redis://redis:6379
    depends_on:
      - db
      - redis

volumes:
  postgres_data:
  redis_data:
```

### 20.2 CI/CD Pipeline

```yaml
# .github/workflows/ci.yml
name: CI/CD

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    services:
      postgres:
        image: postgres:15
        env:
          POSTGRES_DB: test
          POSTGRES_PASSWORD: test
        ports:
          - 5432:5432
      redis:
        image: redis:7
        ports:
          - 6379:6379
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '20'
      - run: npm ci
      - run: npm run lint
      - run: npm run test
      - run: npm run test:e2e

  build:
    needs: test
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: docker/build-push-action@v4
        with:
          push: true
          tags: africapredicts/api:${{ github.sha }}

  deploy:
    needs: build
    if: github.ref == 'refs/heads/main'
    runs-on: ubuntu-latest
    steps:
      - name: Deploy to production
        run: |
          # Deploy to Kubernetes/ECS
```

### 20.3 Environments

| Environment | Purpose | Database | URL |
|-------------|---------|----------|-----|
| **Development** | Local development | Local PostgreSQL | localhost:3000 |
| **Staging** | Testing & QA | Staging DB | staging-api.africapredicts.com |
| **Production** | Live users | Production DB | api.africapredicts.com |

---

## 21. Acceptance Criteria

### 21.1 Phase 1 Acceptance

| Requirement | Verification |
|-------------|--------------|
| Web3Auth login works | Users can log in via email/social, backend creates user record |
| Frontend displays live markets | No mock data, all markets from API |
| Wallet balances work | Deposit/withdrawal intents, balance ledger active |
| Profile settings save | Display name, risk settings, notification prefs persist |
| Admin can create markets | Admin endpoints functional with RBAC |

### 21.2 Phase 2 Acceptance

| Requirement | Verification |
|-------------|--------------|
| Users can place orders | Limit and market orders functional |
| Order matching works | Trades execute, balances update, positions created |
| Real-time updates work | WebSocket price/orderbook/trade updates |
| Positions show P&L | Unrealized P&L calculated from current prices |
| Notifications trigger | Test notifications sent via configured channels |

### 21.3 Phase 3 Acceptance

| Requirement | Verification |
|-------------|--------------|
| Oracle resolves markets | Proposal → dispute period → finalization |
| Settlement works | Winners credited, losers zeroed, positions closed |
| On-chain deposits work | ERC20 deposits credited to ledger |
| Analytics available | Volume, user stats, market performance dashboards |

---

## Appendix A: Environment Variables

```bash
# Application
NODE_ENV=production
PORT=3000
API_PREFIX=/api/v1

# Database
DATABASE_URL=postgresql://user:pass@host:5432/africapredicts

# Redis
REDIS_URL=redis://localhost:6379

# Web3Auth
WEB3AUTH_CLIENT_ID=your_client_id
WEB3AUTH_NETWORK=mainnet

# Blockchain
ETHEREUM_RPC_URL=https://eth-mainnet.g.alchemy.com/v2/...
POLYGON_RPC_URL=https://polygon-mainnet.g.alchemy.com/v2/...
ARBITRUM_RPC_URL=https://arb-mainnet.g.alchemy.com/v2/...
OPERATOR_PRIVATE_KEY=0x...

# Notifications
TELEGRAM_BOT_TOKEN=...
SENDGRID_API_KEY=...
TWILIO_ACCOUNT_SID=...
TWILIO_AUTH_TOKEN=...

# Monitoring
DATADOG_API_KEY=...
```

---

## Appendix B: API Error Codes

| Code | HTTP Status | Description |
|------|-------------|-------------|
| 1001 | 400 | Invalid request body |
| 1002 | 400 | Missing required field |
| 2001 | 401 | Invalid or expired token |
| 2002 | 401 | User not found |
| 2003 | 403 | Admin access required |
| 3001 | 400 | Insufficient balance |
| 3002 | 400 | Order price out of range |
| 3003 | 400 | Market not active |
| 3004 | 400 | Order already filled |
| 3005 | 400 | Position not found |
| 3009 | 400 | Weekly trading limit exceeded |
| 3010 | 400 | Max position size exceeded |
| 4001 | 400 | Invalid withdrawal address |
| 4002 | 400 | Withdrawal limit exceeded |
| 5001 | 429 | Rate limit exceeded |
| 9001 | 500 | Internal server error |

---

## Revision History

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | Nov 28, 2025 | Agent | Initial Backend Architecture Document based on Web3Auth-First SOW |

---

**End of Backend Architecture Document**
