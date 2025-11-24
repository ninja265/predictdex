"use client";

import { useState } from "react";
import type { Prediction } from "@/data/predictions";
import ChartBox from "./ChartBox";
import OrderBookPanel from "./OrderBookPanel";

const currencyFormatter = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  minimumFractionDigits: 2,
});

type Props = {
  prediction: Prediction;
};

export default function PredictionDetail({ prediction }: Props) {
  const [amount, setAmount] = useState(250);
  const [direction, setDirection] = useState<"yes" | "no">("yes");

  const selectedPrice = direction === "yes" ? prediction.yesPrice : prediction.noPrice;
  const estimatedPayout = amount * (1 / selectedPrice);
  const fee = amount * 0.02;

  return (
    <div className="grid gap-6 lg:grid-cols-3">
      <div className="space-y-6 lg:col-span-2">
        <div className="border border-white/10 bg-charcoal/70 p-6">
          <div className="flex flex-wrap items-center gap-4 text-xs uppercase tracking-[0.3em] text-mist">
            <span className="border border-royal/40 px-3 py-1 text-royal">{prediction.country}</span>
            <span className="border border-electric/40 px-3 py-1 text-electric">
              {prediction.category}
            </span>
            <span>Liquidity {prediction.liquidity}</span>
          </div>
          <h1 className="mt-6 text-3xl font-semibold text-white">{prediction.title}</h1>
          <p className="mt-4 text-sm text-mist">{prediction.marketDescription}</p>
          <div className="mt-6 grid gap-4 sm:grid-cols-3">
            <div className="border border-white/10 bg-white/5 px-4 py-3">
              <p className="text-xs uppercase tracking-[0.4em] text-mist">YES PRICE</p>
              <p className="text-3xl font-semibold text-gold">
                {(prediction.yesPrice * 100).toFixed(0)}%
              </p>
            </div>
            <div className="border border-white/10 bg-white/5 px-4 py-3">
              <p className="text-xs uppercase tracking-[0.4em] text-mist">NO PRICE</p>
              <p className="text-3xl font-semibold text-electric">
                {(prediction.noPrice * 100).toFixed(0)}%
              </p>
            </div>
            <div className="border border-white/10 bg-white/5 px-4 py-3">
              <p className="text-xs uppercase tracking-[0.4em] text-mist">VOLUME</p>
              <p className="text-3xl font-semibold text-white">
                ${prediction.volume.toLocaleString()}
              </p>
            </div>
          </div>
        </div>

        <ChartBox />
        <OrderBookPanel />

        <div className="border border-white/10 bg-charcoal/70 p-6">
          <p className="text-xs uppercase tracking-[0.4em] text-mist">Timeline</p>
          <p className="mt-2 text-white">{prediction.timeline}</p>
          <p className="mt-6 text-xs uppercase tracking-[0.4em] text-mist">Source</p>
          {prediction.source ? (
            <a href={prediction.source} target="_blank" rel="noreferrer" className="mt-2 block text-gold">
              {prediction.source}
            </a>
          ) : (
            <p className="mt-2 text-mist">Source coming soon.</p>
          )}
          <div className="mt-6">
            <p className="text-xs uppercase tracking-[0.4em] text-mist">Community sentiment</p>
            <div className="mt-3 h-3 w-full border border-white/10 bg-white/5">
              <div
                className="h-full bg-gradient-to-r from-royal to-electric"
                style={{ width: `${prediction.sentiment}%` }}
              />
            </div>
            <p className="mt-2 text-sm text-mist">{prediction.sentiment}% bullish</p>
          </div>
        </div>
      </div>

      <div className="space-y-6">
        <div className="border border-white/10 bg-slate/60 p-6">
          <p className="text-xs uppercase tracking-[0.4em] text-mist">Trade</p>
          <div className="mt-4 flex gap-3 text-sm uppercase tracking-[0.3em]">
            <button
              onClick={() => setDirection("yes")}
              className={`flex-1 border px-3 py-2 ${
                direction === "yes"
                  ? "border-gold bg-gold/10 text-gold"
                  : "border-white/10 text-mist hover:text-white"
              }`}
            >
              Buy YES
            </button>
            <button
              onClick={() => setDirection("no")}
              className={`flex-1 border px-3 py-2 ${
                direction === "no"
                  ? "border-electric bg-electric/10 text-electric"
                  : "border-white/10 text-mist hover:text-white"
              }`}
            >
              Buy NO
            </button>
          </div>

          <label className="mt-6 block text-xs uppercase tracking-[0.4em] text-mist">
            Stake (USDC)
            <input
              type="number"
              min={10}
              value={amount}
              onChange={(event) => setAmount(Number(event.target.value))}
              className="mt-2 w-full border border-white/10 bg-transparent px-4 py-3 text-white focus:border-royal focus:outline-none"
            />
          </label>

          <div className="mt-4 space-y-3 text-sm text-mist">
            <div className="flex items-center justify-between">
              <span>Estimated payout</span>
              <span className="text-white">{currencyFormatter.format(estimatedPayout)}</span>
            </div>
            <div className="flex items-center justify-between">
              <span>Oracle fee</span>
              <span className="text-white">{currencyFormatter.format(fee)}</span>
            </div>
            <div className="flex items-center justify-between">
              <span>Price</span>
              <span className="text-white">{(selectedPrice * 100).toFixed(1)}%</span>
            </div>
          </div>

          <button className="mt-6 w-full border border-white/10 bg-royal/70 px-4 py-3 text-sm uppercase tracking-[0.35em] text-white hover:bg-royal">
            Confirm Trade
          </button>
        </div>

        <div className="border border-white/10 bg-slate/60 p-6">
          <p className="text-xs uppercase tracking-[0.4em] text-mist">Fee Schedule</p>
          <ul className="mt-4 space-y-2 text-sm text-mist">
            <li>Maker rebate: 0.05%</li>
            <li>Taker fee: 0.30%</li>
            <li>Settlement fee: 1.0%</li>
          </ul>
        </div>
      </div>
    </div>
  );
}

