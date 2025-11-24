# AfricaPredicts — Pan-African Prediction Exchange

AfricaPredicts is a concept Web3 prediction market for African narratives. It is built on **Next.js 13 (App Router)** with **React**, **Tailwind CSS**, **Zustand**, and **RainbowKit/Wagmi** for wallet connectivity. All data is mocked so the interface can be showcased to partners and investors without backend dependencies.

## ✨ Features
- Immersive landing page highlighting the top 10 predictions across politics, entertainment, sports, and crypto.
- Markets directory with instant client-side filtering by country or category.
- Dedicated market detail page showcasing order book, chart placeholder, trade form, and sentiment indicators.
- Wallet center with RainbowKit (MetaMask / WalletConnect), deposit & withdrawal mock flows, and transaction history.
- Country and category-specific pages wired via dynamic routes (`/country/[country]`, `/category/[category]`).
- Pan-African dark theme with hard edges, Inter & DM Sans typography, and subtle pattern overlays.

## 🧱 Tech Stack
- **Framework:** Next.js 13 (App Router) + React 18
- **Styling:** Tailwind CSS with custom theme tokens
- **State:** Zustand for predictions + wallet UI state
- **Wallets:** Wagmi + RainbowKit (WalletConnect v2)

## 🚀 Getting Started
```bash
npm install
npm run dev
```
Then open [http://localhost:3000](http://localhost:3000) to view AfricaPredicts.

## 📁 Key Paths
- `app/page.tsx` – Landing experience with hero + top markets
- `app/markets` – All markets grid using shared `PredictionsBoard`
- `app/markets/[slug]` – Market detail view with trade module
- `app/wallet` – Wallet dashboard with deposit/withdraw mocks
- `data/predictions.ts` – Mock market data powering the UI
- `components/*` – Navbar, filters, cards, wallet widget, detail modules, etc.

## ✅ Next Steps
- Connect on-chain data feeds for prices and liquidity.
- Wire prediction resolution oracle + contract interactions.
- Add analytics dashboards per country/category.

AfricaPredicts is designed to feel premium, futuristic, and distinctly pan-African—ideal for storytelling demos and investor previews.
