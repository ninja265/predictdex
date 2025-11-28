# AfricaPredicts — Technical Architecture Document (TAD)

**Version:** 1.0  
**Date:** November 28, 2025  
**Status:** Production-Ready Frontend Demo  
**Classification:** Internal Technical Reference

---

## Table of Contents

### Part I: Frontend Architecture (Implemented)
1. [Executive Summary](#1-executive-summary)
2. [System Overview](#2-system-overview)
3. [Technology Stack](#3-technology-stack)
4. [Application Architecture](#4-application-architecture)
5. [Component Architecture](#5-component-architecture)
6. [Routing Structure](#6-routing-structure)
7. [State Management](#7-state-management)
8. [Web3 Integration Architecture](#8-web3-integration-architecture)
9. [Data Layer](#9-data-layer)
10. [Styling System](#10-styling-system)
11. [Security Considerations](#11-security-considerations)
12. [Performance Architecture](#12-performance-architecture)
13. [Deployment Architecture](#13-deployment-architecture)

### Part II: Backend Architecture (Planning)
14. [Backend System Overview](#14-backend-system-overview)
15. [API Specifications](#15-api-specifications)
16. [Database Architecture](#16-database-architecture)
17. [Authentication & Authorization](#17-authentication--authorization)
18. [Trading Engine](#18-trading-engine)
19. [Liquidity Management](#19-liquidity-management)
20. [Oracle & Resolution System](#20-oracle--resolution-system)
21. [Smart Contract Architecture](#21-smart-contract-architecture)
22. [Real-Time Infrastructure](#22-real-time-infrastructure)
23. [Analytics & Reporting](#23-analytics--reporting)
24. [Admin & Operations](#24-admin--operations)
25. [Implementation Roadmap](#25-implementation-roadmap)
26. [Appendices](#26-appendices)

---

## 1. Executive Summary

### 1.1 Purpose

AfricaPredicts is a Web3 prediction market platform focused on African narratives across politics, entertainment, sports, business, and cryptocurrency. This document provides a comprehensive technical overview of the frontend architecture for stakeholders, developers, and integration partners.

### 1.2 Current State

The application is a **fully functional frontend prototype** demonstrating:
- Prediction market trading interface with mock data
- Multi-chain wallet connectivity via RainbowKit
- Market sentiment visualization with YES/NO pricing
- Country and category-based market filtering
- Mock deposit/withdrawal wallet operations

**Important:** All trading functionality operates on mock data. No real blockchain transactions are executed.

### 1.3 Key Architectural Decisions

| Decision | Rationale |
|----------|-----------|
| Next.js 13 App Router | Server components support, file-based routing, optimized bundling |
| RainbowKit + Wagmi | Industry-standard Web3 connectivity, multi-wallet support |
| Zustand | Lightweight, TypeScript-first client state management |
| Tailwind CSS | Rapid UI development, design token consistency |
| Mock Data Layer | Enables frontend-first development and stakeholder demos |

---

## 2. System Overview

### 2.1 High-Level Architecture

```
┌─────────────────────────────────────────────────────────────────────┐
│                         CLIENT BROWSER                               │
├─────────────────────────────────────────────────────────────────────┤
│  ┌─────────────────────────────────────────────────────────────┐    │
│  │                    NEXT.JS APPLICATION                       │    │
│  │  ┌──────────────┐  ┌──────────────┐  ┌──────────────────┐   │    │
│  │  │   App Router │  │  Components  │  │   Zustand Store  │   │    │
│  │  │   (Pages)    │  │   Library    │  │ (useWalletStore) │   │    │
│  │  └──────────────┘  └──────────────┘  └──────────────────┘   │    │
│  │  ┌──────────────────────────────────────────────────────┐   │    │
│  │  │              PROVIDERS CONTEXT LAYER                  │   │    │
│  │  │  ┌────────────┐ ┌──────────┐ ┌───────────────────┐   │   │    │
│  │  │  │WagmiConfig │ │RainbowKit│ │QueryClientProvider│   │   │    │
│  │  │  └────────────┘ └──────────┘ └───────────────────┘   │   │    │
│  │  └──────────────────────────────────────────────────────┘   │    │
│  └─────────────────────────────────────────────────────────────┘    │
├─────────────────────────────────────────────────────────────────────┤
│                    EXTERNAL INTEGRATIONS                             │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────────────────┐   │
│  │  Blockchain  │  │ WalletConnect│  │   Mock Data Layer        │   │
│  │   Networks   │  │   Protocol   │  │   (predictions.ts)       │   │
│  └──────────────┘  └──────────────┘  └──────────────────────────┘   │
└─────────────────────────────────────────────────────────────────────┘
```

### 2.2 Configured Blockchain Networks

| Network | Chain ID | Purpose |
|---------|----------|---------|
| Ethereum Mainnet | 1 | Primary settlement layer |
| Polygon | 137 | Low-cost transactions |
| Arbitrum | 42161 | L2 scaling, fast finality |
| BNB Smart Chain | 56 | Alternative ecosystem access |

### 2.3 System Boundaries

**Currently Implemented:**
- Frontend UI/UX for prediction markets
- Wallet connection via RainbowKit (read-only blockchain state)
- Mock trading interface with simulated transactions
- Market filtering and discovery
- Mock wallet balances (USDT/USDC)

**Not Yet Implemented (Future):**
- Smart contract deployment and interaction
- Oracle integration for market resolution
- Backend API services
- Real blockchain transactions
- User authentication beyond wallet connection

---

## 3. Technology Stack

### 3.1 Core Framework

```yaml
Framework: Next.js 13.5.6
  - App Router architecture
  - React Server Components support
  - File-based routing
  - Built-in optimization

React: 18.3.1
  - Concurrent rendering
  - Automatic batching
  - Client components for interactivity

TypeScript: 5.9.3
  - Strict mode enabled
  - Path aliases (@/* -> ./*)
  - Full type coverage
```

### 3.2 Web3 Stack

```yaml
Wagmi: 1.4.13
  - React hooks for Ethereum
  - Multi-chain configuration
  - Public provider for RPC

RainbowKit: 1.3.2
  - Wallet connection modal
  - Custom button styling
  - Chain switching support

Viem: 1.21.4
  - TypeScript-first Ethereum library
  - ABI encoding/decoding
  - Transaction utilities

TanStack React Query: 5.90.10
  - Async state management
  - Request deduplication
  - Used by Wagmi internally
```

### 3.3 Styling Stack

```yaml
Tailwind CSS: 3.4.14
  - Utility-first approach
  - Custom theme tokens
  - JIT compilation

PostCSS: 8.5.6
  - CSS processing pipeline
  - Autoprefixer integration

Custom Fonts:
  - Inter (body text) via @fontsource/inter
  - DM Sans (headings) via @fontsource/dm-sans
```

### 3.4 State Management

```yaml
Zustand: 5.0.1
  - Minimal API surface
  - TypeScript-first
  - No provider wrapper needed
  - Optimized re-renders
```

### 3.5 Dependency Graph

```
                    ┌──────────────┐
                    │   Next.js    │
                    └──────┬───────┘
           ┌───────────────┼───────────────┐
           ▼               ▼               ▼
    ┌─────────────┐ ┌─────────────┐ ┌─────────────┐
    │    React    │ │  Tailwind   │ │ TypeScript  │
    └──────┬──────┘ └─────────────┘ └─────────────┘
           │
    ┌──────┴──────────────────────┐
    ▼                             ▼
┌─────────────┐            ┌─────────────┐
│   Wagmi     │◄──────────►│ React Query │
└──────┬──────┘            └─────────────┘
       │
┌──────┴──────┐
▼             ▼
┌─────────┐ ┌─────────┐
│RainbowKit│ │  Viem   │
└─────────┘ └─────────┘
```

---

## 4. Application Architecture

### 4.1 Directory Structure

```
africapredicts/
├── app/                          # Next.js App Router
│   ├── layout.tsx               # Root layout with Providers
│   ├── page.tsx                 # Landing page
│   ├── providers.tsx            # Web3 context providers
│   ├── globals.css              # Global styles + Tailwind
│   ├── markets/
│   │   ├── page.tsx             # Markets directory
│   │   └── [slug]/
│   │       └── page.tsx         # Individual market detail
│   ├── wallet/
│   │   └── page.tsx             # Wallet dashboard
│   ├── account/
│   │   └── page.tsx             # User account page
│   ├── country/
│   │   └── [country]/
│   │       └── page.tsx         # Country-filtered markets
│   └── category/
│       └── [category]/
│           └── page.tsx         # Category-filtered markets
│
├── components/                   # Reusable UI components
│   ├── Navbar.tsx               # Main navigation bar
│   ├── Footer.tsx               # Site footer
│   ├── PredictionCard.tsx       # Market card component
│   ├── PredictionsBoard.tsx     # Markets grid with filtering
│   ├── PredictionDetail.tsx     # Full market detail view
│   ├── CategoryFilter.tsx       # Category filter buttons
│   ├── CountryFilter.tsx        # Country filter buttons
│   ├── ConnectWalletButton.tsx  # RainbowKit custom button
│   ├── WalletDashboard.tsx      # Full wallet management UI
│   ├── WalletWidget.tsx         # Compact wallet display
│   ├── OrderBookPanel.tsx       # Market order book display
│   └── ChartBox.tsx             # Price chart placeholder
│
├── data/
│   └── predictions.ts           # Mock market data + types
│
├── lib/
│   └── stores/
│       └── useWalletStore.ts    # Zustand wallet state
│
├── next.config.js               # Next.js configuration
├── tailwind.config.js           # Tailwind theme tokens
├── tsconfig.json                # TypeScript config
└── package.json                 # Dependencies
```

### 4.2 Request Flow

```
User Navigation / Action
    │
    ▼
┌─────────────────┐
│   Next.js       │
│   App Router    │
└────────┬────────┘
         │
    ┌────┴────┐
    ▼         ▼
┌───────┐ ┌───────────┐
│ Server│ │   Client  │
│ Render│ │ Component │
└───────┘ └─────┬─────┘
                │
         ┌──────┴──────┐
         ▼             ▼
    ┌─────────┐  ┌──────────┐
    │ Zustand │  │  Wagmi   │
    │  Store  │  │  Hooks   │
    └────┬────┘  └────┬─────┘
         │            │
         │      ┌─────┴─────┐
         │      ▼           ▼
         │  ┌────────┐ ┌──────────┐
         │  │Wallet  │ │Blockchain│
         │  │Modal   │ │  State   │
         │  └────────┘ └──────────┘
         │
         ▼
    ┌─────────────┐
    │  UI Update  │
    └─────────────┘
```

---

## 5. Component Architecture

### 5.1 Component Hierarchy

```
RootLayout (app/layout.tsx)
├── Providers (Client Component)
│   ├── WagmiConfig
│   ├── QueryClientProvider
│   └── RainbowKitProvider
│
├── Navbar
│   ├── Logo
│   ├── Navigation Links
│   └── ConnectWalletButton
│
├── Main Content (varies by route)
│   │
│   ├── Landing Page (/)
│   │   ├── Hero Section (inline)
│   │   ├── Live Liquidity Panel (inline)
│   │   └── PredictionsBoard (limit=10, showFilters=false)
│   │
│   ├── Markets Page (/markets)
│   │   ├── Page Header (inline)
│   │   └── PredictionsBoard (showFilters=true)
│   │       ├── CountryFilter
│   │       ├── CategoryFilter
│   │       └── PredictionCard[] (grid)
│   │
│   ├── Market Detail (/markets/[slug])
│   │   └── PredictionDetail
│   │       ├── Market Info Panel
│   │       ├── Price Displays (YES/NO/Volume)
│   │       ├── ChartBox
│   │       ├── OrderBookPanel
│   │       ├── Timeline & Source
│   │       ├── Sentiment Bar
│   │       ├── Trade Form
│   │       └── Fee Schedule
│   │
│   ├── Wallet Page (/wallet)
│   │   └── WalletDashboard
│   │       ├── WalletWidget
│   │       ├── Chain Selector
│   │       ├── Deposit Form
│   │       ├── Withdraw Form
│   │       └── Transaction History Table
│   │
│   ├── Country Page (/country/[country])
│   │   └── PredictionsBoard (initialCountry set)
│   │
│   └── Category Page (/category/[category])
│       └── PredictionsBoard (initialCategory set)
│
└── Footer
    ├── Brand Info
    └── Navigation Links
```

### 5.2 Core Component Specifications

#### PredictionsBoard

**Location:** `components/PredictionsBoard.tsx`

**Purpose:** Main container for displaying filtered prediction markets

**Props Interface:**
```typescript
type Props = {
  title: string;              // Required - section title
  limit?: number;             // Optional - max items to display
  description?: string;       // Optional - subtitle text
  showFilters?: boolean;      // Default: true - show filter buttons
  initialCountry?: string | null;   // Pre-set country filter
  initialCategory?: string | null;  // Pre-set category filter
};
```

**Internal State:**
- `countryFilter: string | null` - Active country filter
- `categoryFilter: string | null` - Active category filter

**Behavior:**
- Syncs initial filter props via useEffect
- Memoizes filtered predictions array
- Applies limit after filtering
- Renders CountryFilter and CategoryFilter when showFilters=true
- Displays grid of PredictionCard components

---

#### PredictionCard

**Location:** `components/PredictionCard.tsx`

**Purpose:** Individual market card with key metrics

**Props Interface:**
```typescript
type Props = {
  prediction: Prediction;     // Market data object
  compact?: boolean;          // Default: false - hide liquidity/volume
};
```

**Displays:**
- Country and category badges
- Market title
- YES price (gold color) and NO price (electric purple)
- Liquidity level and volume (when not compact)

**Interaction:** Click navigates to `/markets/[slug]`

---

#### PredictionDetail

**Location:** `components/PredictionDetail.tsx`

**Purpose:** Full market detail view with trading interface

**Props Interface:**
```typescript
type Props = {
  prediction: Prediction;
};
```

**Internal State:**
- `amount: number` - Trade stake amount (default: 250)
- `direction: "yes" | "no"` - Trade direction (default: "yes")

**Computed Values:**
- `selectedPrice` - Current price based on direction
- `estimatedPayout` - amount * (1 / selectedPrice)
- `fee` - amount * 0.02 (2% fee)

**Sections:**
1. Market info header with tags
2. Price display grid (YES/NO/Volume)
3. ChartBox placeholder
4. OrderBookPanel mock data
5. Timeline and source information
6. Sentiment progress bar
7. Trade form with direction toggle
8. Fee schedule

---

#### WalletDashboard

**Location:** `components/WalletDashboard.tsx`

**Purpose:** Full wallet management interface

**Zustand Store Usage:**
```typescript
const { 
  deposit, 
  withdraw, 
  setChain, 
  selectedChain, 
  transactions 
} = useWalletStore();
```

**Internal State:**
- `depositAmount: number` - Deposit input (default: 250)
- `withdrawAmount: number` - Withdraw input (default: 120)
- `withdrawAddress: string` - Target address
- `asset: "USDT" | "USDC"` - Selected stablecoin

**Sections:**
1. WalletWidget - Balance display
2. Chain selector (BNB, Polygon, Arbitrum)
3. Deposit form
4. Withdraw form
5. Transaction history table

---

#### ConnectWalletButton

**Location:** `components/ConnectWalletButton.tsx`

**Purpose:** Custom-styled RainbowKit wallet connection

**Implementation:**
```typescript
<ConnectButton.Custom>
  {({ account, chain, openAccountModal, openChainModal, openConnectModal, mounted }) => {
    // Custom button rendering
  }}
</ConnectButton.Custom>
```

**States:**
- Not connected: Shows "Connect Wallet" button
- Connected: Shows account display name + chain name button

---

#### WalletWidget

**Location:** `components/WalletWidget.tsx`

**Purpose:** Compact wallet status and balance display

**Data Sources:**
- `useAccount()` from Wagmi - wallet connection status
- `useWalletStore()` - mock balances and chain

**Displays:**
- Connected wallet address (or "No wallet connected")
- USDT and USDC balances
- Active chain name

---

### 5.3 Component Communication Pattern

```
┌────────────────────────────────────────────────────────────┐
│                    PARENT COMPONENT                         │
│                                                             │
│  Props Down:                                                │
│  • prediction data                                          │
│  • filter values                                            │
│  • configuration options                                    │
│  • callback functions                                       │
└──────────────────────────┬─────────────────────────────────┘
                           │
                           ▼
┌────────────────────────────────────────────────────────────┐
│                    CHILD COMPONENT                          │
│                                                             │
│  • Renders UI based on props                                │
│  • Manages local UI state (forms, toggles)                  │
│  • Calls Zustand actions directly when needed               │
│  • Uses Wagmi hooks for blockchain state                    │
└────────────────────────────────────────────────────────────┘
                           │
              ┌────────────┴────────────┐
              ▼                         ▼
┌──────────────────────┐    ┌──────────────────────┐
│   ZUSTAND STORE      │    │   WAGMI CONTEXT      │
│                      │    │                      │
│ • stableBalances     │    │ • Wallet connection  │
│ • selectedChain      │    │ • Chain state        │
│ • transactions       │    │ • Account info       │
│ • deposit/withdraw   │    │                      │
└──────────────────────┘    └──────────────────────┘
```

---

## 6. Routing Structure

### 6.1 Route Map

| Path | Component | Type | Description |
|------|-----------|------|-------------|
| `/` | `app/page.tsx` | Server | Landing page with hero and top 10 predictions |
| `/markets` | `app/markets/page.tsx` | Server | Full markets directory with filters |
| `/markets/[slug]` | `app/markets/[slug]/page.tsx` | Server | Individual market detail and trading |
| `/wallet` | `app/wallet/page.tsx` | Server | Wallet dashboard with deposit/withdraw |
| `/account` | `app/account/page.tsx` | Server | User account page |
| `/country/[country]` | `app/country/[country]/page.tsx` | Server | Country-filtered markets |
| `/category/[category]` | `app/category/[category]/page.tsx` | Server | Category-filtered markets |

### 6.2 Dynamic Route Parameters

**Market Detail:**
```
/markets/[slug]
Examples:
  /markets/worldcup-africa-round16
  /markets/uae-visa-nigeria-2025
  /markets/ghana-ruling-party-2025
```

**Country Filter:**
```
/country/[country]
Examples:
  /country/nigeria
  /country/south-africa
  /country/kenya

Supported values (from predictions.ts):
  Nigeria, South Africa, Kenya, Ghana, Zambia,
  Egypt, Morocco, Uganda, Tanzania, Ethiopia, Africa
```

**Category Filter:**
```
/category/[category]
Examples:
  /category/politics
  /category/sports
  /category/entertainment

Supported values:
  Politics, Sports, Entertainment, Business, Crypto, Society
```

### 6.3 Navigation Flow

```
                    ┌──────────────┐
                    │   Landing    │
                    │   Page (/)   │
                    └──────┬───────┘
                           │
       ┌───────────────────┼───────────────────┐
       ▼                   ▼                   ▼
┌──────────────┐   ┌──────────────┐   ┌──────────────┐
│   Markets    │   │    Wallet    │   │   Account    │
│  /markets    │   │   /wallet    │   │  /account    │
└──────┬───────┘   └──────────────┘   └──────────────┘
       │
       ├─────────────────┬─────────────────┐
       ▼                 ▼                 ▼
┌──────────────┐ ┌──────────────┐ ┌──────────────┐
│   Country    │ │   Category   │ │   Market     │
│   Filter     │ │   Filter     │ │   Detail     │
│/country/[x]  │ │/category/[x] │ │/markets/[x]  │
└──────────────┘ └──────────────┘ └──────────────┘
```

---

## 7. State Management

### 7.1 State Categories

| Category | Solution | Scope | Persistence |
|----------|----------|-------|-------------|
| Web3 State | Wagmi Hooks | Wallet, chain, account | Session |
| Client State | Zustand | Balances, transactions | Memory only |
| URL State | Next.js Router | Filters, navigation | URL |
| Form State | React useState | Input values | Component |
| Server State | Mock data import | Predictions | Static |

### 7.2 Zustand Store: useWalletStore

**Location:** `lib/stores/useWalletStore.ts`

**Type Definitions:**
```typescript
type Chain = "BNB" | "Polygon" | "Arbitrum";

type Transaction = {
  id: string;
  type: "Deposit" | "Withdraw" | "Trade";
  amount: number;
  asset: "USDT" | "USDC";
  chain: Chain;
  timestamp: string;        // ISO date string
  status: "Completed" | "Pending";
};

type WalletState = {
  // State
  stableBalances: Record<"USDT" | "USDC", number>;
  selectedChain: Chain;
  transactions: Transaction[];
  
  // Actions
  setChain: (chain: Chain) => void;
  deposit: (amount: number, asset: "USDT" | "USDC") => void;
  withdraw: (amount: number, asset: "USDT" | "USDC") => void;
  recordTransaction: (tx: Transaction) => void;
};
```

**Initial State:**
```typescript
{
  stableBalances: { USDT: 2500, USDC: 1100 },
  selectedChain: "Polygon",
  transactions: [
    { id: "tx-1", type: "Trade", amount: 230, ... },
    { id: "tx-2", type: "Deposit", amount: 500, ... }
  ]
}
```

**Action Behaviors:**
- `deposit`: Increases balance, records transaction with "Completed" status
- `withdraw`: Decreases balance (min 0), records transaction with "Pending" status
- `recordTransaction`: Prepends to transactions array, keeps last 6 entries

### 7.3 Web3 State via Wagmi

**Connection State:**
```typescript
// From useAccount hook
{ 
  address: `0x${string}` | undefined,
  isConnected: boolean,
  isConnecting: boolean,
  isDisconnected: boolean
}
```

**Usage in Components:**
```typescript
// WalletWidget.tsx
const { address, isConnected } = useAccount();

// ConnectWalletButton.tsx (via RainbowKit)
const { account, chain, openAccountModal, openConnectModal } = ...
```

### 7.4 State Flow Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                      USER INTERACTION                        │
│  (Click deposit, connect wallet, filter markets, etc.)       │
└──────────────────────────┬──────────────────────────────────┘
                           │
              ┌────────────┴────────────┐
              ▼                         ▼
     ┌──────────────────┐      ┌──────────────────┐
     │   COMPONENT      │      │   ZUSTAND        │
     │   LOCAL STATE    │      │   STORE          │
     │                  │      │                  │
     │ • Form inputs    │      │ • stableBalances │
     │ • UI toggles     │      │ • selectedChain  │
     │ • Trade amount   │      │ • transactions   │
     │ • Trade direction│      │                  │
     └────────┬─────────┘      └────────┬─────────┘
              │                         │
              └────────────┬────────────┘
                           │
              ┌────────────┴────────────┐
              ▼                         ▼
     ┌──────────────────┐      ┌──────────────────┐
     │   WAGMI HOOKS    │      │   MOCK DATA      │
     │                  │      │                  │
     │ • useAccount()   │      │ • predictions[]  │
     │ • Chain info     │      │ • countries[]    │
     │ • Wallet address │      │ • categories[]   │
     └──────────────────┘      └──────────────────┘
                           │
                           ▼
              ┌──────────────────────────┐
              │      REACT RE-RENDER     │
              └──────────────────────────┘
```

---

## 8. Web3 Integration Architecture

### 8.1 Provider Configuration

**Location:** `app/providers.tsx`

**Chain Setup:**
```typescript
const { chains, publicClient } = configureChains(
  [mainnet, polygon, arbitrum, bsc],
  [publicProvider()]
);
```

**Wallet Connectors:**
```typescript
const { connectors } = getDefaultWallets({
  appName: "AfricaPredicts",
  projectId: process.env.NEXT_PUBLIC_WALLETCONNECT_ID || "demo",
  chains,
});
```

**Wagmi Config:**
```typescript
const wagmiConfig = createConfig({
  autoConnect: true,    // Reconnect on page load
  connectors,           // RainbowKit default wallets
  publicClient,         // Public RPC providers
});
```

### 8.2 Provider Hierarchy

```typescript
<WagmiConfig config={wagmiConfig}>
  <QueryClientProvider client={queryClient}>
    <RainbowKitProvider chains={chains}>
      {children}
    </RainbowKitProvider>
  </QueryClientProvider>
</WagmiConfig>
```

### 8.3 Supported Wallets (via RainbowKit Defaults)

| Wallet | Connection Method | Notes |
|--------|------------------|-------|
| MetaMask | Injected Provider | Desktop extension |
| WalletConnect | QR Code / Deep Link | Mobile wallet support |
| Coinbase Wallet | Injected / WC | Exchange integration |
| Rainbow | WalletConnect | Mobile-first |
| Argent | WalletConnect | Layer 2 focused |
| Trust Wallet | WalletConnect | Wide mobile reach |

### 8.4 Current Integration Scope

**Implemented:**
- Wallet connection/disconnection
- Account address display
- Chain switching UI
- ENS name resolution (via RainbowKit)
- Balance reading (via useAccount)

**Not Yet Implemented:**
- Contract interactions
- Transaction signing
- Token approvals
- On-chain balance reading
- Transaction confirmation flows

### 8.5 Future Contract Integration (Planned)

```typescript
// Example future prediction market interface
interface IPredictionMarket {
  // Read functions
  getMarket(marketId: bytes32): Market;
  getPosition(user: address, marketId: bytes32): Position;
  
  // Write functions (would require wallet signature)
  buyYes(marketId: bytes32, amount: uint256): void;
  buyNo(marketId: bytes32, amount: uint256): void;
  claimWinnings(marketId: bytes32): void;
}
```

---

## 9. Data Layer

### 9.1 Current Implementation (Mock Data)

**Location:** `data/predictions.ts`

**Prediction Type:**
```typescript
type Prediction = {
  id: string;              // Unique identifier
  slug: string;            // URL-friendly identifier
  title: string;           // Market question
  country: string;         // Country or "Africa" for continent-wide
  category: string;        // Politics, Sports, Entertainment, etc.
  yesPrice: number;        // 0.0 to 1.0 (probability)
  noPrice: number;         // 1 - yesPrice
  liquidity: "Low" | "Medium" | "High";
  volume: number;          // Total USD volume
  expiry: string;          // ISO date string
  marketDescription: string;  // Detailed description
  timeline: string;        // When outcome will be known
  source?: string;         // Optional reference URL
  sentiment: number;       // 0-100 community sentiment score
};
```

**Available Markets (10 total):**

| ID | Title | Category | Country |
|----|-------|----------|---------|
| worldcup-africa-round16 | African team World Cup Round of 16 | Sports | Africa |
| uae-visa-nigeria-2025 | UAE visa restrictions for Nigerians | Politics | Nigeria |
| big-brother-africa-winner | Big Brother Africa winner | Entertainment | Africa |
| ghana-ruling-party-2025 | Ghana ruling party change | Politics | Ghana |
| kenya-crypto-tax-2026 | Kenya crypto tax | Crypto | Kenya |
| south-africa-rate-cut-q3 | South Africa interest rate decrease | Business | South Africa |
| mtn-outperform-safaricom | MTN vs Safaricom stock performance | Business | Africa |
| davido-album-2025 | Davido album release | Entertainment | Nigeria |
| zambia-imf-second-tranche | Zambia IMF second tranche | Business | Zambia |
| ethiopia-peace-2025 | Ethiopia peace agreement | Politics | Ethiopia |

**Static Arrays:**
```typescript
export const countries = [
  "Nigeria", "South Africa", "Kenya", "Ghana", "Zambia",
  "Egypt", "Morocco", "Uganda", "Tanzania", "Ethiopia", "Africa"
] as const;

export const categories = [
  "Politics", "Sports", "Entertainment", 
  "Business", "Crypto", "Society"
] as const;
```

### 9.2 Data Access Pattern

```typescript
// Direct import (current approach)
import { predictions, countries, categories } from "@/data/predictions";

// Filtering in component
const filtered = predictions.filter(p => 
  p.country === countryFilter && 
  p.category === categoryFilter
);

// Lookup by slug
const market = predictions.find(p => p.slug === slug);
```

### 9.3 Future Data Architecture (Planned)

```
┌─────────────────────────────────────────────────────────────┐
│                     FRONTEND (Next.js)                       │
│                                                              │
│  • React Query for data fetching                             │
│  • Optimistic UI updates                                     │
│  • SWR-style revalidation                                    │
└──────────────────────────┬──────────────────────────────────┘
                           │
                    REST / GraphQL API
                           │
                           ▼
┌─────────────────────────────────────────────────────────────┐
│                      API GATEWAY                             │
└──────────────────────────┬──────────────────────────────────┘
                           │
          ┌────────────────┼────────────────┐
          ▼                ▼                ▼
   ┌─────────────┐  ┌─────────────┐  ┌─────────────┐
   │   Markets   │  │   Oracle    │  │  Analytics  │
   │   Service   │  │   Service   │  │   Service   │
   └──────┬──────┘  └──────┬──────┘  └──────┬──────┘
          │                │                │
          ▼                ▼                ▼
   ┌─────────────┐  ┌─────────────┐  ┌─────────────┐
   │  Database   │  │  Blockchain │  │  TimeSeries │
   │  (Markets)  │  │  (Prices)   │  │  (Metrics)  │
   └─────────────┘  └─────────────┘  └─────────────┘
```

---

## 10. Styling System

### 10.1 Design Tokens

**Color Palette (tailwind.config.js):**
```javascript
colors: {
  royal: "#162DFF",     // Primary CTA, links, YES buying
  electric: "#7B2CFF",  // Accents, secondary, NO buying
  gold: "#E2B100",      // Highlights, success, prices
  night: "#0A0A0A",     // Background primary
  charcoal: "#111111",  // Background secondary
  slate: "#1A1A1A",     // Cards, panels
  mist: "#B5B5B5",      // Muted text, labels
}
```

**Typography:**
```javascript
fontFamily: {
  inter: ["Inter", "sans-serif"],    // Body text
  dmsans: ["DM Sans", "sans-serif"], // Available for headings
}
```

### 10.2 Background Patterns

**African Grid Pattern:**
```javascript
backgroundImage: {
  "african-grid":
    "linear-gradient(120deg, rgba(226,177,0,0.08) 1px, transparent 1px), " +
    "linear-gradient(60deg, rgba(123,44,255,0.05) 1px, transparent 1px)",
}

backgroundSize: {
  pattern: "120px 120px",
}
```

**Global Body Gradient (globals.css):**
```css
body {
  background-image:
    radial-gradient(circle at top, rgba(22, 45, 255, 0.12), transparent 55%),
    radial-gradient(circle at 20% 20%, rgba(226, 177, 0, 0.08), transparent 40%),
    linear-gradient(135deg, rgba(10, 10, 10, 0.95), rgba(17, 17, 17, 0.95));
  background-attachment: fixed;
}
```

### 10.3 Utility Classes (globals.css)

```css
/* Glass panel effect for cards */
.glass-panel {
  @apply bg-slate/40 border border-white/5;
  backdrop-filter: blur(22px);
}

/* Badge styling for labels */
.badge {
  @apply uppercase tracking-widest text-[10px] font-semibold text-mist;
}

/* Card hover animation */
.card-hover {
  @apply transition duration-300 ease-out hover:-translate-y-1 hover:scale-[1.01];
}
```

### 10.4 Responsive Breakpoints (Tailwind Defaults)

| Breakpoint | Min Width | Usage |
|------------|-----------|-------|
| `sm` | 640px | Mobile landscape |
| `md` | 768px | Tablet, 2-column grids |
| `lg` | 1024px | Desktop, 3-column grids |
| `xl` | 1280px | Large desktop |
| `2xl` | 1536px | Ultra-wide displays |

### 10.5 Common Patterns

**Form Inputs:**
```css
border border-white/10 bg-transparent px-4 py-3 text-white 
focus:border-royal focus:outline-none
```

**Section Headers:**
```css
text-xs uppercase tracking-[0.4em] text-mist
```

**Buttons:**
```css
/* Primary */
border border-royal bg-royal px-6 py-3 text-xs uppercase tracking-[0.35em] text-white

/* Secondary */
border border-white/10 bg-white/5 hover:bg-electric/30
```

---

## 11. Security Considerations

### 11.1 Current Security Posture

| Area | Implementation | Risk Level |
|------|---------------|------------|
| Authentication | Wallet-based only | Low |
| Authorization | Client-side mock | N/A (no real data) |
| Data Validation | Frontend only | Low (mock data) |
| XSS Prevention | React JSX auto-escaping | Low |
| CSRF | No server mutations | N/A |
| Secrets | WalletConnect ID (public) | Low |

### 11.2 Environment Variables

**Current Configuration:**
```env
# Optional - defaults to "demo" if not set
NEXT_PUBLIC_WALLETCONNECT_ID=<project_id>
```

**Security Notes:**
- `NEXT_PUBLIC_` prefix exposes variable to client bundle
- WalletConnect Project ID is designed to be public
- No private keys or sensitive secrets are used

### 11.3 Web3 Security Considerations

**Current (Demo Mode):**
- No transaction signing implemented
- No token approvals requested
- Wallet connection is read-only
- Mock balances, no real funds at risk

**Future Requirements (When Live):**
1. Transaction simulation before signing
2. Clear approval amount displays
3. Domain verification for signing requests
4. Proper disconnect/session cleanup
5. Smart contract security audits

### 11.4 Recommendations for Production

| Requirement | Priority | Status |
|-------------|----------|--------|
| Smart contract audit | Critical | Not started |
| Rate limiting (API) | High | Not applicable yet |
| Input sanitization (API) | High | Not applicable yet |
| Audit logging | Medium | Not implemented |
| CSP headers | Medium | Not configured |

---

## 12. Performance Architecture

### 12.1 Current Optimizations

| Optimization | Implementation | Notes |
|--------------|----------------|-------|
| Code Splitting | Next.js automatic | Per-route chunks |
| Font Loading | @fontsource | Self-hosted, no FOUT |
| CSS Purging | Tailwind JIT | Only used classes shipped |
| Static Generation | Server Components | Where no client state needed |
| Image Optimization | Not yet used | Next/Image ready |

### 12.2 Bundle Composition (Estimated)

| Chunk | Est. Size (gzip) | Contents |
|-------|-----------------|----------|
| Framework | ~100KB | React, Next.js runtime |
| Web3 | ~180KB | Wagmi, RainbowKit, Viem |
| UI | ~40KB | Components, Tailwind |
| Fonts | ~50KB | Inter, DM Sans |
| **Total** | **~370KB** | Initial load |

### 12.3 Performance Targets

| Metric | Target | Notes |
|--------|--------|-------|
| Lighthouse Performance | >85 | Pending measurement |
| First Contentful Paint | <2.0s | Pending measurement |
| Time to Interactive | <3.5s | Pending measurement |
| Cumulative Layout Shift | <0.1 | Stable layout design |

### 12.4 Future Optimizations

1. **Image Optimization** - Use Next/Image for any added images
2. **Route Prefetching** - Next.js Link prefetch (enabled by default)
3. **API Caching** - React Query stale-while-revalidate
4. **Edge Caching** - CDN for static assets in production
5. **Bundle Analysis** - Regular monitoring of chunk sizes

---

## 13. Deployment Architecture

### 13.1 Development Environment

```yaml
Platform: Replit
Host: 0.0.0.0
Port: 5000
Command: npm run dev
Hot Reload: Enabled
Workflow: "AfricaPredicts Frontend"
```

### 13.2 Production Configuration

```yaml
Deployment Target: Autoscale
Build Command: npm run build
Start Command: npm start
Port: 5000
Scaling: Automatic based on traffic
```

### 13.3 Environment Configuration

| Variable | Environment | Purpose |
|----------|-------------|---------|
| NEXT_PUBLIC_WALLETCONNECT_ID | All | WalletConnect integration |
| NODE_ENV | Auto-set | development/production |

### 13.4 Build Process

```
┌──────────────┐     ┌──────────────┐     ┌──────────────┐
│   npm run    │────►│   next build │────►│    Deploy    │
│    build     │     │              │     │  (Autoscale) │
└──────────────┘     └──────────────┘     └──────────────┘
                           │
                    ┌──────┴──────┐
                    ▼             ▼
              ┌──────────┐  ┌──────────┐
              │TypeScript│  │  Static  │
              │  Check   │  │  Assets  │
              └──────────┘  └──────────┘
```

---

# PART II: BACKEND ARCHITECTURE (PLANNING)

This section provides comprehensive specifications for building the backend services required to make AfricaPredicts a fully functional prediction market platform.

---

## 14. Backend System Overview

### 14.1 Full-Stack Architecture

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                              CLIENT LAYER                                    │
│  ┌─────────────────────────────────────────────────────────────────────┐    │
│  │                    NEXT.JS FRONTEND (Existing)                       │    │
│  │  • Markets UI  • Trading Interface  • Wallet Dashboard  • Web3      │    │
│  └─────────────────────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────────────────────┘
                                      │
                    ┌─────────────────┴─────────────────┐
                    ▼                                   ▼
┌───────────────────────────────────┐   ┌───────────────────────────────────┐
│          REST/GraphQL API         │   │         WEBSOCKET GATEWAY         │
│     (Markets, Users, Trading)     │   │    (Real-time Price Updates)      │
└─────────────────┬─────────────────┘   └─────────────────┬─────────────────┘
                  │                                       │
                  └───────────────────┬───────────────────┘
                                      │
┌─────────────────────────────────────────────────────────────────────────────┐
│                            SERVICE LAYER                                     │
│  ┌────────────┐ ┌────────────┐ ┌────────────┐ ┌────────────┐ ┌────────────┐ │
│  │  Trading   │ │  Oracle    │ │ Liquidity  │ │  Wallet    │ │ Analytics  │ │
│  │  Engine    │ │  Service   │ │  Manager   │ │  Service   │ │  Service   │ │
│  └────────────┘ └────────────┘ └────────────┘ └────────────┘ └────────────┘ │
└─────────────────────────────────────────────────────────────────────────────┘
                                      │
┌─────────────────────────────────────────────────────────────────────────────┐
│                            DATA LAYER                                        │
│  ┌────────────────┐ ┌────────────────┐ ┌────────────────┐ ┌───────────────┐ │
│  │   PostgreSQL   │ │     Redis      │ │  Message Queue │ │  IPFS/S3      │ │
│  │   (Primary DB) │ │  (Cache/PubSub)│ │   (Events)     │ │  (Documents)  │ │
│  └────────────────┘ └────────────────┘ └────────────────┘ └───────────────┘ │
└─────────────────────────────────────────────────────────────────────────────┘
                                      │
┌─────────────────────────────────────────────────────────────────────────────┐
│                          BLOCKCHAIN LAYER                                    │
│  ┌────────────────────────────────────────────────────────────────────────┐ │
│  │                      SMART CONTRACTS                                    │ │
│  │  MarketFactory │ OutcomeAMM │ CollateralVault │ OracleRelay │ Treasury │ │
│  └────────────────────────────────────────────────────────────────────────┘ │
│                    Polygon │ Arbitrum │ BNB Chain                           │
└─────────────────────────────────────────────────────────────────────────────┘
```

### 14.2 Backend Technology Stack

```yaml
API Framework: NestJS (TypeScript)
  - Modular architecture
  - Built-in dependency injection
  - GraphQL + REST support
  - WebSocket gateway

Database: PostgreSQL 15+
  - Primary data store
  - JSONB for flexible schemas
  - Full-text search for markets

Cache: Redis 7+
  - Order book state
  - Session management
  - Pub/Sub for real-time
  - Rate limiting

Message Queue: Bull/BullMQ
  - Async job processing
  - Settlement queue
  - Notification dispatch

Blockchain Interaction: Viem + ethers.js
  - Contract calls
  - Event listening
  - Transaction management

Infrastructure:
  - Docker containers
  - Kubernetes orchestration
  - Cloudflare CDN
  - DataDog monitoring
```

### 14.3 Service Decomposition

| Service | Responsibility | Dependencies |
|---------|---------------|--------------|
| **API Gateway** | REST/GraphQL endpoints, request routing | All services |
| **Trading Engine** | Order matching, price calculation | PostgreSQL, Redis, Contracts |
| **Oracle Service** | Market resolution, data feeds | External APIs, Chainlink |
| **Liquidity Manager** | AMM curves, pool management | Trading Engine, Contracts |
| **Wallet Service** | Deposits, withdrawals, balances | PostgreSQL, Blockchain |
| **Analytics Service** | Metrics, reporting, dashboards | PostgreSQL, TimescaleDB |
| **Admin Service** | Market lifecycle, platform ops | All services |
| **Notification Service** | Emails, push, webhooks | Redis, External providers |

---

## 15. API Specifications

### 15.1 API Design Principles

- **RESTful** for CRUD operations on resources
- **GraphQL** for complex market queries and filtering
- **WebSocket** for real-time price and trade updates
- **Versioned** endpoints (`/api/v1/...`)
- **Rate limited** per wallet address and API key

### 15.2 Authentication Endpoints

```yaml
POST /api/v1/auth/nonce
  Description: Get nonce for SIWE (Sign-In with Ethereum)
  Request:
    { "walletAddress": "0x..." }
  Response:
    { "nonce": "abc123...", "expiresAt": "2025-11-28T12:00:00Z" }

POST /api/v1/auth/verify
  Description: Verify signed message and create session
  Request:
    {
      "message": "AfricaPredicts wants you to sign in...",
      "signature": "0x...",
      "walletAddress": "0x..."
    }
  Response:
    {
      "accessToken": "eyJhbG...",
      "refreshToken": "eyJhbG...",
      "expiresIn": 3600,
      "user": {
        "id": "uuid",
        "walletAddress": "0x...",
        "role": "trader"
      }
    }

POST /api/v1/auth/refresh
  Description: Refresh access token
  Request:
    { "refreshToken": "eyJhbG..." }
  Response:
    { "accessToken": "eyJhbG...", "expiresIn": 3600 }

POST /api/v1/auth/logout
  Description: Invalidate session
  Headers: Authorization: Bearer <token>
  Response: { "success": true }
```

### 15.3 Markets Endpoints

```yaml
GET /api/v1/markets
  Description: List all active markets with filtering
  Query Parameters:
    - category: string (politics, sports, entertainment, business, crypto, society)
    - country: string (nigeria, kenya, south-africa, etc.)
    - status: string (active, pending, resolved, disputed)
    - sort: string (volume, liquidity, expiry, created)
    - order: string (asc, desc)
    - page: number (default: 1)
    - limit: number (default: 20, max: 100)
  Response:
    {
      "markets": [
        {
          "id": "uuid",
          "slug": "nigeria-election-2027",
          "title": "Will APC win Nigeria 2027 election?",
          "description": "...",
          "category": "politics",
          "country": "Nigeria",
          "status": "active",
          "outcomes": [
            { "id": "yes", "name": "Yes", "price": 0.63, "shares": 42000 },
            { "id": "no", "name": "No", "price": 0.37, "shares": 28000 }
          ],
          "liquidity": 125000,
          "volume24h": 15000,
          "volumeTotal": 450000,
          "createdAt": "2025-01-15T10:00:00Z",
          "expiresAt": "2027-02-28T23:59:59Z",
          "resolvedAt": null,
          "resolution": null
        }
      ],
      "pagination": {
        "page": 1,
        "limit": 20,
        "total": 156,
        "pages": 8
      }
    }

GET /api/v1/markets/:slug
  Description: Get single market details
  Response:
    {
      "market": { ... },
      "orderBook": {
        "yes": {
          "bids": [{ "price": 0.62, "size": 500 }, ...],
          "asks": [{ "price": 0.64, "size": 750 }, ...]
        },
        "no": {
          "bids": [{ "price": 0.36, "size": 400 }, ...],
          "asks": [{ "price": 0.38, "size": 600 }, ...]
        }
      },
      "recentTrades": [
        {
          "id": "uuid",
          "outcome": "yes",
          "side": "buy",
          "price": 0.63,
          "size": 100,
          "timestamp": "2025-11-28T10:30:00Z"
        }
      ],
      "priceHistory": [
        { "timestamp": "2025-11-27T00:00:00Z", "yesPrice": 0.58, "noPrice": 0.42 },
        { "timestamp": "2025-11-28T00:00:00Z", "yesPrice": 0.63, "noPrice": 0.37 }
      ]
    }

GET /api/v1/markets/:slug/orderbook
  Description: Get full order book depth
  Response:
    {
      "yes": {
        "bids": [...],  // Sorted by price descending
        "asks": [...]   // Sorted by price ascending
      },
      "no": {
        "bids": [...],
        "asks": [...]
      },
      "lastUpdate": "2025-11-28T10:30:00Z"
    }

GET /api/v1/markets/:slug/trades
  Description: Get trade history for market
  Query Parameters:
    - limit: number (default: 50)
    - before: timestamp
  Response:
    {
      "trades": [
        {
          "id": "uuid",
          "outcome": "yes",
          "side": "buy",
          "price": 0.63,
          "size": 100,
          "makerWallet": "0x...",
          "takerWallet": "0x...",
          "timestamp": "2025-11-28T10:30:00Z",
          "txHash": "0x..."
        }
      ]
    }
```

### 15.4 Trading Endpoints

```yaml
POST /api/v1/orders
  Description: Place a new order
  Headers: Authorization: Bearer <token>
  Request:
    {
      "marketId": "uuid",
      "outcome": "yes",           # yes or no
      "side": "buy",              # buy or sell
      "type": "limit",            # limit or market
      "price": 0.65,              # Required for limit orders
      "size": 100,                # Number of shares
      "timeInForce": "GTC"        # GTC, IOC, FOK
    }
  Response:
    {
      "order": {
        "id": "uuid",
        "marketId": "uuid",
        "outcome": "yes",
        "side": "buy",
        "type": "limit",
        "price": 0.65,
        "size": 100,
        "filled": 0,
        "remaining": 100,
        "status": "open",
        "createdAt": "2025-11-28T10:30:00Z"
      }
    }

GET /api/v1/orders
  Description: Get user's orders
  Headers: Authorization: Bearer <token>
  Query Parameters:
    - marketId: uuid (optional)
    - status: string (open, filled, cancelled, expired)
  Response:
    {
      "orders": [...]
    }

DELETE /api/v1/orders/:orderId
  Description: Cancel an order
  Headers: Authorization: Bearer <token>
  Response:
    {
      "order": {
        "id": "uuid",
        "status": "cancelled",
        ...
      }
    }

POST /api/v1/orders/market
  Description: Execute instant market order via AMM
  Headers: Authorization: Bearer <token>
  Request:
    {
      "marketId": "uuid",
      "outcome": "yes",
      "side": "buy",
      "size": 100,
      "maxSlippage": 0.02      # 2% max slippage
    }
  Response:
    {
      "trade": {
        "id": "uuid",
        "executedPrice": 0.64,
        "size": 100,
        "cost": 64.00,
        "fee": 0.32,
        "txHash": "0x..."
      }
    }
```

### 15.5 Positions Endpoints

```yaml
GET /api/v1/positions
  Description: Get user's open positions
  Headers: Authorization: Bearer <token>
  Response:
    {
      "positions": [
        {
          "id": "uuid",
          "marketId": "uuid",
          "marketTitle": "Will APC win...",
          "outcome": "yes",
          "shares": 500,
          "avgEntryPrice": 0.58,
          "currentPrice": 0.63,
          "unrealizedPnl": 25.00,
          "realizedPnl": 0,
          "value": 315.00
        }
      ],
      "summary": {
        "totalValue": 1250.00,
        "totalUnrealizedPnl": 125.00,
        "totalRealizedPnl": 50.00
      }
    }

GET /api/v1/positions/:marketId
  Description: Get position for specific market
  Headers: Authorization: Bearer <token>
  Response:
    {
      "position": { ... },
      "history": [
        {
          "action": "buy",
          "shares": 200,
          "price": 0.55,
          "timestamp": "2025-11-20T10:00:00Z"
        }
      ]
    }

POST /api/v1/positions/:marketId/claim
  Description: Claim winnings from resolved market
  Headers: Authorization: Bearer <token>
  Response:
    {
      "claim": {
        "marketId": "uuid",
        "outcome": "yes",
        "shares": 500,
        "payout": 500.00,
        "txHash": "0x..."
      }
    }
```

### 15.6 Wallet Endpoints

```yaml
GET /api/v1/wallet/balances
  Description: Get user's wallet balances
  Headers: Authorization: Bearer <token>
  Response:
    {
      "balances": {
        "USDC": {
          "available": 2500.00,
          "locked": 500.00,      # In open orders
          "total": 3000.00
        },
        "USDT": {
          "available": 1100.00,
          "locked": 0,
          "total": 1100.00
        }
      },
      "chain": "polygon"
    }

POST /api/v1/wallet/deposit
  Description: Initiate deposit (returns contract call data)
  Headers: Authorization: Bearer <token>
  Request:
    {
      "asset": "USDC",
      "amount": 500.00,
      "chain": "polygon"
    }
  Response:
    {
      "deposit": {
        "id": "uuid",
        "contractAddress": "0x...",
        "callData": "0x...",
        "amount": 500.00,
        "asset": "USDC",
        "status": "pending"
      }
    }

POST /api/v1/wallet/deposit/confirm
  Description: Confirm deposit after on-chain tx
  Headers: Authorization: Bearer <token>
  Request:
    {
      "depositId": "uuid",
      "txHash": "0x..."
    }
  Response:
    {
      "deposit": {
        "id": "uuid",
        "status": "confirmed",
        "amount": 500.00,
        "confirmedAt": "2025-11-28T10:35:00Z"
      }
    }

POST /api/v1/wallet/withdraw
  Description: Request withdrawal
  Headers: Authorization: Bearer <token>
  Request:
    {
      "asset": "USDC",
      "amount": 200.00,
      "toAddress": "0x...",
      "chain": "polygon"
    }
  Response:
    {
      "withdrawal": {
        "id": "uuid",
        "status": "pending",
        "amount": 200.00,
        "fee": 0.50,
        "estimatedCompletion": "2025-11-28T11:00:00Z"
      }
    }

GET /api/v1/wallet/transactions
  Description: Get transaction history
  Headers: Authorization: Bearer <token>
  Query Parameters:
    - type: deposit, withdrawal, trade, claim
    - limit: number
    - before: timestamp
  Response:
    {
      "transactions": [
        {
          "id": "uuid",
          "type": "trade",
          "description": "Buy 100 YES shares - Nigeria Election",
          "amount": -64.00,
          "asset": "USDC",
          "timestamp": "2025-11-28T10:30:00Z",
          "txHash": "0x..."
        }
      ]
    }
```

### 15.7 GraphQL Schema

```graphql
type Query {
  # Markets
  markets(
    filter: MarketFilter
    sort: MarketSort
    pagination: PaginationInput
  ): MarketConnection!
  
  market(slug: String!): Market
  
  # User data (authenticated)
  me: User
  myPositions: [Position!]!
  myOrders(status: OrderStatus): [Order!]!
  myTransactions(type: TransactionType, limit: Int): [Transaction!]!
}

type Mutation {
  # Trading
  placeOrder(input: PlaceOrderInput!): Order!
  cancelOrder(orderId: ID!): Order!
  executeMarketOrder(input: MarketOrderInput!): Trade!
  
  # Wallet
  initiateDeposit(input: DepositInput!): Deposit!
  confirmDeposit(depositId: ID!, txHash: String!): Deposit!
  requestWithdrawal(input: WithdrawalInput!): Withdrawal!
  
  # Positions
  claimWinnings(marketId: ID!): Claim!
}

type Subscription {
  # Real-time updates
  marketPriceUpdate(marketId: ID!): PriceUpdate!
  marketTradeUpdate(marketId: ID!): Trade!
  orderBookUpdate(marketId: ID!): OrderBookSnapshot!
  
  # User-specific (authenticated)
  myOrderUpdate: Order!
  myPositionUpdate: Position!
  myBalanceUpdate: Balance!
}

type Market {
  id: ID!
  slug: String!
  title: String!
  description: String!
  category: Category!
  country: String!
  status: MarketStatus!
  outcomes: [Outcome!]!
  liquidity: Float!
  volume24h: Float!
  volumeTotal: Float!
  createdAt: DateTime!
  expiresAt: DateTime!
  resolvedAt: DateTime
  resolution: Outcome
  orderBook: OrderBook!
  recentTrades(limit: Int): [Trade!]!
  priceHistory(period: HistoryPeriod): [PricePoint!]!
}

input MarketFilter {
  category: Category
  country: String
  status: MarketStatus
  search: String
}

enum MarketStatus {
  ACTIVE
  PENDING
  RESOLVED
  DISPUTED
  CANCELLED
}

enum Category {
  POLITICS
  SPORTS
  ENTERTAINMENT
  BUSINESS
  CRYPTO
  SOCIETY
}
```

### 15.8 WebSocket Events

```yaml
# Connection
CONNECT:
  URL: wss://api.africapredicts.com/ws
  Headers:
    Authorization: Bearer <token>  # Optional for public channels

# Channel Subscriptions
SUBSCRIBE:
  {
    "action": "subscribe",
    "channels": [
      "market:nigeria-election-2027:ticker",
      "market:nigeria-election-2027:trades",
      "market:nigeria-election-2027:orderbook"
    ]
  }

# Public Channel Events
market:{slug}:ticker:
  {
    "event": "ticker",
    "data": {
      "marketId": "uuid",
      "yesPrice": 0.63,
      "noPrice": 0.37,
      "volume24h": 15000,
      "change24h": 0.05,
      "timestamp": "2025-11-28T10:30:00Z"
    }
  }

market:{slug}:trades:
  {
    "event": "trade",
    "data": {
      "id": "uuid",
      "outcome": "yes",
      "side": "buy",
      "price": 0.63,
      "size": 100,
      "timestamp": "2025-11-28T10:30:00Z"
    }
  }

market:{slug}:orderbook:
  {
    "event": "orderbook_update",
    "data": {
      "type": "delta",  # or "snapshot"
      "changes": [
        { "side": "bid", "outcome": "yes", "price": 0.62, "size": 500 }
      ]
    }
  }

# Private Channel Events (Authenticated)
user:{wallet}:orders:
  {
    "event": "order_update",
    "data": {
      "orderId": "uuid",
      "status": "filled",
      "filledSize": 100,
      ...
    }
  }

user:{wallet}:balance:
  {
    "event": "balance_update",
    "data": {
      "asset": "USDC",
      "available": 2435.00,
      "locked": 500.00
    }
  }
```

---

## 16. Database Architecture

### 16.1 Entity-Relationship Overview

```
┌──────────────┐       ┌──────────────┐       ┌──────────────┐
│    Users     │       │   Markets    │       │   Outcomes   │
│──────────────│       │──────────────│       │──────────────│
│ id           │       │ id           │       │ id           │
│ wallet_addr  │◄──────│ created_by   │──────►│ market_id    │
│ role         │       │ title        │       │ name         │
│ created_at   │       │ description  │       │ price        │
└──────────────┘       │ category     │       │ shares       │
       │               │ country      │       └──────────────┘
       │               │ status       │              │
       │               │ expires_at   │              │
       │               │ resolved_at  │              │
       │               └──────────────┘              │
       │                      │                      │
       ▼                      ▼                      ▼
┌──────────────┐       ┌──────────────┐       ┌──────────────┐
│   Sessions   │       │    Orders    │       │   Trades     │
│──────────────│       │──────────────│       │──────────────│
│ id           │       │ id           │       │ id           │
│ user_id      │       │ user_id      │       │ order_id     │
│ token        │       │ market_id    │       │ market_id    │
│ expires_at   │       │ outcome_id   │       │ outcome_id   │
└──────────────┘       │ side         │       │ price        │
                       │ type         │       │ size         │
                       │ price        │       │ maker_id     │
                       │ size         │       │ taker_id     │
                       │ filled       │       │ tx_hash      │
                       │ status       │       │ created_at   │
                       └──────────────┘       └──────────────┘
                              │
                              ▼
                       ┌──────────────┐
                       │  Positions   │
                       │──────────────│
                       │ id           │
                       │ user_id      │
                       │ market_id    │
                       │ outcome_id   │
                       │ shares       │
                       │ avg_price    │
                       │ realized_pnl │
                       └──────────────┘
```

### 16.2 Core Tables

```sql
-- Users Table
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    wallet_address VARCHAR(42) UNIQUE NOT NULL,
    ens_name VARCHAR(255),
    role VARCHAR(50) DEFAULT 'trader',
    email VARCHAR(255),
    email_verified BOOLEAN DEFAULT FALSE,
    notification_preferences JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    last_login_at TIMESTAMPTZ
);

CREATE INDEX idx_users_wallet ON users(wallet_address);

-- Sessions Table
CREATE TABLE sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    refresh_token_hash VARCHAR(64) NOT NULL,
    ip_address INET,
    user_agent TEXT,
    expires_at TIMESTAMPTZ NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    revoked_at TIMESTAMPTZ
);

CREATE INDEX idx_sessions_user ON sessions(user_id);
CREATE INDEX idx_sessions_expires ON sessions(expires_at);

-- Markets Table
CREATE TABLE markets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    slug VARCHAR(100) UNIQUE NOT NULL,
    title VARCHAR(500) NOT NULL,
    description TEXT,
    category VARCHAR(50) NOT NULL,
    country VARCHAR(100) NOT NULL,
    region VARCHAR(100),
    status VARCHAR(50) DEFAULT 'pending',
    
    -- Contract references
    contract_address VARCHAR(42),
    chain_id INTEGER,
    
    -- Timing
    created_at TIMESTAMPTZ DEFAULT NOW(),
    activated_at TIMESTAMPTZ,
    expires_at TIMESTAMPTZ NOT NULL,
    resolution_deadline TIMESTAMPTZ,
    resolved_at TIMESTAMPTZ,
    
    -- Resolution
    resolved_outcome_id UUID,
    resolution_source TEXT,
    resolution_details JSONB,
    
    -- Metadata
    created_by UUID REFERENCES users(id),
    tags TEXT[],
    image_url TEXT,
    source_urls TEXT[],
    
    -- Cached metrics (updated by trigger/job)
    total_liquidity DECIMAL(20,2) DEFAULT 0,
    volume_24h DECIMAL(20,2) DEFAULT 0,
    volume_total DECIMAL(20,2) DEFAULT 0,
    
    CONSTRAINT valid_status CHECK (status IN ('pending', 'active', 'paused', 'resolved', 'disputed', 'cancelled'))
);

CREATE INDEX idx_markets_slug ON markets(slug);
CREATE INDEX idx_markets_status ON markets(status);
CREATE INDEX idx_markets_category ON markets(category);
CREATE INDEX idx_markets_country ON markets(country);
CREATE INDEX idx_markets_expires ON markets(expires_at);
CREATE INDEX idx_markets_search ON markets USING gin(to_tsvector('english', title || ' ' || COALESCE(description, '')));

-- Outcomes Table
CREATE TABLE outcomes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    market_id UUID REFERENCES markets(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,  -- 'yes' or 'no'
    description TEXT,
    
    -- Current state
    price DECIMAL(10,4) DEFAULT 0.5,
    total_shares DECIMAL(20,4) DEFAULT 0,
    
    -- Pool state (for AMM)
    pool_shares DECIMAL(20,4) DEFAULT 0,
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    UNIQUE(market_id, name)
);

CREATE INDEX idx_outcomes_market ON outcomes(market_id);

-- Orders Table
CREATE TABLE orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id),
    market_id UUID REFERENCES markets(id),
    outcome_id UUID REFERENCES outcomes(id),
    
    side VARCHAR(10) NOT NULL,  -- 'buy' or 'sell'
    order_type VARCHAR(20) NOT NULL,  -- 'limit', 'market'
    time_in_force VARCHAR(10) DEFAULT 'GTC',  -- 'GTC', 'IOC', 'FOK'
    
    price DECIMAL(10,4),  -- NULL for market orders
    size DECIMAL(20,4) NOT NULL,
    filled DECIMAL(20,4) DEFAULT 0,
    remaining DECIMAL(20,4),
    
    status VARCHAR(20) DEFAULT 'open',
    
    -- Fees
    fee_rate DECIMAL(6,4) DEFAULT 0.003,
    fees_paid DECIMAL(20,4) DEFAULT 0,
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    filled_at TIMESTAMPTZ,
    cancelled_at TIMESTAMPTZ,
    expires_at TIMESTAMPTZ,
    
    CONSTRAINT valid_side CHECK (side IN ('buy', 'sell')),
    CONSTRAINT valid_type CHECK (order_type IN ('limit', 'market')),
    CONSTRAINT valid_status CHECK (status IN ('open', 'partial', 'filled', 'cancelled', 'expired'))
);

CREATE INDEX idx_orders_user ON orders(user_id);
CREATE INDEX idx_orders_market ON orders(market_id);
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_orders_open ON orders(market_id, outcome_id, side, price) WHERE status IN ('open', 'partial');

-- Trades Table
CREATE TABLE trades (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    market_id UUID REFERENCES markets(id),
    outcome_id UUID REFERENCES outcomes(id),
    
    maker_order_id UUID REFERENCES orders(id),
    taker_order_id UUID REFERENCES orders(id),
    maker_user_id UUID REFERENCES users(id),
    taker_user_id UUID REFERENCES users(id),
    
    price DECIMAL(10,4) NOT NULL,
    size DECIMAL(20,4) NOT NULL,
    
    maker_fee DECIMAL(20,4) DEFAULT 0,
    taker_fee DECIMAL(20,4) DEFAULT 0,
    
    tx_hash VARCHAR(66),
    block_number BIGINT,
    
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_trades_market ON trades(market_id);
CREATE INDEX idx_trades_time ON trades(created_at DESC);
CREATE INDEX idx_trades_user ON trades(maker_user_id);

-- Positions Table
CREATE TABLE positions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id),
    market_id UUID REFERENCES markets(id),
    outcome_id UUID REFERENCES outcomes(id),
    
    shares DECIMAL(20,4) DEFAULT 0,
    avg_entry_price DECIMAL(10,4),
    
    realized_pnl DECIMAL(20,4) DEFAULT 0,
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    UNIQUE(user_id, market_id, outcome_id)
);

CREATE INDEX idx_positions_user ON positions(user_id);
CREATE INDEX idx_positions_market ON positions(market_id);

-- Wallets & Collateral
CREATE TABLE collateral_accounts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) UNIQUE,
    
    usdc_available DECIMAL(20,4) DEFAULT 0,
    usdc_locked DECIMAL(20,4) DEFAULT 0,
    usdt_available DECIMAL(20,4) DEFAULT 0,
    usdt_locked DECIMAL(20,4) DEFAULT 0,
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Deposits
CREATE TABLE deposits (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id),
    
    asset VARCHAR(10) NOT NULL,
    amount DECIMAL(20,4) NOT NULL,
    chain_id INTEGER NOT NULL,
    
    tx_hash VARCHAR(66),
    block_number BIGINT,
    
    status VARCHAR(20) DEFAULT 'pending',
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    confirmed_at TIMESTAMPTZ,
    
    CONSTRAINT valid_deposit_status CHECK (status IN ('pending', 'confirming', 'confirmed', 'failed'))
);

CREATE INDEX idx_deposits_user ON deposits(user_id);
CREATE INDEX idx_deposits_tx ON deposits(tx_hash);

-- Withdrawals
CREATE TABLE withdrawals (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id),
    
    asset VARCHAR(10) NOT NULL,
    amount DECIMAL(20,4) NOT NULL,
    fee DECIMAL(20,4) DEFAULT 0,
    to_address VARCHAR(42) NOT NULL,
    chain_id INTEGER NOT NULL,
    
    tx_hash VARCHAR(66),
    
    status VARCHAR(20) DEFAULT 'pending',
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    processed_at TIMESTAMPTZ,
    completed_at TIMESTAMPTZ,
    
    CONSTRAINT valid_withdrawal_status CHECK (status IN ('pending', 'processing', 'completed', 'failed', 'cancelled'))
);

CREATE INDEX idx_withdrawals_user ON withdrawals(user_id);
CREATE INDEX idx_withdrawals_status ON withdrawals(status);
```

### 16.3 Oracle & Resolution Tables

```sql
-- Oracle Events
CREATE TABLE oracle_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    market_id UUID REFERENCES markets(id),
    
    event_type VARCHAR(50) NOT NULL,  -- 'data_update', 'resolution_proposed', 'resolution_confirmed', 'disputed'
    source VARCHAR(100) NOT NULL,
    
    data JSONB NOT NULL,
    
    reporter_address VARCHAR(42),
    signature TEXT,
    
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_oracle_market ON oracle_events(market_id);
CREATE INDEX idx_oracle_type ON oracle_events(event_type);

-- Disputes
CREATE TABLE disputes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    market_id UUID REFERENCES markets(id),
    
    disputer_id UUID REFERENCES users(id),
    original_outcome_id UUID REFERENCES outcomes(id),
    proposed_outcome_id UUID REFERENCES outcomes(id),
    
    reason TEXT NOT NULL,
    evidence_urls TEXT[],
    
    stake_amount DECIMAL(20,4),
    
    status VARCHAR(20) DEFAULT 'open',
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    resolved_at TIMESTAMPTZ,
    resolution_details JSONB,
    
    CONSTRAINT valid_dispute_status CHECK (status IN ('open', 'reviewing', 'upheld', 'rejected', 'escalated'))
);

CREATE INDEX idx_disputes_market ON disputes(market_id);
CREATE INDEX idx_disputes_status ON disputes(status);
```

### 16.4 Analytics Tables

```sql
-- Market Snapshots (TimescaleDB hypertable recommended)
CREATE TABLE market_snapshots (
    time TIMESTAMPTZ NOT NULL,
    market_id UUID NOT NULL,
    
    yes_price DECIMAL(10,4),
    no_price DECIMAL(10,4),
    liquidity DECIMAL(20,2),
    volume_1h DECIMAL(20,2),
    open_interest DECIMAL(20,2),
    trade_count INTEGER,
    unique_traders INTEGER
);

CREATE INDEX idx_snapshots_market_time ON market_snapshots(market_id, time DESC);

-- Platform Metrics
CREATE TABLE platform_metrics (
    time TIMESTAMPTZ NOT NULL,
    
    total_markets INTEGER,
    active_markets INTEGER,
    total_users INTEGER,
    active_users_24h INTEGER,
    
    total_volume_24h DECIMAL(20,2),
    total_liquidity DECIMAL(20,2),
    total_fees_24h DECIMAL(20,2),
    
    trades_24h INTEGER
);

-- User Analytics
CREATE TABLE user_analytics (
    user_id UUID REFERENCES users(id),
    
    total_trades INTEGER DEFAULT 0,
    total_volume DECIMAL(20,2) DEFAULT 0,
    total_pnl DECIMAL(20,2) DEFAULT 0,
    win_rate DECIMAL(5,2),
    
    first_trade_at TIMESTAMPTZ,
    last_trade_at TIMESTAMPTZ,
    
    updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

### 16.5 Redis Data Structures

```yaml
# Order Book (Sorted Sets)
orderbook:{marketId}:{outcome}:bids  # ZADD by price (descending)
orderbook:{marketId}:{outcome}:asks  # ZADD by price (ascending)

# Real-time Prices (Hash)
prices:{marketId}:
  yesPrice: "0.63"
  noPrice: "0.37"
  volume24h: "15000"
  lastUpdate: "1732793400"

# Session Management
session:{userId}:{sessionId}:
  accessToken: "..."
  expiresAt: "..."

# Rate Limiting (Sliding Window)
ratelimit:{walletAddress}:{endpoint}

# Pub/Sub Channels
channel:market:{marketId}:ticker
channel:market:{marketId}:trades
channel:user:{walletAddress}:orders
```

---

## 17. Authentication & Authorization

### 17.1 Sign-In with Ethereum (SIWE)

```
┌──────────────┐                    ┌──────────────┐                    ┌──────────────┐
│   Frontend   │                    │   Backend    │                    │  Blockchain  │
└──────┬───────┘                    └──────┬───────┘                    └──────┬───────┘
       │                                   │                                   │
       │  1. Request nonce                 │                                   │
       │──────────────────────────────────►│                                   │
       │                                   │                                   │
       │  2. Return nonce + expiry         │                                   │
       │◄──────────────────────────────────│                                   │
       │                                   │                                   │
       │  3. User signs message            │                                   │
       │   with wallet                     │                                   │
       │───────────────────────────────────┼──────────────────────────────────►│
       │                                   │                                   │
       │  4. Send signature + message      │                                   │
       │──────────────────────────────────►│                                   │
       │                                   │                                   │
       │                                   │  5. Verify signature              │
       │                                   │   (ecrecover)                     │
       │                                   │                                   │
       │  6. Return JWT tokens             │                                   │
       │◄──────────────────────────────────│                                   │
       │                                   │                                   │
```

### 17.2 SIWE Message Format

```
AfricaPredicts wants you to sign in with your Ethereum account:
0x1234567890123456789012345678901234567890

Sign in to AfricaPredicts to trade predictions on African markets.

URI: https://africapredicts.com
Version: 1
Chain ID: 137
Nonce: 8a7f3b2c1d4e5f6a
Issued At: 2025-11-28T10:30:00.000Z
Expiration Time: 2025-11-28T10:35:00.000Z
```

### 17.3 JWT Token Structure

```json
// Access Token (short-lived: 1 hour)
{
  "sub": "user-uuid",
  "wallet": "0x1234...",
  "role": "trader",
  "permissions": ["trade", "deposit", "withdraw"],
  "iat": 1732793400,
  "exp": 1732797000,
  "iss": "africapredicts.com"
}

// Refresh Token (long-lived: 7 days)
{
  "sub": "user-uuid",
  "sessionId": "session-uuid",
  "iat": 1732793400,
  "exp": 1733398200,
  "type": "refresh"
}
```

### 17.4 Role-Based Access Control

| Role | Permissions |
|------|-------------|
| `guest` | View markets, view prices |
| `trader` | + Trade, deposit, withdraw, view positions |
| `liquidity_provider` | + Add/remove liquidity, view pool stats |
| `oracle` | + Submit resolution data, propose outcomes |
| `admin` | + Create markets, resolve disputes, pause trading, manage users |
| `superadmin` | + Treasury operations, contract upgrades, role management |

### 17.5 Authorization Middleware

```typescript
// NestJS Guard Example
@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<Role[]>('roles', [
      context.getHandler(),
      context.getClass(),
    ]);
    
    if (!requiredRoles) return true;
    
    const { user } = context.switchToHttp().getRequest();
    return requiredRoles.some((role) => user.roles?.includes(role));
  }
}

// Usage
@Post('markets')
@Roles(Role.Admin)
@UseGuards(AuthGuard, RolesGuard)
async createMarket(@Body() dto: CreateMarketDto) {
  // ...
}
```

---

## 18. Trading Engine

### 18.1 Order Matching Architecture

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                           TRADING ENGINE                                     │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  ┌────────────────┐    ┌────────────────┐    ┌────────────────────────────┐ │
│  │  Order Queue   │───►│ Matching Core  │───►│  Execution & Settlement    │ │
│  │  (Redis)       │    │                │    │                            │ │
│  └────────────────┘    │  ┌──────────┐  │    │  ┌─────────┐  ┌─────────┐  │ │
│                        │  │Price-Time│  │    │  │ Trade   │  │Position │  │ │
│  ┌────────────────┐    │  │ Priority │  │    │  │ Record  │  │ Update  │  │ │
│  │ Order Book     │◄──►│  └──────────┘  │    │  └─────────┘  └─────────┘  │ │
│  │ (Redis/Memory) │    │                │    │                            │ │
│  │                │    │  ┌──────────┐  │    │  ┌─────────┐  ┌─────────┐  │ │
│  │ YES: Bids/Asks │    │  │  AMM     │  │    │  │ Balance │  │Contract │  │ │
│  │ NO:  Bids/Asks │    │  │ Fallback │  │    │  │ Update  │  │  Sync   │  │ │
│  └────────────────┘    │  └──────────┘  │    │  └─────────┘  └─────────┘  │ │
│                        └────────────────┘    └────────────────────────────┘ │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

### 18.2 Order Types

| Type | Behavior | Use Case |
|------|----------|----------|
| **Limit** | Execute at specified price or better | Patient traders wanting specific price |
| **Market** | Execute immediately at best available | Immediate execution, accepts slippage |
| **Stop** | Becomes market order when price triggers | Risk management |
| **Stop-Limit** | Becomes limit order when price triggers | Controlled risk management |

### 18.3 Matching Algorithm

```typescript
interface MatchResult {
  trades: Trade[];
  remainingOrder: Order | null;
}

function matchOrder(incomingOrder: Order, orderBook: OrderBook): MatchResult {
  const trades: Trade[] = [];
  let remaining = incomingOrder.size;
  
  // Get opposite side of book
  const oppositeSide = incomingOrder.side === 'buy' 
    ? orderBook.asks  // Buy matches against asks
    : orderBook.bids; // Sell matches against bids
  
  // Sort by price-time priority
  const sortedOrders = oppositeSide.sort((a, b) => {
    if (incomingOrder.side === 'buy') {
      // Buy: match lowest asks first
      return a.price - b.price || a.createdAt - b.createdAt;
    } else {
      // Sell: match highest bids first
      return b.price - a.price || a.createdAt - b.createdAt;
    }
  });
  
  for (const restingOrder of sortedOrders) {
    if (remaining <= 0) break;
    
    // Check price compatibility
    const priceMatch = incomingOrder.side === 'buy'
      ? incomingOrder.price >= restingOrder.price
      : incomingOrder.price <= restingOrder.price;
    
    if (!priceMatch && incomingOrder.type === 'limit') break;
    
    // Execute trade
    const tradeSize = Math.min(remaining, restingOrder.remaining);
    const tradePrice = restingOrder.price; // Price-time: use resting order price
    
    trades.push({
      makerOrderId: restingOrder.id,
      takerOrderId: incomingOrder.id,
      price: tradePrice,
      size: tradeSize,
    });
    
    remaining -= tradeSize;
  }
  
  return {
    trades,
    remainingOrder: remaining > 0 ? { ...incomingOrder, remaining } : null,
  };
}
```

### 18.4 Price Calculation

**Binary Market Price Relationship:**
```
YES_price + NO_price = 1.00

If YES = 0.63, then NO = 0.37
```

**Price from Order Book:**
```typescript
function calculateMidPrice(orderBook: OutcomeOrderBook): number {
  const bestBid = orderBook.bids[0]?.price ?? 0;
  const bestAsk = orderBook.asks[0]?.price ?? 1;
  return (bestBid + bestAsk) / 2;
}

function calculateSpread(orderBook: OutcomeOrderBook): number {
  const bestBid = orderBook.bids[0]?.price ?? 0;
  const bestAsk = orderBook.asks[0]?.price ?? 1;
  return bestAsk - bestBid;
}
```

### 18.5 AMM Integration (Constant Product)

For markets with low order book liquidity, use AMM as fallback:

```typescript
// Constant Product Market Maker: x * y = k
interface AMMPool {
  yesShares: number;  // x
  noShares: number;   // y
  k: number;          // x * y (constant)
}

function calculateBuyPrice(
  pool: AMMPool, 
  outcome: 'yes' | 'no', 
  amount: number
): { price: number; slippage: number } {
  const { yesShares, noShares, k } = pool;
  
  if (outcome === 'yes') {
    // Buying YES: send USDC, receive YES shares
    // New pool state: (yesShares - output) * (noShares + input) = k
    const outputShares = yesShares - (k / (noShares + amount));
    const effectivePrice = amount / outputShares;
    const spotPrice = noShares / (yesShares + noShares);
    const slippage = (effectivePrice - spotPrice) / spotPrice;
    
    return { price: effectivePrice, slippage };
  }
  // Similar for NO...
}

function executeAMMTrade(
  pool: AMMPool,
  outcome: 'yes' | 'no',
  amount: number,
  maxSlippage: number
): TradeResult {
  const { price, slippage } = calculateBuyPrice(pool, outcome, amount);
  
  if (slippage > maxSlippage) {
    throw new SlippageExceededError(slippage, maxSlippage);
  }
  
  // Update pool state
  // Record trade
  // Return result
}
```

### 18.6 Fee Structure

| Fee Type | Rate | Description |
|----------|------|-------------|
| **Taker Fee** | 0.30% | Paid by order that crosses spread |
| **Maker Rebate** | -0.05% | Rebate for providing liquidity |
| **Settlement Fee** | 1.00% | Paid on winning position claim |
| **Withdrawal Fee** | $0.50 | Fixed per withdrawal |

```typescript
function calculateFees(trade: Trade, userRole: 'maker' | 'taker'): number {
  const feeRate = userRole === 'taker' ? 0.003 : -0.0005;
  return trade.size * trade.price * feeRate;
}
```

---

## 19. Liquidity Management

### 19.1 Liquidity Pool Architecture

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                        LIQUIDITY POOL (Per Market)                           │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│   ┌─────────────────────────────────────────────────────────────────────┐   │
│   │                      COLLATERAL VAULT                                │   │
│   │                         (USDC/USDT)                                  │   │
│   │                                                                      │   │
│   │   Total Collateral: $125,000                                        │   │
│   │   LP Shares Outstanding: 100,000                                    │   │
│   │   Share Price: $1.25                                                │   │
│   └─────────────────────────────────────────────────────────────────────┘   │
│                                    │                                         │
│                    ┌───────────────┴───────────────┐                        │
│                    ▼                               ▼                         │
│   ┌─────────────────────────────┐   ┌─────────────────────────────┐        │
│   │      YES OUTCOME POOL       │   │      NO OUTCOME POOL        │        │
│   │                             │   │                             │        │
│   │   Shares: 50,000            │   │   Shares: 50,000            │        │
│   │   Price: $0.63              │   │   Price: $0.37              │        │
│   │   Value: $31,500            │   │   Value: $18,500            │        │
│   └─────────────────────────────┘   └─────────────────────────────┘        │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

### 19.2 LP Token Economics

```typescript
interface LPPosition {
  userId: string;
  marketId: string;
  lpShares: number;
  depositedValue: number;
  currentValue: number;
  feesEarned: number;
}

// Deposit to pool
function depositLiquidity(
  pool: LiquidityPool,
  amount: number
): { lpShares: number } {
  const sharePrice = pool.totalCollateral / pool.lpSharesOutstanding;
  const newShares = amount / sharePrice;
  
  pool.totalCollateral += amount;
  pool.lpSharesOutstanding += newShares;
  
  // Mint equal YES and NO shares to maintain balance
  const yesShares = amount / 2 / pool.yesPrice;
  const noShares = amount / 2 / pool.noPrice;
  
  return { lpShares: newShares };
}

// Withdraw from pool
function withdrawLiquidity(
  pool: LiquidityPool,
  lpShares: number
): { amount: number } {
  const sharePrice = pool.totalCollateral / pool.lpSharesOutstanding;
  const withdrawAmount = lpShares * sharePrice;
  
  pool.totalCollateral -= withdrawAmount;
  pool.lpSharesOutstanding -= lpShares;
  
  return { amount: withdrawAmount };
}
```

### 19.3 Impermanent Loss Protection

```typescript
function calculateImpermanentLoss(
  initialYesPrice: number,
  currentYesPrice: number
): number {
  // IL = 2 * sqrt(priceRatio) / (1 + priceRatio) - 1
  const priceRatio = currentYesPrice / initialYesPrice;
  const sqrtRatio = Math.sqrt(priceRatio);
  const il = (2 * sqrtRatio) / (1 + priceRatio) - 1;
  return Math.abs(il);
}

// Example: If YES price moves from 0.50 to 0.80
// IL = 2 * sqrt(1.6) / (1 + 1.6) - 1 = -1.54% loss
```

### 19.4 Risk Management

| Parameter | Value | Description |
|-----------|-------|-------------|
| Max Pool Size | $500,000 | Per market cap |
| Min Deposit | $100 | Minimum LP deposit |
| Withdrawal Cooldown | 24 hours | After deposit |
| Max Slippage | 5% | Per trade limit |
| Circuit Breaker | 10% move | Pause trading on rapid moves |

---

## 20. Oracle & Resolution System

### 20.1 Resolution Workflow

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                          MARKET RESOLUTION FLOW                              │
└─────────────────────────────────────────────────────────────────────────────┘

    ACTIVE              PENDING              IN REVIEW            RESOLVED
       │                   │                    │                    │
       │   Market          │   Resolution       │   Dispute          │   Payouts
       │   Expires         │   Proposed         │   Period           │   Processed
       ▼                   ▼                    ▼                    ▼
   ┌───────┐           ┌───────┐           ┌───────┐           ┌───────┐
   │Trading│──expires─►│Oracle │──submits─►│Review │──confirms─►│Settled│
   │ Open  │           │Submits│           │Period │           │       │
   └───────┘           │Result │           │(24hr) │           └───────┘
                       └───────┘           └───┬───┘
                                               │
                                          disputed?
                                               │
                                               ▼
                                          ┌───────┐
                                          │Dispute│
                                          │Process│
                                          └───────┘
```

### 20.2 Oracle Data Sources

| Source Type | Examples | Use Cases |
|-------------|----------|-----------|
| **Official APIs** | Government election commissions, FIFA | Election results, sports scores |
| **News Aggregators** | Reuters, AFP, official announcements | Political events, business news |
| **Chainlink** | Price feeds, sports data | Crypto prices, verifiable data |
| **Custom Reporters** | AfricaPredicts analysts | Regional events, entertainment |

### 20.3 Resolution Contract Interface

```solidity
interface IMarketResolution {
    enum ResolutionStatus {
        Unresolved,
        Proposed,
        Confirmed,
        Disputed,
        Finalized
    }
    
    struct Resolution {
        bytes32 marketId;
        uint8 winningOutcome;  // 0 = NO, 1 = YES, 2 = INVALID
        bytes32 evidenceHash;
        uint256 proposedAt;
        uint256 disputeDeadline;
        ResolutionStatus status;
    }
    
    function proposeResolution(
        bytes32 marketId,
        uint8 winningOutcome,
        bytes32 evidenceHash
    ) external;
    
    function disputeResolution(
        bytes32 marketId,
        uint8 proposedOutcome,
        string calldata reason
    ) external payable;  // Requires stake
    
    function finalizeResolution(bytes32 marketId) external;
    
    function claimWinnings(bytes32 marketId) external;
}
```

### 20.4 Dispute Resolution Process

```yaml
Dispute Stages:
  1. Initial Dispute (24 hours)
     - User stakes 1% of their position value
     - Provides evidence links
     - Original resolution paused
  
  2. Community Review (48 hours)
     - Other users can support dispute
     - Evidence reviewed by oracle committee
  
  3. Arbitration (if needed)
     - 3-of-5 multisig of trusted arbiters
     - Reviews all evidence
     - Final decision binding
  
  4. Resolution
     - If dispute upheld: New outcome set, disputer stake returned + bonus
     - If dispute rejected: Original outcome confirmed, stake forfeited
```

### 20.5 Settlement Calculation

```typescript
interface Settlement {
  userId: string;
  marketId: string;
  outcome: 'yes' | 'no' | 'invalid';
  shares: number;
  payout: number;
  fee: number;
  netPayout: number;
}

function calculateSettlement(
  position: Position,
  resolution: Resolution
): Settlement {
  const isWinner = position.outcome === resolution.winningOutcome;
  
  if (resolution.winningOutcome === 'invalid') {
    // Refund at entry price
    return {
      payout: position.shares * position.avgEntryPrice,
      fee: 0,
      netPayout: position.shares * position.avgEntryPrice,
    };
  }
  
  if (isWinner) {
    // Winning shares pay out $1 each
    const payout = position.shares * 1.00;
    const fee = payout * 0.01; // 1% settlement fee
    return {
      payout,
      fee,
      netPayout: payout - fee,
    };
  }
  
  // Losing position
  return {
    payout: 0,
    fee: 0,
    netPayout: 0,
  };
}
```

---

## 21. Smart Contract Architecture

### 21.1 Contract Overview

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                        SMART CONTRACT ARCHITECTURE                           │
└─────────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────────┐
│                              CORE CONTRACTS                                  │
│                                                                              │
│  ┌────────────────────┐    ┌────────────────────┐    ┌──────────────────┐  │
│  │   MarketFactory    │───►│   PredictionMarket │───►│  OutcomeToken    │  │
│  │                    │    │   (per market)     │    │  (ERC-1155)      │  │
│  │  • createMarket()  │    │                    │    │                  │  │
│  │  • getMarket()     │    │  • buy()           │    │  • YES tokens    │  │
│  │  • listMarkets()   │    │  • sell()          │    │  • NO tokens     │  │
│  └────────────────────┘    │  • claim()         │    │                  │  │
│                            │  • resolve()       │    └──────────────────┘  │
│                            └────────────────────┘                           │
│                                     │                                        │
│                    ┌────────────────┴────────────────┐                      │
│                    ▼                                 ▼                       │
│  ┌────────────────────┐              ┌────────────────────┐                 │
│  │   CollateralVault  │              │    LiquidityPool   │                 │
│  │                    │              │                    │                 │
│  │  • deposit()       │              │  • addLiquidity()  │                 │
│  │  • withdraw()      │              │  • removeLiquidity │                 │
│  │  • lockCollateral()│              │  • getPoolState()  │                 │
│  │  • release()       │              │  • calculateSwap() │                 │
│  └────────────────────┘              └────────────────────┘                 │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────────┐
│                           GOVERNANCE CONTRACTS                               │
│                                                                              │
│  ┌────────────────────┐    ┌────────────────────┐    ┌──────────────────┐  │
│  │   OracleRegistry   │    │   DisputeResolver  │    │    Treasury      │  │
│  │                    │    │                    │    │                  │  │
│  │  • registerOracle()│    │  • openDispute()   │    │  • collectFees() │  │
│  │  • submitResult()  │    │  • vote()          │    │  • distribute()  │  │
│  │  • slashOracle()   │    │  • resolve()       │    │  • emergencyStop │  │
│  └────────────────────┘    └────────────────────┘    └──────────────────┘  │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

### 21.2 Core Contract Interfaces

```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

interface IMarketFactory {
    event MarketCreated(
        bytes32 indexed marketId,
        address marketAddress,
        string title,
        uint256 expiresAt
    );
    
    function createMarket(
        string calldata title,
        string calldata description,
        string calldata category,
        string calldata country,
        uint256 expiresAt,
        uint256 resolutionDeadline
    ) external returns (bytes32 marketId, address marketAddress);
    
    function getMarket(bytes32 marketId) external view returns (address);
    
    function getActiveMarkets() external view returns (bytes32[] memory);
}

interface IPredictionMarket {
    enum MarketStatus { Active, Paused, Resolved, Disputed, Cancelled }
    enum Outcome { No, Yes, Invalid }
    
    struct MarketInfo {
        bytes32 id;
        string title;
        MarketStatus status;
        Outcome resolution;
        uint256 totalYesShares;
        uint256 totalNoShares;
        uint256 totalCollateral;
        uint256 expiresAt;
        uint256 resolvedAt;
    }
    
    event SharesPurchased(
        address indexed buyer,
        Outcome outcome,
        uint256 shares,
        uint256 cost
    );
    
    event SharesSold(
        address indexed seller,
        Outcome outcome,
        uint256 shares,
        uint256 proceeds
    );
    
    event MarketResolved(Outcome outcome, bytes32 evidenceHash);
    
    event WinningsClaimed(address indexed user, uint256 amount);
    
    function buy(
        Outcome outcome,
        uint256 minShares,
        uint256 maxCost
    ) external returns (uint256 sharesBought, uint256 cost);
    
    function sell(
        Outcome outcome,
        uint256 shares,
        uint256 minProceeds
    ) external returns (uint256 proceeds);
    
    function claimWinnings() external returns (uint256 payout);
    
    function getPosition(address user) external view returns (
        uint256 yesShares,
        uint256 noShares
    );
    
    function getPrice(Outcome outcome) external view returns (uint256);
    
    function getMarketInfo() external view returns (MarketInfo memory);
}

interface ICollateralVault {
    event Deposited(address indexed user, address token, uint256 amount);
    event Withdrawn(address indexed user, address token, uint256 amount);
    
    function deposit(address token, uint256 amount) external;
    
    function withdraw(address token, uint256 amount) external;
    
    function getBalance(
        address user,
        address token
    ) external view returns (uint256 available, uint256 locked);
    
    function lockCollateral(
        address user,
        address token,
        uint256 amount
    ) external;
    
    function releaseCollateral(
        address user,
        address token,
        uint256 amount
    ) external;
}
```

### 21.3 Deployment Addresses (Planned)

| Contract | Polygon | Arbitrum | BSC |
|----------|---------|----------|-----|
| MarketFactory | TBD | TBD | TBD |
| CollateralVault | TBD | TBD | TBD |
| LiquidityPool | TBD | TBD | TBD |
| OracleRegistry | TBD | TBD | TBD |
| Treasury | TBD | TBD | TBD |

### 21.4 Contract Security Requirements

| Requirement | Implementation |
|-------------|----------------|
| Access Control | OpenZeppelin AccessControl |
| Reentrancy Protection | ReentrancyGuard on all external calls |
| Pausable | Emergency pause by multisig |
| Upgradeable | UUPS proxy pattern |
| Audited | Trail of Bits / OpenZeppelin audit required |

---

## 22. Real-Time Infrastructure

### 22.1 WebSocket Architecture

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                        REAL-TIME EVENT FLOW                                  │
└─────────────────────────────────────────────────────────────────────────────┘

  Trading Engine                Redis Pub/Sub              WebSocket Gateway
       │                             │                            │
       │  1. Trade executed          │                            │
       │─────────────────────────────►│                            │
       │                             │  2. Publish to channels    │
       │                             │───────────────────────────►│
       │                             │                            │
       │                             │     ┌────────────────────┐ │
       │                             │     │  Channel Router    │ │
       │                             │     │                    │ │
       │                             │     │  market:*:ticker   │ │
       │                             │     │  market:*:trades   │ │
       │                             │     │  user:*:orders     │ │
       │                             │     └─────────┬──────────┘ │
       │                             │               │            │
       │                             │               ▼            │
       │                             │     ┌────────────────────┐ │
       │                             │     │  Connected Clients │ │
       │                             │     │                    │ │
       │                             │     │  Client A ───────► │ │
       │                             │     │  Client B ───────► │ │
       │                             │     │  Client C ───────► │ │
       │                             │     └────────────────────┘ │
       │                             │                            │
```

### 22.2 Event Types

```typescript
// Price ticker update (every 1 second if changed)
interface TickerEvent {
  type: 'ticker';
  marketId: string;
  data: {
    yesPrice: number;
    noPrice: number;
    yesBestBid: number;
    yesBestAsk: number;
    noBestBid: number;
    noBestAsk: number;
    volume24h: number;
    change24h: number;
    timestamp: number;
  };
}

// Trade event (immediate)
interface TradeEvent {
  type: 'trade';
  marketId: string;
  data: {
    id: string;
    outcome: 'yes' | 'no';
    side: 'buy' | 'sell';
    price: number;
    size: number;
    timestamp: number;
  };
}

// Order book update (immediate)
interface OrderBookEvent {
  type: 'orderbook';
  marketId: string;
  data: {
    updateType: 'delta' | 'snapshot';
    outcome: 'yes' | 'no';
    changes: Array<{
      side: 'bid' | 'ask';
      price: number;
      size: number;  // 0 = remove level
    }>;
  };
}

// User order update (private channel)
interface OrderUpdateEvent {
  type: 'order';
  data: {
    orderId: string;
    status: 'open' | 'partial' | 'filled' | 'cancelled';
    filledSize: number;
    remainingSize: number;
    avgFillPrice: number;
    timestamp: number;
  };
}
```

### 22.3 Scaling Considerations

| Component | Strategy | Target |
|-----------|----------|--------|
| WebSocket Connections | Horizontal scaling with sticky sessions | 100,000 concurrent |
| Message Throughput | Redis Cluster for pub/sub | 50,000 msg/sec |
| Latency | Edge deployment | <100ms global |
| Reconnection | Automatic with exponential backoff | 99.9% uptime |

---

## 23. Analytics & Reporting

### 23.1 Platform Metrics Dashboard

```yaml
Real-Time Metrics:
  - Total Value Locked (TVL)
  - 24h Trading Volume
  - Active Markets Count
  - Active Users (24h)
  - Pending Resolutions
  - Open Disputes

Market Analytics:
  - Volume by Category
  - Volume by Country
  - Most Active Markets
  - Highest Liquidity Markets
  - Price Movement Leaders

User Analytics:
  - New User Registrations
  - User Retention Rate
  - Average Position Size
  - Win Rate Distribution
  - Top Traders Leaderboard
```

### 23.2 API Endpoints for Analytics

```yaml
GET /api/v1/analytics/platform
  Response:
    {
      "tvl": 1250000,
      "volume24h": 125000,
      "volume7d": 850000,
      "activeMarkets": 45,
      "resolvedMarkets": 123,
      "activeUsers24h": 1250,
      "totalUsers": 15000,
      "pendingResolutions": 5,
      "openDisputes": 1
    }

GET /api/v1/analytics/markets
  Query: category, country, period
  Response:
    {
      "topByVolume": [...],
      "topByLiquidity": [...],
      "recentlyResolved": [...],
      "trendingMarkets": [...]
    }

GET /api/v1/analytics/user/:walletAddress
  Headers: Authorization (admin or self)
  Response:
    {
      "totalTrades": 156,
      "totalVolume": 45000,
      "winRate": 0.62,
      "totalPnl": 2500,
      "averagePositionSize": 288,
      "favoriteCategory": "politics",
      "activePositions": 5,
      "performanceHistory": [...]
    }

GET /api/v1/analytics/leaderboard
  Query: period (daily, weekly, monthly, all-time)
  Response:
    {
      "topTraders": [
        {
          "rank": 1,
          "wallet": "0x...",
          "ens": "trader.eth",
          "pnl": 15000,
          "winRate": 0.75,
          "trades": 234
        }
      ]
    }
```

### 23.3 Data Pipeline Architecture

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                         ANALYTICS PIPELINE                                   │
└─────────────────────────────────────────────────────────────────────────────┘

  Source Data              Processing              Storage              Serving
      │                        │                      │                    │
      ▼                        ▼                      ▼                    ▼
┌───────────┐           ┌───────────┐          ┌───────────┐       ┌───────────┐
│ PostgreSQL│──────────►│  Apache   │─────────►│TimescaleDB│──────►│ REST API  │
│  (OLTP)   │           │  Kafka    │          │(Time-series)      │           │
└───────────┘           └───────────┘          └───────────┘       └───────────┘
                               │                      │
                               ▼                      ▼
                        ┌───────────┐          ┌───────────┐
                        │  Spark    │          │ Snowflake │
                        │ Streaming │          │   (DWH)   │
                        └───────────┘          └───────────┘
                               │                      │
                               ▼                      ▼
                        ┌───────────┐          ┌───────────┐
                        │  Redis    │          │  Metabase │
                        │ (Cache)   │          │   (BI)    │
                        └───────────┘          └───────────┘
```

---

## 24. Admin & Operations

### 24.1 Admin Dashboard Features

```yaml
Market Management:
  - Create new markets (title, category, country, expiry)
  - Edit market details
  - Pause/resume trading
  - Force market resolution
  - Cancel market (with refunds)

User Management:
  - View user profiles
  - Adjust user roles
  - Freeze/unfreeze accounts
  - View transaction history
  - Manual balance adjustments (audited)

Oracle Management:
  - Register/revoke oracles
  - View oracle performance
  - Override resolution (multisig required)
  - Manage dispute queue

Liquidity Operations:
  - View all pools
  - Emergency liquidity withdrawal
  - Adjust fee parameters
  - Set market caps

Treasury:
  - View fee collection
  - Initiate distributions
  - Emergency fund access
  - Audit trail

System Health:
  - Service status dashboard
  - Error rate monitoring
  - Performance metrics
  - Blockchain sync status
```

### 24.2 Admin API Endpoints

```yaml
POST /api/v1/admin/markets
  Description: Create new market
  Auth: Role: admin
  Request:
    {
      "title": "Will Nigeria win AFCON 2025?",
      "description": "...",
      "category": "sports",
      "country": "Nigeria",
      "expiresAt": "2025-02-15T23:59:59Z",
      "resolutionDeadline": "2025-02-20T23:59:59Z",
      "initialLiquidity": 10000
    }

PATCH /api/v1/admin/markets/:id/status
  Description: Change market status
  Auth: Role: admin
  Request:
    { "status": "paused", "reason": "Awaiting clarification" }

POST /api/v1/admin/markets/:id/resolve
  Description: Force market resolution
  Auth: Role: admin, requires multisig for override
  Request:
    {
      "outcome": "yes",
      "evidence": "https://...",
      "overrideDispute": false
    }

POST /api/v1/admin/users/:id/freeze
  Description: Freeze user account
  Auth: Role: admin
  Request:
    { "reason": "Suspicious activity", "duration": "24h" }

GET /api/v1/admin/audit-log
  Description: Get admin action audit log
  Auth: Role: superadmin
  Query: action, admin, startDate, endDate
  Response:
    {
      "logs": [
        {
          "id": "uuid",
          "adminId": "uuid",
          "action": "market_resolved",
          "targetType": "market",
          "targetId": "uuid",
          "details": {...},
          "timestamp": "2025-11-28T10:30:00Z",
          "ipAddress": "..."
        }
      ]
    }
```

### 24.3 Operational Runbooks

```yaml
Market Resolution Failure:
  1. Check oracle service logs
  2. Verify blockchain transaction status
  3. If stuck, escalate to on-call engineer
  4. Manual resolution via admin dashboard if needed
  5. Document incident

High Volume Alert:
  1. Monitor error rates and latency
  2. Scale up API and trading engine instances
  3. Enable rate limiting if needed
  4. Notify team via PagerDuty

Smart Contract Issue:
  1. Immediately pause affected markets
  2. Assess impact and affected users
  3. Engage security team
  4. Prepare communication for users
  5. Deploy fix (if possible) or execute emergency procedures

Database Performance:
  1. Check slow query logs
  2. Analyze query plans
  3. Add indexes if needed
  4. Consider read replica scaling
  5. Archive old data if necessary
```

---

## 25. Implementation Roadmap

### 25.1 Development Phases

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                       IMPLEMENTATION TIMELINE                                │
└─────────────────────────────────────────────────────────────────────────────┘

Phase 0: Infrastructure (Weeks 1-2)
├── Set up PostgreSQL, Redis, message queue
├── Configure CI/CD pipeline
├── Deploy staging environment
├── Set up monitoring (DataDog/Grafana)
└── Security baseline (secrets management, VPN)

Phase 1: Core Backend (Weeks 3-6)
├── NestJS project scaffold
├── SIWE authentication system
├── User management APIs
├── Market CRUD APIs (with mock data migration)
├── Basic wallet APIs (deposit/withdraw)
└── Connect frontend to new APIs

Phase 2: Trading Engine (Weeks 7-10)
├── Order matching engine
├── Order book management
├── Position tracking
├── AMM integration
├── Fee calculation
├── Real-time WebSocket events
└── Trading API endpoints

Phase 3: Smart Contracts (Weeks 11-14)
├── Develop core contracts
├── Unit and integration tests
├── Testnet deployment
├── Backend contract integration
├── Frontend contract hooks
└── Security audit (external)

Phase 4: Oracle & Resolution (Weeks 15-17)
├── Oracle service development
├── Resolution workflow
├── Dispute system
├── Settlement processing
├── Claims processing
└── Admin resolution tools

Phase 5: Analytics & Polish (Weeks 18-20)
├── Analytics data pipeline
├── Reporting APIs
├── Leaderboard system
├── Admin dashboard
├── Performance optimization
└── Load testing

Phase 6: Launch Preparation (Weeks 21-22)
├── Security review
├── Bug bounty program
├── Documentation completion
├── Mainnet contract deployment
├── Gradual rollout
└── Go-live!
```

### 25.2 Success Criteria

| Phase | Criteria |
|-------|----------|
| Phase 1 | Users can sign in with wallet, view markets from API |
| Phase 2 | Users can place orders, trades execute <500ms latency |
| Phase 3 | Contracts deployed, positions reflect on-chain |
| Phase 4 | Markets resolve correctly, payouts process |
| Phase 5 | Analytics dashboard live, <2s page loads |
| Phase 6 | Mainnet live, $100k+ TVL within 30 days |

### 25.3 Team Requirements

| Role | Count | Responsibilities |
|------|-------|------------------|
| Backend Engineer | 2-3 | API, trading engine, services |
| Smart Contract Dev | 1-2 | Solidity, testing, audits |
| DevOps Engineer | 1 | Infrastructure, CI/CD, monitoring |
| QA Engineer | 1 | Testing, automation |
| Product Manager | 1 | Requirements, coordination |

---

## 26. Appendices

### 26.1 Glossary

| Term | Definition |
|------|------------|
| **Prediction Market** | A market where participants trade on event outcomes |
| **YES/NO Price** | Probability of outcome (0.63 = 63% YES) |
| **Liquidity** | Available funds in market for trading |
| **AMM** | Automated Market Maker - algorithmic pricing |
| **CPMM** | Constant Product Market Maker (x*y=k) |
| **Order Book** | List of buy/sell orders at various prices |
| **Maker** | Trader who adds liquidity (limit order) |
| **Taker** | Trader who removes liquidity (crosses spread) |
| **SIWE** | Sign-In with Ethereum (EIP-4361) |
| **Oracle** | Service providing external data for resolution |
| **TVL** | Total Value Locked in platform |
| **Slippage** | Price movement during trade execution |
| **LP** | Liquidity Provider |
| **Wagmi** | React hooks library for Ethereum |
| **RainbowKit** | Wallet connection UI library |
| **Zustand** | Lightweight React state management |
| **Viem** | TypeScript Ethereum library |

### 26.2 File Quick Reference

| File | Purpose |
|------|---------|
| `app/layout.tsx` | Root layout with providers |
| `app/providers.tsx` | Web3 context setup |
| `components/PredictionsBoard.tsx` | Main market grid |
| `components/PredictionDetail.tsx` | Market detail view |
| `components/WalletDashboard.tsx` | Wallet management |
| `data/predictions.ts` | Mock market data |
| `lib/stores/useWalletStore.ts` | Zustand state |
| `tailwind.config.js` | Design tokens |

### 26.3 API Error Codes

| Code | Meaning |
|------|---------|
| 1001 | Invalid wallet signature |
| 1002 | Session expired |
| 1003 | Insufficient permissions |
| 2001 | Market not found |
| 2002 | Market not active |
| 2003 | Market expired |
| 3001 | Insufficient balance |
| 3002 | Order price invalid |
| 3003 | Order size too small |
| 3004 | Slippage exceeded |
| 4001 | Withdrawal pending |
| 4002 | Withdrawal limit exceeded |
| 5001 | Rate limit exceeded |

### 26.4 Related Documentation

- `README.md` - Project overview and quick start
- `replit.md` - Replit-specific configuration
- `package.json` - Frontend dependencies
- Smart Contract Documentation - (To be created)
- API Documentation - (Swagger/OpenAPI spec to be generated)

### 26.5 Revision History

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | Nov 28, 2025 | Agent | Initial TAD - Frontend architecture |
| 2.0 | Nov 28, 2025 | Agent | Added complete backend specifications |

---

**End of Technical Architecture Document**
