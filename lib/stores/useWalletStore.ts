import { create } from "zustand";

export type Chain = "BNB" | "Polygon" | "Arbitrum";

export type Transaction = {
  id: string;
  type: "Deposit" | "Withdraw" | "Trade";
  amount: number;
  asset: "USDT" | "USDC";
  chain: Chain;
  timestamp: string;
  status: "Completed" | "Pending";
};

type WalletState = {
  stableBalances: Record<"USDT" | "USDC", number>;
  selectedChain: Chain;
  transactions: Transaction[];
  setChain: (chain: Chain) => void;
  deposit: (amount: number, asset: "USDT" | "USDC") => void;
  withdraw: (amount: number, asset: "USDT" | "USDC") => void;
  recordTransaction: (tx: Transaction) => void;
};

export const useWalletStore = create<WalletState>((set, get) => ({
  stableBalances: {
    USDT: 2500,
    USDC: 1100,
  },
  selectedChain: "Polygon",
  transactions: [
    {
      id: "tx-1",
      type: "Trade",
      amount: 230,
      asset: "USDT",
      chain: "Polygon",
      timestamp: "2024-12-01T08:12:00Z",
      status: "Completed",
    },
    {
      id: "tx-2",
      type: "Deposit",
      amount: 500,
      asset: "USDC",
      chain: "Arbitrum",
      timestamp: "2024-11-28T13:44:00Z",
      status: "Completed",
    },
  ],
  setChain: (chain) => set({ selectedChain: chain }),
  deposit: (amount, asset) => {
    set((state) => ({
      stableBalances: {
        ...state.stableBalances,
        [asset]: state.stableBalances[asset] + amount,
      },
    }));
    get().recordTransaction({
      id: `tx-${Date.now()}`,
      type: "Deposit",
      amount,
      asset,
      chain: get().selectedChain,
      timestamp: new Date().toISOString(),
      status: "Completed",
    });
  },
  withdraw: (amount, asset) => {
    set((state) => ({
      stableBalances: {
        ...state.stableBalances,
        [asset]: Math.max(state.stableBalances[asset] - amount, 0),
      },
    }));
    get().recordTransaction({
      id: `tx-${Date.now()}`,
      type: "Withdraw",
      amount,
      asset,
      chain: get().selectedChain,
      timestamp: new Date().toISOString(),
      status: "Pending",
    });
  },
  recordTransaction: (tx) =>
    set((state) => ({
      transactions: [tx, ...state.transactions].slice(0, 6),
    })),
}));
