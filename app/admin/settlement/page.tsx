"use client";

import { useState } from "react";
import { useSettlement } from "@/lib/hooks/useAdmin";
import { toast } from "@/components/Toast";
import type { SettlementPreview } from "@/lib/api/types";

export default function AdminSettlementPage() {
  const { queue, stats, isLoading, error, refetch, getPreview, settleMarket, triggerCheck } = useSettlement();
  const [selectedMarket, setSelectedMarket] = useState<string | null>(null);
  const [preview, setPreview] = useState<SettlementPreview | null>(null);
  const [loadingPreview, setLoadingPreview] = useState(false);
  const [settling, setSettling] = useState(false);

  const handlePreview = async (marketId: string, outcome: "YES" | "NO") => {
    setLoadingPreview(true);
    const result = await getPreview(marketId, outcome);
    setPreview(result);
    setLoadingPreview(false);
  };

  const handleSettle = async () => {
    if (!preview) return;
    setSettling(true);
    const success = await settleMarket(preview.market.id, preview.proposedOutcome);
    if (success) {
      toast("Market settled successfully", "success");
      setPreview(null);
      setSelectedMarket(null);
    } else {
      toast("Failed to settle market", "error");
    }
    setSettling(false);
  };

  const handleTriggerCheck = async () => {
    const success = await triggerCheck();
    if (success) {
      toast("Settlement check triggered", "success");
    } else {
      toast("Failed to trigger check", "error");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-white">Settlement Management</h1>
          <p className="mt-1 text-mist">Resolve markets and process payouts</p>
        </div>
        <button
          onClick={handleTriggerCheck}
          className="border border-white/20 px-4 py-2 text-sm uppercase tracking-widest text-mist hover:text-white hover:border-white/40 transition-colors"
        >
          Trigger Check
        </button>
      </div>

      {stats && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
          <div className="border border-white/10 bg-white/5 px-4 py-3">
            <p className="text-xs uppercase tracking-widest text-mist">Awaiting Resolution</p>
            <p className="text-2xl font-semibold text-gold mt-1">{stats.marketsAwaitingResolution}</p>
          </div>
          <div className="border border-white/10 bg-white/5 px-4 py-3">
            <p className="text-xs uppercase tracking-widest text-mist">Resolved Today</p>
            <p className="text-2xl font-semibold text-white mt-1">{stats.marketsResolvedToday}</p>
          </div>
          <div className="border border-white/10 bg-white/5 px-4 py-3">
            <p className="text-xs uppercase tracking-widest text-mist">Resolved This Week</p>
            <p className="text-2xl font-semibold text-white mt-1">{stats.marketsResolvedThisWeek}</p>
          </div>
          <div className="border border-white/10 bg-white/5 px-4 py-3">
            <p className="text-xs uppercase tracking-widest text-mist">Payouts Today</p>
            <p className="text-2xl font-semibold text-white mt-1">${(stats.totalPayoutsToday ?? 0).toLocaleString()}</p>
          </div>
          <div className="border border-white/10 bg-white/5 px-4 py-3">
            <p className="text-xs uppercase tracking-widest text-mist">Payouts This Week</p>
            <p className="text-2xl font-semibold text-white mt-1">${(stats.totalPayoutsThisWeek ?? 0).toLocaleString()}</p>
          </div>
        </div>
      )}

      {error && (
        <div className="border border-red-500/30 bg-red-900/10 px-4 py-3 text-red-400 text-sm">
          {error}
        </div>
      )}

      <div className="border border-white/10 bg-charcoal/60 p-6">
        <h2 className="text-xs uppercase tracking-[0.4em] text-mist mb-4">Resolution Queue</h2>

        {isLoading ? (
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-24 bg-white/5 rounded animate-pulse"></div>
            ))}
          </div>
        ) : !queue || queue.count === 0 ? (
          <div className="text-center py-8 text-mist">
            No markets awaiting resolution
          </div>
        ) : (
          <div className="space-y-4">
            {queue.markets.map((market) => (
              <div
                key={market.id}
                className={`border bg-white/5 p-4 transition-colors ${
                  selectedMarket === market.id ? "border-gold" : "border-white/10"
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <span className="text-xs px-2 py-0.5 bg-orange-500/20 text-orange-400">
                        AWAITING RESOLUTION
                      </span>
                      <span className="text-xs text-mist">{market.category}</span>
                    </div>
                    <h3 className="text-white font-medium">{market.question}</h3>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-3 text-xs text-mist">
                      <div>
                        <span className="text-mist">Positions:</span>{" "}
                        <span className="text-white">{market.positionCount}</span>
                      </div>
                      <div>
                        <span className="text-mist">Total Staked:</span>{" "}
                        <span className="text-white">{market.symbol}{(market.totalStaked ?? 0).toLocaleString()}</span>
                      </div>
                      <div>
                        <span className="text-mist">YES Staked:</span>{" "}
                        <span className="text-green-400">{market.symbol}{(market.yesStaked ?? 0).toLocaleString()}</span>
                      </div>
                      <div>
                        <span className="text-mist">NO Staked:</span>{" "}
                        <span className="text-red-400">{market.symbol}{(market.noStaked ?? 0).toLocaleString()}</span>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-yellow-400">
                      Closed {Math.round(market.closedForHours)}h ago
                    </p>
                  </div>
                </div>

                <div className="mt-4 pt-4 border-t border-white/10">
                  <p className="text-sm text-mist mb-3">Preview settlement outcome:</p>
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => {
                        setSelectedMarket(market.id);
                        handlePreview(market.id, "YES");
                      }}
                      disabled={loadingPreview}
                      className="px-4 py-2 border border-green-500/50 text-green-400 hover:bg-green-500/10 text-sm uppercase tracking-widest disabled:opacity-50"
                    >
                      Preview YES
                    </button>
                    <button
                      onClick={() => {
                        setSelectedMarket(market.id);
                        handlePreview(market.id, "NO");
                      }}
                      disabled={loadingPreview}
                      className="px-4 py-2 border border-red-500/50 text-red-400 hover:bg-red-500/10 text-sm uppercase tracking-widest disabled:opacity-50"
                    >
                      Preview NO
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {preview && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
          <div className="bg-charcoal border border-white/10 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-white/10">
              <h2 className="text-lg font-semibold text-white">Settlement Preview</h2>
              <p className="text-sm text-mist mt-1">{preview.market.question}</p>
            </div>
            <div className="p-6 space-y-6">
              <div className={`text-center py-4 ${
                preview.proposedOutcome === "YES" ? "bg-green-500/10 border border-green-500/30" : "bg-red-500/10 border border-red-500/30"
              }`}>
                <p className="text-sm text-mist">Proposed Outcome</p>
                <p className={`text-3xl font-bold mt-1 ${
                  preview.proposedOutcome === "YES" ? "text-green-400" : "text-red-400"
                }`}>
                  {preview.proposedOutcome}
                </p>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="border border-white/10 bg-white/5 px-4 py-3 text-center">
                  <p className="text-xs text-mist">Total Positions</p>
                  <p className="text-xl font-semibold text-white">{preview.summary.totalPositions}</p>
                </div>
                <div className="border border-white/10 bg-white/5 px-4 py-3 text-center">
                  <p className="text-xs text-mist">Winners</p>
                  <p className="text-xl font-semibold text-green-400">{preview.summary.winnersCount}</p>
                </div>
                <div className="border border-white/10 bg-white/5 px-4 py-3 text-center">
                  <p className="text-xs text-mist">Losers</p>
                  <p className="text-xl font-semibold text-red-400">{preview.summary.losersCount}</p>
                </div>
                <div className="border border-white/10 bg-white/5 px-4 py-3 text-center">
                  <p className="text-xs text-mist">Total Payout</p>
                  <p className="text-xl font-semibold text-gold">{preview.market.symbol}{(preview.summary.totalPayout ?? 0).toLocaleString()}</p>
                </div>
              </div>

              {(preview.winners?.length ?? 0) > 0 && (
                <div>
                  <h3 className="text-xs uppercase tracking-widest text-mist mb-3">Winners ({preview.winners?.length ?? 0})</h3>
                  <div className="max-h-40 overflow-y-auto space-y-2">
                    {(preview.winners ?? []).slice(0, 10).map((user) => (
                      <div key={user.positionId} className="flex items-center justify-between border border-green-500/20 bg-green-900/10 px-3 py-2 text-sm">
                        <span className="text-mist">{user.userEmail}</span>
                        <span className="text-green-400">+{preview.market.symbol}{(user.payout ?? 0).toLocaleString()}</span>
                      </div>
                    ))}
                    {(preview.winners?.length ?? 0) > 10 && (
                      <p className="text-xs text-mist text-center">...and {(preview.winners?.length ?? 0) - 10} more</p>
                    )}
                  </div>
                </div>
              )}

              <div className="flex items-center gap-3 pt-4 border-t border-white/10">
                <button
                  onClick={handleSettle}
                  disabled={settling}
                  className={`flex-1 py-3 text-sm uppercase tracking-widest disabled:opacity-50 ${
                    preview.proposedOutcome === "YES"
                      ? "bg-green-600 hover:bg-green-700 text-white"
                      : "bg-red-600 hover:bg-red-700 text-white"
                  }`}
                >
                  {settling ? "Settling..." : `Confirm ${preview.proposedOutcome} & Settle`}
                </button>
                <button
                  onClick={() => {
                    setPreview(null);
                    setSelectedMarket(null);
                  }}
                  className="px-4 py-3 border border-white/20 text-mist hover:text-white text-sm uppercase tracking-widest"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
