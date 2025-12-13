"use client";

import { useOrderBook } from "@/lib/hooks/useMarkets";

type Props = {
  slug: string;
};

export default function MarketOrderBook({ slug }: Props) {
  const { orderbook, isLoading, error } = useOrderBook(slug);

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

  const yesBids = orderbook.yesBids?.slice(0, 5) || [];
  const noAsks = orderbook.noAsks?.slice(0, 5) || [];
  const spread = noAsks.length > 0 && yesBids.length > 0 
    ? ((noAsks[0].price - (1 - yesBids[0].price)) * 100).toFixed(2)
    : null;

  return (
    <div className="border border-white/10 bg-charcoal/60 p-6">
      <div className="flex items-center justify-between mb-4">
        <p className="text-xs uppercase tracking-[0.35em] text-mist">Order Book</p>
        <p className="text-xs text-mist">{orderbook.symbol} Market</p>
      </div>
      <div className="grid grid-cols-2 gap-6 text-sm">
        <div>
          <p className="text-xs uppercase tracking-[0.35em] text-green-400 mb-3">YES Bids</p>
          <div className="space-y-2">
            {yesBids.length > 0 ? (
              yesBids.map((order, i) => (
                <div key={`bid-${i}`} className="flex items-center justify-between">
                  <span className="text-green-400">{(order.price * 100).toFixed(0)}%</span>
                  <span className="text-mist">{order.size.toLocaleString()}</span>
                </div>
              ))
            ) : (
              <p className="text-mist text-xs">No bids</p>
            )}
          </div>
        </div>
        <div>
          <p className="text-xs uppercase tracking-[0.35em] text-red-400 mb-3">NO Asks</p>
          <div className="space-y-2">
            {noAsks.length > 0 ? (
              noAsks.map((order, i) => (
                <div key={`ask-${i}`} className="flex items-center justify-between">
                  <span className="text-red-400">{(order.price * 100).toFixed(0)}%</span>
                  <span className="text-mist">{order.size.toLocaleString()}</span>
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
