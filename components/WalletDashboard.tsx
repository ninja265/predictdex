"use client";

import { FormEvent, useState } from "react";
import WalletWidget from "./WalletWidget";
import { useWalletStore, type Chain } from "@/lib/stores/useWalletStore";

export default function WalletDashboard() {
  const { deposit, withdraw, setChain, selectedChain, transactions } = useWalletStore();
  const [depositAmount, setDepositAmount] = useState(250);
  const [withdrawAmount, setWithdrawAmount] = useState(120);
  const [withdrawAddress, setWithdrawAddress] = useState("0x0000...africa");
  const [asset, setAsset] = useState<"USDT" | "USDC">("USDT");

  const handleDeposit = (event: FormEvent) => {
    event.preventDefault();
    deposit(depositAmount, asset);
  };

  const handleWithdraw = (event: FormEvent) => {
    event.preventDefault();
    withdraw(withdrawAmount, asset);
  };

  const networks: Chain[] = ["BNB", "Polygon", "Arbitrum"];

  return (
    <div className="grid gap-8 lg:grid-cols-3">
      <div className="space-y-8 lg:col-span-1">
        <WalletWidget />
        <div className="border border-white/10 bg-slate/40 p-6">
          <p className="text-xs uppercase tracking-[0.4em] text-mist">Chain</p>
          <div className="mt-4 flex flex-wrap gap-3 text-xs uppercase tracking-[0.35em]">
            {networks.map((chain) => (
              <button
                key={chain}
                onClick={() => setChain(chain as any)}
                className={`border px-4 py-2 ${
                  selectedChain === chain
                    ? "border-gold bg-gold/10 text-gold"
                    : "border-white/10 text-mist hover:text-white"
                }`}
              >
                {chain}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="space-y-8 lg:col-span-2">
        <form onSubmit={handleDeposit} className="border border-white/10 bg-charcoal/60 p-6">
          <p className="text-xs uppercase tracking-[0.4em] text-mist">Deposit</p>
          <div className="mt-4 grid gap-4 md:grid-cols-2">
            <label className="text-xs uppercase tracking-[0.35em] text-mist">
              Amount
              <input
                type="number"
                min={50}
                className="mt-2 w-full border border-white/10 bg-transparent px-4 py-3 text-white focus:border-royal focus:outline-none"
                value={depositAmount}
                onChange={(event) => setDepositAmount(Number(event.target.value))}
              />
            </label>
            <label className="text-xs uppercase tracking-[0.35em] text-mist">
              Asset
              <select
                className="mt-2 w-full border border-white/10 bg-transparent px-4 py-3 text-white focus:border-royal focus:outline-none"
                value={asset}
                onChange={(event) => setAsset(event.target.value as "USDT" | "USDC")}
              >
                <option value="USDT">USDT</option>
                <option value="USDC">USDC</option>
              </select>
            </label>
          </div>
          <button
            type="submit"
            className="mt-6 border border-royal bg-royal px-6 py-3 text-xs uppercase tracking-[0.35em] text-white"
          >
            Initiate Deposit
          </button>
        </form>

        <form onSubmit={handleWithdraw} className="border border-white/10 bg-charcoal/60 p-6">
          <p className="text-xs uppercase tracking-[0.4em] text-mist">Withdraw</p>
          <div className="mt-4 grid gap-4 md:grid-cols-2">
            <label className="text-xs uppercase tracking-[0.35em] text-mist">
              Amount
              <input
                type="number"
                min={50}
                className="mt-2 w-full border border-white/10 bg-transparent px-4 py-3 text-white focus:border-electric focus:outline-none"
                value={withdrawAmount}
                onChange={(event) => setWithdrawAmount(Number(event.target.value))}
              />
            </label>
            <label className="text-xs uppercase tracking-[0.35em] text-mist">
              Wallet Address
              <input
                type="text"
                className="mt-2 w-full border border-white/10 bg-transparent px-4 py-3 text-white focus:border-electric focus:outline-none"
                value={withdrawAddress}
                onChange={(event) => setWithdrawAddress(event.target.value)}
              />
            </label>
          </div>
          <button
            type="submit"
            className="mt-6 border border-electric bg-electric/20 px-6 py-3 text-xs uppercase tracking-[0.35em] text-white"
          >
            Request Withdrawal
          </button>
        </form>

        <div className="border border-white/10 bg-charcoal/60 p-6">
          <p className="text-xs uppercase tracking-[0.35em] text-mist">Transaction history</p>
          <div className="mt-4 overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="text-xs uppercase tracking-[0.35em] text-mist">
                <tr className="text-left">
                  <th className="border-b border-white/10 py-3">Type</th>
                  <th className="border-b border-white/10 py-3">Amount</th>
                  <th className="border-b border-white/10 py-3">Chain</th>
                  <th className="border-b border-white/10 py-3">Status</th>
                  <th className="border-b border-white/10 py-3">Time</th>
                </tr>
              </thead>
              <tbody>
                {transactions.map((tx) => (
                  <tr key={tx.id} className="text-mist">
                    <td className="border-b border-white/5 py-3">{tx.type}</td>
                    <td className="border-b border-white/5 py-3">
                      ${tx.amount.toLocaleString()} {tx.asset}
                    </td>
                    <td className="border-b border-white/5 py-3">{tx.chain}</td>
                    <td className="border-b border-white/5 py-3">{tx.status}</td>
                    <td className="border-b border-white/5 py-3">
                      {new Date(tx.timestamp).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
