"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import type { Market } from "@/lib/api/types";
import ChartBox from "./ChartBox";
import MarketOrderBook from "./MarketOrderBook";
import { useTrading } from "@/lib/hooks/useTrading";
import { useAuthStore } from "@/lib/stores/useAuthStore";
import { toast } from "./Toast";

type Props = {
  market: Market;
};

export default function MarketDetail({ market }: Props) {
  const router = useRouter();
  const { isAuthenticated } = useAuthStore();
  const { preview, isLoadingPreview, isExecuting, fetchPreview, executeBuy, clearPreview } = useTrading();
  
  const [amount, setAmount] = useState(100);
  const [direction, setDirection] = useState<"YES" | "NO">("YES");

  const selectedPrice = direction === "YES" ? market.yesPrice : market.noPrice;

  useEffect(() => {
    if (isAuthenticated && amount > 0) {
      const timer = setTimeout(() => {
        fetchPreview(market.id, direction, amount);
      }, 300);
      return () => clearTimeout(timer);
    } else {
      clearPreview();
    }
  }, [market.id, direction, amount, isAuthenticated, fetchPreview, clearPreview]);

  const handleTrade = async () => {
    if (!isAuthenticated) {
      toast("Please sign in to trade", "error");
      router.push("/login");
      return;
    }

    const result = await executeBuy(market.id, direction, amount);
    if (result) {
      router.push("/wallet");
    }
  };

  const formatVolume = (volume: number): string => {
    if (volume >= 1000000) {
      return `${market.symbol}${(volume / 1000000).toFixed(1)}M`;
    }
    if (volume >= 1000) {
      return `${market.symbol}${(volume / 1000).toFixed(1)}K`;
    }
    return `${market.symbol}${volume.toFixed(0)}`;
  };

  return (
    <div className="grid gap-6 lg:grid-cols-3">
      <div className="space-y-6 lg:col-span-2">
        <div className="border border-white/10 bg-charcoal/70 p-6">
          <div className="flex flex-wrap items-center gap-4 text-xs uppercase tracking-[0.3em] text-mist">
            <span className={`border px-3 py-1 ${
              market.status === "open" 
                ? "border-green-500/40 text-green-400" 
                : "border-yellow-500/40 text-yellow-400"
            }`}>
              {market.status}
            </span>
            <span className="border border-electric/40 px-3 py-1 text-electric">
              {market.category}
            </span>
            <span className="text-gold">{market.currency}</span>
          </div>
          <h1 className="mt-6 text-3xl font-semibold text-white">{market.question}</h1>
          {market.description && (
            <p className="mt-4 text-sm text-mist">{market.description}</p>
          )}
          <div className="mt-6 grid gap-4 sm:grid-cols-3">
            <div className="border border-white/10 bg-white/5 px-4 py-3">
              <p className="text-xs uppercase tracking-[0.4em] text-mist">YES PRICE</p>
              <p className="text-3xl font-semibold text-gold">
                {(market.yesPrice * 100).toFixed(0)}%
              </p>
            </div>
            <div className="border border-white/10 bg-white/5 px-4 py-3">
              <p className="text-xs uppercase tracking-[0.4em] text-mist">NO PRICE</p>
              <p className="text-3xl font-semibold text-electric">
                {(market.noPrice * 100).toFixed(0)}%
              </p>
            </div>
            <div className="border border-white/10 bg-white/5 px-4 py-3">
              <p className="text-xs uppercase tracking-[0.4em] text-mist">VOLUME</p>
              <p className="text-3xl font-semibold text-white">
                {formatVolume(market.volume)}
              </p>
            </div>
          </div>
        </div>

        <ChartBox />
        <MarketOrderBook slug={market.slug} />

        <div className="border border-white/10 bg-charcoal/70 p-6">
          <p className="text-xs uppercase tracking-[0.4em] text-mist">Market Info</p>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <div>
              <p className="text-xs uppercase tracking-[0.4em] text-mist">Closes</p>
              <p className="mt-1 text-white">
                {new Date(market.closesAt).toLocaleDateString("en-US", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-[0.4em] text-mist">Created</p>
              <p className="mt-1 text-white">
                {market.createdAt
                  ? new Date(market.createdAt).toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })
                  : "N/A"}
              </p>
            </div>
          </div>
          {market.resolvedAt && market.winningOutcome && (
            <div className="mt-6 border-t border-white/10 pt-4">
              <p className="text-xs uppercase tracking-[0.4em] text-mist">Resolution</p>
              <p className={`mt-2 text-2xl font-bold ${
                market.winningOutcome === "YES" ? "text-gold" : "text-electric"
              }`}>
                {market.winningOutcome}
              </p>
            </div>
          )}
        </div>
      </div>

      <div className="space-y-6">
        <div className="border border-white/10 bg-slate/60 p-6">
          <p className="text-xs uppercase tracking-[0.4em] text-mist">Trade</p>
          
          {market.status !== "open" ? (
            <div className="mt-4 text-center py-6">
              <p className="text-mist">This market is {market.status}</p>
              <p className="mt-2 text-xs text-mist">Trading is no longer available</p>
            </div>
          ) : (
            <>
              <div className="mt-4 flex gap-3 text-sm uppercase tracking-[0.3em]">
                <button
                  onClick={() => setDirection("YES")}
                  className={`flex-1 border px-3 py-2 ${
                    direction === "YES"
                      ? "border-gold bg-gold/10 text-gold"
                      : "border-white/10 text-mist hover:text-white"
                  }`}
                >
                  Buy YES
                </button>
                <button
                  onClick={() => setDirection("NO")}
                  className={`flex-1 border px-3 py-2 ${
                    direction === "NO"
                      ? "border-electric bg-electric/10 text-electric"
                      : "border-white/10 text-mist hover:text-white"
                  }`}
                >
                  Buy NO
                </button>
              </div>

              <label className="mt-6 block text-xs uppercase tracking-[0.4em] text-mist">
                Stake ({market.currency})
                <input
                  type="number"
                  min={1}
                  value={amount}
                  onChange={(event) => setAmount(Number(event.target.value))}
                  className="mt-2 w-full border border-white/10 bg-transparent px-4 py-3 text-white focus:border-royal focus:outline-none"
                />
              </label>

              <div className="mt-4 space-y-3 text-sm text-mist">
                {isLoadingPreview ? (
                  <div className="animate-pulse space-y-2">
                    <div className="h-4 bg-white/5 rounded"></div>
                    <div className="h-4 bg-white/5 rounded"></div>
                  </div>
                ) : preview ? (
                  <>
                    <div className="flex items-center justify-between">
                      <span>You receive</span>
                      <span className="text-white">{(preview.shares ?? 0).toFixed(2)} shares</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Fee</span>
                      <span className="text-white">{market.symbol}{(preview.fee ?? 0).toFixed(2)}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Total cost</span>
                      <span className="text-white">{market.symbol}{(preview.totalCost ?? 0).toFixed(2)}</span>
                    </div>
                    <div className="flex items-center justify-between border-t border-white/10 pt-3">
                      <span>Est. payout if {direction}</span>
                      <span className="text-gold font-semibold">
                        {market.symbol}{(preview.estimatedPayout ?? 0).toFixed(2)}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Est. profit</span>
                      <span className={`font-semibold ${(preview.estimatedProfit ?? 0) >= 0 ? "text-green-400" : "text-red-400"}`}>
                        {(preview.estimatedProfit ?? 0) >= 0 ? "+" : ""}{market.symbol}{(preview.estimatedProfit ?? 0).toFixed(2)}
                      </span>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="flex items-center justify-between">
                      <span>Price</span>
                      <span className="text-white">{(selectedPrice * 100).toFixed(1)}%</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Est. shares</span>
                      <span className="text-white">~{(amount / selectedPrice).toFixed(2)}</span>
                    </div>
                  </>
                )}
              </div>

              <button
                onClick={handleTrade}
                disabled={isExecuting || amount <= 0}
                className="mt-6 w-full border border-white/10 bg-royal/70 px-4 py-3 text-sm uppercase tracking-[0.35em] text-white hover:bg-royal disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {isExecuting ? "Processing..." : isAuthenticated ? "Confirm Trade" : "Sign In to Trade"}
              </button>
            </>
          )}
        </div>

        <div className="border border-white/10 bg-slate/60 p-6">
          <p className="text-xs uppercase tracking-[0.4em] text-mist">Fee Schedule</p>
          <ul className="mt-4 space-y-2 text-sm text-mist">
            <li>Trading fee: 2.0%</li>
            <li>Settlement fee: 1.0%</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
