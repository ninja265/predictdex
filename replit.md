# AfricaPredicts — Pan-African Prediction Exchange

## Overview
AfricaPredicts is a Next.js 13 (App Router) Web3 prediction market application focused on African narratives. The app features predictions on politics, entertainment, sports, and crypto across the continent. Built with a futuristic, pan-African dark theme aesthetic.

**Status:** Development - Frontend fully functional with mock data
**Last Updated:** November 28, 2025

## Tech Stack
- **Framework:** Next.js 13 (App Router) + React 18
- **Styling:** Tailwind CSS with custom pan-African theme (royal blue, gold, dark backgrounds)
- **State Management:** Zustand
- **Web3:** Wagmi + RainbowKit for wallet connectivity (MetaMask, WalletConnect)
- **Blockchain:** Supports Ethereum, Polygon, Arbitrum, and BSC chains
- **Typography:** Inter & DM Sans fonts

## Project Structure
```
├── app/                    # Next.js App Router pages
│   ├── page.tsx           # Landing page with hero and top predictions
│   ├── markets/           # Markets directory and detail pages
│   ├── wallet/            # Wallet dashboard
│   ├── account/           # User account page
│   ├── country/[country]/ # Dynamic country-specific pages
│   └── category/[category]/ # Dynamic category-specific pages
├── components/            # Reusable UI components
│   ├── Navbar.tsx         # Main navigation
│   ├── PredictionsBoard.tsx # Markets grid display
│   ├── PredictionCard.tsx  # Individual market card
│   ├── ConnectWalletButton.tsx # Web3 wallet connection
│   └── ...
├── data/
│   └── predictions.ts     # Mock market data
└── lib/stores/
    └── useWalletStore.ts  # Zustand wallet state
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

## Key Features
✅ Immersive landing page with top 10 predictions
✅ Markets directory with country and category filtering
✅ Dedicated market detail pages with order book and trade forms
✅ Web3 wallet integration (RainbowKit)
✅ Wallet dashboard with mock deposit/withdrawal flows
✅ Dynamic routing for countries and categories
✅ Pan-African dark theme with geometric patterns

## Data Model
All data is currently mocked in `data/predictions.ts` for demonstration purposes. Each prediction includes:
- Title, description, category
- Country/region tags
- Sentiment indicators (YES/NO probabilities)
- Liquidity metrics
- Resolution dates

## Environment Variables
Optional:
- `NEXT_PUBLIC_WALLETCONNECT_ID` - WalletConnect project ID (defaults to "demo" if not set)

## Backend Development Roadmap
The Technical Architecture Document contains complete specifications for building the production backend:

### Phase 1: Core Backend (Weeks 3-6)
- [ ] NestJS API scaffold with SIWE authentication
- [ ] User management and session handling
- [ ] Market CRUD APIs (migrate from mock data)
- [ ] Basic wallet deposit/withdrawal APIs

### Phase 2: Trading Engine (Weeks 7-10)
- [ ] Order matching engine with price-time priority
- [ ] Order book management (Redis)
- [ ] AMM integration for instant trades
- [ ] Real-time WebSocket events

### Phase 3: Smart Contracts (Weeks 11-14)
- [ ] MarketFactory, OutcomeAMM, CollateralVault contracts
- [ ] Testnet deployment and integration
- [ ] Security audit

### Phase 4: Oracle & Resolution (Weeks 15-17)
- [ ] Oracle service with Chainlink integration
- [ ] Dispute resolution system
- [ ] Settlement and claims processing

### Phase 5: Analytics & Admin (Weeks 18-20)
- [ ] Analytics data pipeline
- [ ] Admin dashboard
- [ ] Leaderboards and reporting

## Web3Auth-First Architecture
- **Primary Auth:** Web3Auth (email/social login + MPC wallet generation)
- **Secondary Auth:** SIWE for advanced users with existing wallets (Phase 2)
- **Non-Custodial Wallets:** MetaMask, Phantom, WalletConnect, Coinbase Wallet, Rainbow
- **Deposit Flow:** Users deposit USDC/ETH from their wallet → CollateralVault smart contract → Off-chain ledger for trading
- **Supported Chains:** Ethereum, Polygon, Arbitrum, BSC
- **Withdrawal Security:** EIP-712 signatures, velocity limits, multi-sig for large amounts, 24-hour time locks

## Documentation

### Backend Architecture Document (Primary)
- **File:** `docs/BACKEND_ARCHITECTURE_DOCUMENT.md`
- **Purpose:** Complete backend server implementation guide with Web3Auth-first architecture
- **Contents:**
  - Part I: Foundation (Executive Summary, Architecture Overview, Tech Stack, Phases)
  - Part II: Phase 1 - Core Backend (Auth, Markets, Wallet, Profile, Notifications, Admin)
  - Part III: Phase 2 - Trading Engine (Orders, Matching, Positions, WebSockets, Workers)
  - Part IV: Phase 3 - Oracle & On-Chain (Resolution, Smart Contracts, Analytics)
  - Part V: Infrastructure (Database Schemas, NFRs, DevOps, Acceptance Criteria)

### Technical Architecture Document (Frontend Reference)
- **File:** `docs/TECHNICAL_ARCHITECTURE_DOCUMENT.md`
  - Part I: Frontend Architecture (Implemented) - Sections 1-13
  - Part II: Backend Architecture (Legacy) - Sections 14-26
  - Section 21: Web3 Wallet Integration - CollateralVault, DepositRouter, deposit/withdrawal flows

## Notes
- This is a frontend showcase/demo application
- All trading functionality uses mock data
- Wallet connections work but don't execute real transactions
- Designed for investor previews and partnership demos
- Optimized for Replit's iframe preview environment
