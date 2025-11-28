# AfricaPredicts — Technical Architecture Document (TAD)

**Version:** 1.0  
**Date:** November 28, 2025  
**Status:** Production-Ready Frontend Demo  
**Classification:** Internal Technical Reference

---

## Table of Contents

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
14. [Future Roadmap](#14-future-roadmap)
15. [Appendices](#15-appendices)

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

## 14. Future Roadmap

### 14.1 Phase 1: Backend Foundation (Planned)

**Objective:** Replace mock data with real API

**Prerequisites:**
- Database setup (PostgreSQL recommended)
- API framework (Next.js API routes or separate service)
- Authentication service

**Endpoints to Implement:**
```
GET  /api/markets              # List markets with pagination
GET  /api/markets/:slug        # Single market detail
GET  /api/markets/filter       # Filter by country/category
POST /api/markets/:id/trade    # Execute trade (mock)
```

### 14.2 Phase 2: Real Web3 Integration (Planned)

**Objective:** Connect to deployed smart contracts

**Requirements:**
- Deployed prediction market contracts
- Contract ABI integration in frontend
- Transaction signing flows
- Confirmation handling

**Wagmi Integration:**
```typescript
// Future contract hooks
const { write: buyYes } = useContractWrite({
  address: MARKET_CONTRACT,
  abi: marketAbi,
  functionName: 'buyYes',
});
```

### 14.3 Phase 3: Oracle & Resolution (Planned)

**Objective:** Implement market resolution

**Components:**
- Oracle service for outcome verification
- Claim winnings flow
- Dispute resolution UI

### 14.4 Phase 4: Analytics & Enhancement (Planned)

**Features:**
- Price history charts (real data)
- User portfolio tracking
- Leaderboards
- Notifications

---

## 15. Appendices

### 15.1 Glossary

| Term | Definition |
|------|------------|
| **Prediction Market** | A market where participants trade on event outcomes |
| **YES/NO Price** | Probability of outcome (0.63 = 63% YES) |
| **Liquidity** | Available funds in market for trading |
| **Wagmi** | React hooks library for Ethereum |
| **RainbowKit** | Wallet connection UI library |
| **Zustand** | Lightweight React state management |
| **App Router** | Next.js 13+ file-based routing |
| **Viem** | TypeScript Ethereum library |

### 15.2 File Quick Reference

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

### 15.3 Related Documentation

- `README.md` - Project overview and quick start
- `replit.md` - Replit-specific configuration
- `package.json` - Dependencies and scripts

### 15.4 Revision History

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | Nov 28, 2025 | Agent | Initial TAD creation |

---

**End of Technical Architecture Document**
