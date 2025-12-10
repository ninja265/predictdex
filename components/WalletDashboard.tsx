"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/lib/stores/useAuthStore";
import { useBalances, usePortfolio, useTransactions, useCryptoDeposits } from "@/lib/hooks/useWallet";
import { useCryptoPrices } from "@/lib/hooks/useCryptoPrices";
import { formatCurrency, formatCryptoAmount, formatDateTime, truncateAddress, getExplorerTxUrl } from "@/lib/utils";
import { toast } from "./Toast";
import Link from "next/link";
import { QRCodeSVG } from "qrcode.react";

const MINIMUM_DEPOSITS: Record<string, { amount: number; usdEquivalent: string }> = {
  ETH: { amount: 0.001, usdEquivalent: "~$3.50" },
  USDC: { amount: 5, usdEquivalent: "$5.00" },
  USDT: { amount: 5, usdEquivalent: "$5.00" },
};

type Tab = "balances" | "portfolio" | "deposit" | "history";

export default function WalletDashboard() {
  const router = useRouter();
  const { isAuthenticated, user } = useAuthStore();
  const [activeTab, setActiveTab] = useState<Tab>("balances");

  const { balances, isLoading: loadingBalances, refetch: refetchBalances } = useBalances();
  const { portfolio, isLoading: loadingPortfolio } = usePortfolio();
  const { transactions, isLoading: loadingTransactions } = useTransactions({ limit: 20 });
  const { addresses, pending, isLoading: loadingDeposits, refetch: refetchDeposits } = useCryptoDeposits();
  const { prices, convertFromUsd, getPrice } = useCryptoPrices();
  const [selectedCurrency, setSelectedCurrency] = useState<string | null>(null);

  useEffect(() => {
    setSelectedCurrency(null);
  }, [addresses]);

  // Auto-refresh pending deposits every 30 seconds when on deposit tab
  useEffect(() => {
    if (activeTab !== "deposit") return;
    
    const interval = setInterval(() => {
      refetchDeposits();
      refetchBalances();
    }, 30000);
    
    return () => clearInterval(interval);
  }, [activeTab, refetchDeposits, refetchBalances]);

  if (!isAuthenticated) {
    return (
      <div className="text-center py-16">
        <p className="text-2xl font-semibold text-white">Sign in to view your wallet</p>
        <p className="mt-2 text-mist">Connect your wallet or sign in with email to manage your funds.</p>
        <Link
          href="/login"
          className="mt-6 inline-block border border-royal/50 bg-royal/10 px-6 py-3 text-sm uppercase tracking-widest text-gold hover:bg-royal/20 transition-colors"
        >
          Sign In
        </Link>
      </div>
    );
  }

  const tabs: { key: Tab; label: string }[] = [
    { key: "balances", label: "Balances" },
    { key: "portfolio", label: "Positions" },
    { key: "deposit", label: "Deposit" },
    { key: "history", label: "History" },
  ];

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast("Address copied to clipboard", "success");
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap gap-3 text-xs uppercase tracking-[0.35em]">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`border px-4 py-2 ${
              activeTab === tab.key
                ? "border-gold bg-gold/10 text-gold"
                : "border-white/10 text-mist hover:text-white"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab === "balances" && (
        <div className="border border-white/10 bg-charcoal/60 p-6">
          <div className="flex items-center justify-between mb-6">
            <p className="text-xs uppercase tracking-[0.4em] text-mist">Available Balances</p>
            <button
              onClick={() => refetchBalances()}
              className="text-xs uppercase tracking-widest text-gold hover:text-white"
            >
              Refresh
            </button>
          </div>
          {loadingBalances ? (
            <div className="space-y-4 animate-pulse">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="h-16 bg-white/5 rounded"></div>
              ))}
            </div>
          ) : balances.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-mist">No balances found</p>
              <p className="mt-2 text-xs text-mist">Deposit crypto to start trading</p>
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-3">
              {balances.map((balance) => (
                <div
                  key={balance.currency}
                  className="border border-white/10 bg-white/5 px-4 py-4"
                >
                  <p className="text-xs uppercase tracking-[0.4em] text-mist">
                    {balance.currency}
                  </p>
                  <p className="mt-2 text-2xl font-semibold text-white">
                    {formatCurrency(balance.available, balance.currency)}
                  </p>
                  {balance.reserved > 0 && (
                    <p className="mt-1 text-xs text-mist">
                      Reserved: {formatCurrency(balance.reserved, balance.currency)}
                    </p>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {activeTab === "portfolio" && (
        <div className="border border-white/10 bg-charcoal/60 p-6">
          <p className="text-xs uppercase tracking-[0.4em] text-mist mb-6">Open Positions</p>
          {loadingPortfolio ? (
            <div className="space-y-4 animate-pulse">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="h-24 bg-white/5 rounded"></div>
              ))}
            </div>
          ) : !portfolio || portfolio.rows.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-mist">No open positions</p>
              <p className="mt-2 text-xs text-mist">Start trading to build your portfolio</p>
              <Link
                href="/markets"
                className="mt-4 inline-block text-gold hover:text-white text-xs uppercase tracking-widest"
              >
                Browse Markets
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {portfolio.summaryByCurrency.length > 0 && (
                <div className="grid gap-4 sm:grid-cols-3 mb-6">
                  <div className="border border-white/10 bg-white/5 px-4 py-3">
                    <p className="text-xs uppercase tracking-[0.4em] text-mist">Total Stake</p>
                    <p className="text-xl font-semibold text-gold">
                      ${portfolio.summaryByCurrency.reduce((sum, s) => sum + s.totalStake, 0).toFixed(2)}
                    </p>
                  </div>
                  <div className="border border-white/10 bg-white/5 px-4 py-3">
                    <p className="text-xs uppercase tracking-[0.4em] text-mist">Total P&L</p>
                    {(() => {
                      const totalPnl = portfolio.summaryByCurrency.reduce((sum, s) => sum + s.totalProfit, 0);
                      return (
                        <p className={`text-xl font-semibold ${totalPnl >= 0 ? "text-green-400" : "text-red-400"}`}>
                          {totalPnl >= 0 ? "+" : ""}${totalPnl.toFixed(2)}
                        </p>
                      );
                    })()}
                  </div>
                  <div className="border border-white/10 bg-white/5 px-4 py-3">
                    <p className="text-xs uppercase tracking-[0.4em] text-mist">Positions</p>
                    <p className="text-xl font-semibold text-white">{portfolio.rows.length}</p>
                  </div>
                </div>
              )}
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="text-xs uppercase tracking-[0.35em] text-mist">
                    <tr className="text-left">
                      <th className="border-b border-white/10 py-3">Market</th>
                      <th className="border-b border-white/10 py-3">Side</th>
                      <th className="border-b border-white/10 py-3">Shares</th>
                      <th className="border-b border-white/10 py-3">Avg Price</th>
                      <th className="border-b border-white/10 py-3">Value</th>
                      <th className="border-b border-white/10 py-3">P&L</th>
                    </tr>
                  </thead>
                  <tbody>
                    {portfolio.rows.map((row) => (
                      <tr key={row.position.id} className="text-mist hover:text-white">
                        <td className="border-b border-white/5 py-3">
                          <Link href={`/markets/${row.position.marketSlug || row.position.marketId}`} className="hover:text-gold">
                            {(row.position.marketQuestion || "Market").slice(0, 40)}...
                          </Link>
                        </td>
                        <td className={`border-b border-white/5 py-3 ${row.position.outcome === "YES" ? "text-gold" : "text-electric"}`}>
                          {row.position.outcome}
                        </td>
                        <td className="border-b border-white/5 py-3">{row.position.shares.toFixed(2)}</td>
                        <td className="border-b border-white/5 py-3">{((row.position.avgPrice || row.position.price) * 100).toFixed(1)}%</td>
                        <td className="border-b border-white/5 py-3">${row.markPayout.toFixed(2)}</td>
                        <td className={`border-b border-white/5 py-3 ${row.markProfit >= 0 ? "text-green-400" : "text-red-400"}`}>
                          {row.markProfit >= 0 ? "+" : ""}${row.markProfit.toFixed(2)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {activeTab === "deposit" && (
        <div className="border border-white/10 bg-charcoal/60 p-6">
          <div className="flex items-center justify-between mb-6">
            <p className="text-xs uppercase tracking-[0.4em] text-mist">Crypto Deposit Addresses</p>
            <div className="flex items-center gap-4">
              {prices && (
                <div className="flex items-center gap-4 text-xs text-mist">
                  <span>ETH: <span className="text-gold">${prices.ETH.toLocaleString()}</span></span>
                  <span>USDC: <span className="text-gold">${prices.USDC.toFixed(2)}</span></span>
                  <span>USDT: <span className="text-gold">${prices.USDT.toFixed(2)}</span></span>
                </div>
              )}
              <button
                onClick={() => {
                  refetchDeposits();
                  refetchBalances();
                  toast("Refreshing deposits...", "success");
                }}
                className="text-xs uppercase tracking-widest text-gold hover:text-white"
              >
                Refresh
              </button>
            </div>
          </div>
          {loadingDeposits ? (
            <div className="space-y-4 animate-pulse">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="h-20 bg-white/5 rounded"></div>
              ))}
            </div>
          ) : !addresses || Object.keys(addresses).length === 0 ? (
            <p className="text-mist">Unable to load deposit addresses. Please try clicking Refresh.</p>
          ) : (
            <div className="space-y-6">
              <div className="grid gap-4 sm:grid-cols-3">
                {Object.entries(addresses).map(([currency, data]) => {
                  const normalizedCurrency = currency.toUpperCase();
                  const minDeposit = MINIMUM_DEPOSITS[normalizedCurrency];
                  const isSelected = selectedCurrency === currency;
                  
                  return (
                    <div
                      key={currency}
                      className={`border bg-white/5 p-4 cursor-pointer transition-all ${
                        isSelected ? "border-gold" : "border-white/10 hover:border-white/30"
                      }`}
                      onClick={() => setSelectedCurrency(isSelected ? null : currency)}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <p className="text-xs uppercase tracking-[0.4em] text-gold">
                          {currency.toUpperCase()}
                        </p>
                        {(() => {
                          const price = getPrice(currency);
                          return price !== null ? (
                            <span className="text-xs text-mist">
                              1 {currency.toUpperCase()} = ${price.toLocaleString()}
                            </span>
                          ) : null;
                        })()}
                      </div>
                      <p className="text-xs text-mist mb-2">Network: {data.network}</p>
                      
                      {minDeposit && (
                        <p className="text-xs text-electric mb-3">
                          Min: {minDeposit.amount} {currency} ({minDeposit.usdEquivalent})
                        </p>
                      )}

                      {isSelected && (
                        <div className="my-4 flex justify-center">
                          <div className="bg-white p-3 rounded-lg">
                            <QRCodeSVG
                              value={data.address}
                              size={140}
                              level="H"
                              includeMargin={false}
                            />
                          </div>
                        </div>
                      )}

                      <div className="flex items-center gap-2">
                        <code className="text-xs text-white break-all flex-1">
                          {isSelected ? data.address : truncateAddress(data.address, 8)}
                        </code>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            copyToClipboard(data.address);
                          }}
                          className="text-xs text-gold hover:text-white px-2 py-1 border border-gold/30 hover:border-gold"
                        >
                          Copy
                        </button>
                      </div>

                      {!isSelected && (
                        <p className="text-xs text-mist mt-3 text-center">Click to show QR code</p>
                      )}

                      {isSelected && getPrice(currency) !== null && (
                        <div className="mt-4 pt-4 border-t border-white/10">
                          <p className="text-xs text-mist mb-2">Quick Reference:</p>
                          <div className="grid grid-cols-2 gap-2 text-xs">
                            {[10, 50, 100, 500].map((usd) => {
                              const converted = convertFromUsd(usd, currency);
                              if (converted === 0) return null;
                              return (
                                <div key={usd} className="flex justify-between text-mist">
                                  <span>${usd}</span>
                                  <span className="text-white">
                                    {converted.toFixed(currency.toUpperCase() === "ETH" ? 6 : 2)} {currency.toUpperCase()}
                                  </span>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
              
              {pending.length > 0 && (
                <div className="mt-6">
                  <p className="text-xs uppercase tracking-[0.4em] text-mist mb-4">Pending Deposits</p>
                  <div className="space-y-3">
                    {pending.map((dep, i) => {
                      const progress = Math.min((dep.confirmations / dep.requiredConfirmations) * 100, 100);
                      return (
                        <div key={i} className="border border-yellow-500/20 bg-yellow-900/10 px-4 py-3">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-sm font-medium text-white">
                              {formatCryptoAmount(dep.amount, dep.token)}
                            </span>
                            <a 
                              href={getExplorerTxUrl(dep.txHash)} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="text-xs text-royal hover:text-gold transition-colors"
                            >
                              {truncateAddress(dep.txHash, 8)}
                            </a>
                          </div>
                          <div className="flex items-center gap-3">
                            <div className="flex-1 h-2 bg-charcoal rounded-full overflow-hidden">
                              <div 
                                className="h-full bg-yellow-500 transition-all duration-500"
                                style={{ width: `${progress}%` }}
                              />
                            </div>
                            <span className="text-xs text-yellow-400 whitespace-nowrap">
                              {dep.confirmations}/{dep.requiredConfirmations}
                            </span>
                          </div>
                          <p className="text-xs text-mist mt-2">
                            {dep.confirmations >= dep.requiredConfirmations 
                              ? "Ready to credit" 
                              : `Waiting for ${dep.requiredConfirmations - dep.confirmations} more confirmation${dep.requiredConfirmations - dep.confirmations === 1 ? '' : 's'}`}
                          </p>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
              
              <div className="border-t border-white/10 pt-4 mt-4">
                <p className="text-xs text-mist">
                  Send only the specified cryptocurrency to the address above. Sending any other asset may result in permanent loss.
                </p>
              </div>
            </div>
          )}
        </div>
      )}

      {activeTab === "history" && (
        <div className="border border-white/10 bg-charcoal/60 p-6">
          <p className="text-xs uppercase tracking-[0.4em] text-mist mb-6">Transaction History</p>
          {loadingTransactions ? (
            <div className="space-y-4 animate-pulse">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="h-12 bg-white/5 rounded"></div>
              ))}
            </div>
          ) : transactions.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-mist">No transactions yet</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="text-xs uppercase tracking-[0.35em] text-mist">
                  <tr className="text-left">
                    <th className="border-b border-white/10 py-3">Type</th>
                    <th className="border-b border-white/10 py-3">Amount</th>
                    <th className="border-b border-white/10 py-3">Currency</th>
                    <th className="border-b border-white/10 py-3">Status</th>
                    <th className="border-b border-white/10 py-3">Date</th>
                    <th className="border-b border-white/10 py-3">TX</th>
                  </tr>
                </thead>
                <tbody>
                  {transactions.map((tx) => (
                    <tr key={tx.id} className="text-mist">
                      <td className="border-b border-white/5 py-3 capitalize">{tx.type.replace("_", " ")}</td>
                      <td className={`border-b border-white/5 py-3 ${
                        tx.type === "deposit" || tx.type === "trade_payout" ? "text-green-400" : "text-white"
                      }`}>
                        {tx.type === "deposit" || tx.type === "trade_payout" ? "+" : "-"}
                        {formatCryptoAmount(tx.amount, tx.currency)}
                      </td>
                      <td className="border-b border-white/5 py-3">{tx.currency}</td>
                      <td className={`border-b border-white/5 py-3 ${
                        tx.status === "completed" ? "text-green-400" : 
                        tx.status === "pending" ? "text-yellow-400" : "text-mist"
                      }`}>
                        {tx.status || "completed"}
                      </td>
                      <td className="border-b border-white/5 py-3">
                        {formatDateTime(tx.createdAt)}
                      </td>
                      <td className="border-b border-white/5 py-3">
                        {tx.txHash ? (
                          <a 
                            href={getExplorerTxUrl(tx.txHash)} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-royal hover:text-gold transition-colors"
                          >
                            View
                          </a>
                        ) : (
                          <span className="text-mist/50">—</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
