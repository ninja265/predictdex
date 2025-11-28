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

## Next Steps / Future Enhancements
- [ ] Connect on-chain data feeds for real-time prices and liquidity
- [ ] Implement prediction resolution oracle
- [ ] Add smart contract interactions for actual trading
- [ ] Build analytics dashboards per country/category
- [ ] Integrate real market maker and liquidity pools
- [ ] Add user authentication and portfolio tracking

## Documentation
- **Technical Architecture Document:** `docs/TECHNICAL_ARCHITECTURE_DOCUMENT.md` - Comprehensive technical reference covering system architecture, component specifications, state management, Web3 integration, and future roadmap.

## Notes
- This is a frontend showcase/demo application
- All trading functionality uses mock data
- Wallet connections work but don't execute real transactions
- Designed for investor previews and partnership demos
- Optimized for Replit's iframe preview environment
