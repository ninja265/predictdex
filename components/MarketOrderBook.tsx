"use client";

import { useState } from "react";
import { useOrderBook } from "@/lib/hooks/useMarkets";

type Props = {
  slug: string;
};

type OutcomeSide = "yes" | "no";

export default function MarketOrderBook({ slug }: Props) {
  const { orderbook, isLoading, error } = useOrderBook(slug);
  const [activeSide, setActiveSide] = useState<OutcomeSide>("yes");

  if (isLoading) {
    return (
      <div className="border border-white/10 bg-charcoal/60 p-6">
        <p className="text-xs uppercase tracking-[0.35em] text-mist">Order Book</p>
        <div className="mt-4 animate-pulse">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="h-6 bg-white/5 rounded"></div>
              ))}
            </div>
            <div className="space-y-2">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="h-6 bg-white/5 rounded"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !orderbook) {
    return (
      <div className="border border-white/10 bg-charcoal/60 p-6">
        <p className="text-xs uppercase tracking-[0.35em] text-mist">Order Book</p>
        <p className="mt-4 text-sm text-mist">Unable to load order book</p>
      </div>
    );
  }

  const currentBook = activeSide === "yes" ? orderbook.orderbook.yes : orderbook.orderbook.no;
  const bids = currentBook.bids.slice(0, 5);
  const asks = currentBook.asks.slice(0, 5);
  const spread = asks.length > 0 && bids.length > 0 
    ? ((asks[0].price - bids[0].price) * 100).toFixed(2)
    : null;

  return (
    <div className="border border-white/10 bg-charcoal/60 p-6">
      <div className="flex items-center justify-between mb-4">
        <p className="text-xs uppercase tracking-[0.35em] text-mist">Order Book</p>
        <div className="flex gap-2">
          <button
            onClick={() => setActiveSide("yes")}
            className={`px-3 py-1 text-xs uppercase tracking-widest border ${
              activeSide === "yes"
                ? "border-gold bg-gold/10 text-gold"
                : "border-white/10 text-mist hover:text-white"
            }`}
          >
            YES
          </button>
          <button
            onClick={() => setActiveSide("no")}
            className={`px-3 py-1 text-xs uppercase tracking-widest border ${
              activeSide === "no"
                ? "border-electric bg-electric/10 text-electric"
                : "border-white/10 text-mist hover:text-white"
            }`}
          >
            NO
          </button>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-6 text-sm">
        <div>
          <p className="text-xs uppercase tracking-[0.35em] text-green-400 mb-3">Bids (Buy)</p>
          <div className="space-y-2">
            {bids.length > 0 ? (
              bids.map((order, i) => (
                <div key={`bid-${i}`} className="flex items-center justify-between">
                  <span className="text-green-400">{(order.price * 100).toFixed(0)}%</span>
                  <span className="text-mist">{order.shares.toLocaleString()}</span>
                </div>
              ))
            ) : (
              <p className="text-mist text-xs">No bids</p>
            )}
          </div>
        </div>
        <div>
          <p className="text-xs uppercase tracking-[0.35em] text-red-400 mb-3">Asks (Sell)</p>
          <div className="space-y-2">
            {asks.length > 0 ? (
              asks.map((order, i) => (
                <div key={`ask-${i}`} className="flex items-center justify-between">
                  <span className="text-red-400">{(order.price * 100).toFixed(0)}%</span>
                  <span className="text-mist">{order.shares.toLocaleString()}</span>
                </div>
              ))
            ) : (
              <p className="text-mist text-xs">No asks</p>
            )}
          </div>
        </div>
      </div>
      {spread && (
        <div className="mt-4 pt-4 border-t border-white/10">
          <div className="flex items-center justify-between text-xs text-mist">
            <span>Spread</span>
            <span className="text-white">{spread}%</span>
          </div>
        </div>
      )}
    </div>
  );
}
