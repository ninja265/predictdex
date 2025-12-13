"use client";

import { useSettlement, useAdminCrypto } from "@/lib/hooks/useAdmin";
import Link from "next/link";

export default function AdminDashboard() {
  const { stats: settlementStats, queue, isLoading: loadingSettlement } = useSettlement();
  const { depositStats, deposits, withdrawals, isLoading: loadingCrypto } = useAdminCrypto();

  const isLoading = loadingSettlement || loadingCrypto;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-semibold text-white">Admin Dashboard</h1>
        <p className="mt-1 text-mist">Overview of platform operations</p>
      </div>

      {isLoading ? (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="h-32 bg-white/5 rounded animate-pulse"></div>
          ))}
        </div>
      ) : (
        <>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            <StatCard
              label="Awaiting Resolution"
              value={settlementStats?.marketsAwaitingResolution || 0}
              link="/admin/settlement"
              highlight={true}
            />
            <StatCard
              label="Resolved Today"
              value={settlementStats?.marketsResolvedToday || 0}
            />
            <StatCard
              label="Resolved This Week"
              value={settlementStats?.marketsResolvedThisWeek || 0}
            />
            <StatCard
              label="Payouts Today"
              value={`$${(settlementStats?.totalPayoutsToday || 0).toLocaleString()}`}
            />
          </div>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            <StatCard
              label="Pending Deposits"
              value={depositStats?.pendingCount || 0}
              link="/admin/crypto"
              highlight={(depositStats?.pendingCount || 0) > 0}
            />
            <StatCard
              label="Pending Volume"
              value={`$${(depositStats?.pendingVolume || 0).toLocaleString()}`}
            />
            <StatCard
              label="Pending Withdrawals"
              value={withdrawals?.length ?? 0}
              link="/admin/crypto"
              highlight={(withdrawals?.length ?? 0) > 0}
            />
            <StatCard
              label="Credited Today"
              value={depositStats?.creditedToday || 0}
            />
          </div>

          {queue && queue.count > 0 && (
            <div className="border border-white/10 bg-charcoal/60 p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xs uppercase tracking-[0.4em] text-mist">Resolution Queue</h2>
                <Link
                  href="/admin/settlement"
                  className="text-xs uppercase tracking-widest text-gold hover:text-white"
                >
                  View All
                </Link>
              </div>
              <div className="space-y-3">
                {queue.markets.slice(0, 5).map((market) => (
                  <div
                    key={market.id}
                    className="flex items-center justify-between border border-white/10 bg-white/5 px-4 py-3"
                  >
                    <div>
                      <p className="text-sm text-white">{market.question.slice(0, 60)}...</p>
                      <p className="text-xs text-mist mt-1">
                        {market.category} | {market.positionCount ?? 0} positions | {market.symbol}{(market.totalStaked ?? 0).toLocaleString()} staked
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-yellow-400">
                        Closed {Math.round(market.closedForHours)}h ago
                      </p>
                      <Link
                        href={`/admin/settlement?id=${market.id}`}
                        className="text-xs text-gold hover:text-white mt-1 inline-block"
                      >
                        Resolve
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {(deposits?.length ?? 0) > 0 && (
            <div className="border border-white/10 bg-charcoal/60 p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xs uppercase tracking-[0.4em] text-mist">Pending Deposits</h2>
                <Link
                  href="/admin/crypto"
                  className="text-xs uppercase tracking-widest text-gold hover:text-white"
                >
                  View All
                </Link>
              </div>
              <div className="space-y-3">
                {deposits.slice(0, 5).map((deposit) => (
                  <div
                    key={deposit.id}
                    className="flex items-center justify-between border border-yellow-500/20 bg-yellow-900/10 px-4 py-3"
                  >
                    <div>
                      <p className="text-sm text-yellow-400">
                        {deposit.amount} {deposit.token}
                      </p>
                      <p className="text-xs text-mist mt-1">
                        {deposit.confirmations}/{deposit.requiredConfirmations} confirmations
                      </p>
                    </div>
                    <p className="text-xs text-mist">
                      {deposit.txHash.slice(0, 10)}...
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}

function StatCard({
  label,
  value,
  link,
  highlight,
}: {
  label: string;
  value: string | number;
  link?: string;
  highlight?: boolean;
}) {
  const content = (
    <div
      className={`border bg-white/5 px-4 py-4 ${
        highlight ? "border-gold/50" : "border-white/10"
      } ${link ? "hover:border-white/30 cursor-pointer transition-colors" : ""}`}
    >
      <p className="text-xs uppercase tracking-[0.4em] text-mist">{label}</p>
      <p className={`mt-2 text-2xl font-semibold ${highlight ? "text-gold" : "text-white"}`}>
        {value}
      </p>
    </div>
  );

  if (link) {
    return <Link href={link}>{content}</Link>;
  }

  return content;
}
