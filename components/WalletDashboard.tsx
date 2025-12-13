"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/lib/stores/useAuthStore";
import { useBalances, usePortfolio, useTransactions, useCryptoDeposits, useWithdrawals } from "@/lib/hooks/useWallet";
import { useCryptoPrices } from "@/lib/hooks/useCryptoPrices";
import { formatCurrency, formatCryptoAmount, formatDateTime, truncateAddress, getExplorerTxUrl } from "@/lib/utils";
import { toast } from "./Toast";
import Link from "next/link";
import { QRCodeSVG } from "qrcode.react";
import type { WithdrawalRequest } from "@/lib/api/types";

const MINIMUM_DEPOSITS: Record<string, { amount: number; usdEquivalent: string }> = {
  ETH: { amount: 0.001, usdEquivalent: "~$3.50" },
  USDC: { amount: 5, usdEquivalent: "$5.00" },
  USDT: { amount: 5, usdEquivalent: "$5.00" },
};

type Tab = "balances" | "portfolio" | "deposit" | "withdraw" | "history";
type WithdrawToken = "ETH" | "USDC" | "USDT";

export default function WalletDashboard() {
  const router = useRouter();
  const { isAuthenticated, user } = useAuthStore();
  const [activeTab, setActiveTab] = useState<Tab>("balances");

  const { balances, isLoading: loadingBalances, refetch: refetchBalances } = useBalances();
  const { portfolio, isLoading: loadingPortfolio } = usePortfolio();
  const { transactions, isLoading: loadingTransactions } = useTransactions({ limit: 20 });
  const { addresses, pending, isLoading: loadingDeposits, refetch: refetchDeposits } = useCryptoDeposits();
  const { limits: withdrawLimits, withdrawals, isLoading: loadingWithdrawals, error: withdrawalsError, submitWithdrawal, refetch: refetchWithdrawals } = useWithdrawals();
  const { prices, convertFromUsd, getPrice } = useCryptoPrices();
  const [selectedCurrency, setSelectedCurrency] = useState<string | null>(null);
  
  const [withdrawToken, setWithdrawToken] = useState<WithdrawToken>("ETH");
  const [withdrawAmount, setWithdrawAmount] = useState<string>("");
  const [withdrawAddress, setWithdrawAddress] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState(false);

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
    { key: "withdraw", label: "Withdraw" },
    { key: "history", label: "History" },
  ];

  const getBalanceForToken = (token: string) => {
    const balance = balances.find(b => b.currency === token);
    return balance ? { available: balance.available, reserved: balance.reserved } : { available: 0, reserved: 0 };
  };

  const feeRate = withdrawLimits?.feeRate ?? 0.01;
  const feePercentage = withdrawLimits?.feePercentage ?? "1%";
  const calculateFee = (amount: number) => amount * feeRate;
  const calculateNet = (amount: number) => amount - calculateFee(amount);

  const isValidEthAddress = (address: string) => /^0x[a-fA-F0-9]{40}$/.test(address);

  const handleWithdrawSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const amount = parseFloat(withdrawAmount);
    if (isNaN(amount) || amount <= 0) {
      toast("Please enter a valid amount", "error");
      return;
    }

    if (!isValidEthAddress(withdrawAddress)) {
      toast("Please enter a valid Ethereum address", "error");
      return;
    }

    const tokenLimits = withdrawLimits?.limits[withdrawToken];
    if (tokenLimits) {
      if (amount < tokenLimits.min) {
        toast(`Minimum withdrawal is ${tokenLimits.min} ${withdrawToken}`, "error");
        return;
      }
      if (amount > tokenLimits.remaining) {
        toast(`Daily limit remaining: ${tokenLimits.remaining} ${withdrawToken}`, "error");
        return;
      }
    }

    const { available } = getBalanceForToken(withdrawToken);
    if (amount > available) {
      toast(`Insufficient balance. Available: ${formatCryptoAmount(available, withdrawToken)}`, "error");
      return;
    }

    setIsSubmitting(true);
    try {
      const result = await submitWithdrawal({
        token: withdrawToken,
        amount,
        destinationAddress: withdrawAddress,
      });
      
      if (result) {
        toast(`Withdrawal request submitted. You will receive ${formatCryptoAmount(result.netAmount, withdrawToken)} after fees.`, "success");
        setWithdrawAmount("");
        setWithdrawAddress("");
        refetchBalances();
        refetchWithdrawals();
      }
    } catch (err) {
      toast(err instanceof Error ? err.message : "Withdrawal failed", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

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

      {activeTab === "withdraw" && (
        <div className="border border-white/10 bg-charcoal/60 p-6">
          <div className="flex items-center justify-between mb-6">
            <p className="text-xs uppercase tracking-[0.4em] text-mist">Withdraw Crypto</p>
            <button
              onClick={() => {
                refetchWithdrawals();
                refetchBalances();
              }}
              className="text-xs uppercase tracking-widest text-gold hover:text-white"
            >
              Refresh
            </button>
          </div>

          {loadingWithdrawals ? (
            <div className="space-y-4 animate-pulse">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="h-20 bg-white/5 rounded"></div>
              ))}
            </div>
          ) : withdrawalsError || !withdrawLimits ? (
            <div className="border border-red-500/20 bg-red-900/10 p-6 text-center">
              <p className="text-red-400 mb-4">
                {withdrawalsError || "Unable to load withdrawal limits. Please try again."}
              </p>
              <button
                onClick={() => refetchWithdrawals()}
                className="border border-gold bg-gold/10 px-6 py-2 text-sm uppercase tracking-widest text-gold hover:bg-gold/20 transition-colors"
              >
                Retry
              </button>
            </div>
          ) : (
            <div className="grid gap-6 lg:grid-cols-2">
              <form onSubmit={handleWithdrawSubmit} className="space-y-4">
                <div>
                  <label className="text-xs uppercase tracking-[0.4em] text-mist block mb-2">Token</label>
                  <div className="flex gap-2">
                    {(["ETH", "USDC", "USDT"] as WithdrawToken[]).map((token) => {
                      const { available } = getBalanceForToken(token);
                      const tokenLimits = withdrawLimits?.limits[token];
                      return (
                        <button
                          key={token}
                          type="button"
                          onClick={() => {
                            setWithdrawToken(token);
                            setWithdrawAmount("");
                          }}
                          className={`flex-1 border p-3 transition-all ${
                            withdrawToken === token
                              ? "border-gold bg-gold/10 text-gold"
                              : "border-white/10 text-mist hover:text-white hover:border-white/30"
                          }`}
                        >
                          <p className="text-sm font-medium">{token}</p>
                          <p className="text-xs mt-1">
                            {formatCryptoAmount(available, token)} available
                          </p>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {(() => {
                  const { available, reserved } = getBalanceForToken(withdrawToken);
                  const tokenLimits = withdrawLimits?.limits[withdrawToken];
                  const amount = parseFloat(withdrawAmount) || 0;
                  const fee = calculateFee(amount);
                  const netAmount = calculateNet(amount);
                  
                  return (
                    <>
                      {reserved > 0 && (
                        <div className="border border-yellow-500/20 bg-yellow-900/10 px-4 py-3">
                          <p className="text-sm text-yellow-400">
                            {formatCryptoAmount(reserved, withdrawToken)} is locked in active market positions
                          </p>
                        </div>
                      )}

                      <div>
                        <label className="text-xs uppercase tracking-[0.4em] text-mist block mb-2">Amount</label>
                        <div className="relative">
                          <input
                            type="number"
                            step="any"
                            min={tokenLimits?.min || 0}
                            max={Math.min(available, tokenLimits?.remaining || available)}
                            value={withdrawAmount}
                            onChange={(e) => setWithdrawAmount(e.target.value)}
                            placeholder={`Min: ${tokenLimits?.min || 0}`}
                            className="w-full border border-white/10 bg-charcoal px-4 py-3 text-white placeholder:text-mist/50 focus:border-gold focus:outline-none"
                          />
                          <button
                            type="button"
                            onClick={() => setWithdrawAmount(available.toString())}
                            className="absolute right-2 top-1/2 -translate-y-1/2 text-xs text-gold hover:text-white px-2 py-1"
                          >
                            MAX
                          </button>
                        </div>
                        {tokenLimits && (
                          <p className="text-xs text-mist mt-1">
                            Daily remaining: {formatCryptoAmount(tokenLimits.remaining, withdrawToken)} / {formatCryptoAmount(tokenLimits.daily, withdrawToken)}
                          </p>
                        )}
                      </div>

                      <div>
                        <label className="text-xs uppercase tracking-[0.4em] text-mist block mb-2">Destination Address</label>
                        <input
                          type="text"
                          value={withdrawAddress}
                          onChange={(e) => setWithdrawAddress(e.target.value)}
                          placeholder="0x..."
                          className={`w-full border bg-charcoal px-4 py-3 text-white placeholder:text-mist/50 focus:outline-none ${
                            withdrawAddress && !isValidEthAddress(withdrawAddress)
                              ? "border-red-500 focus:border-red-500"
                              : "border-white/10 focus:border-gold"
                          }`}
                        />
                        {withdrawAddress && !isValidEthAddress(withdrawAddress) && (
                          <p className="text-xs text-red-400 mt-1">Invalid Ethereum address</p>
                        )}
                      </div>

                      {amount > 0 && (
                        <div className="border border-white/10 bg-white/5 p-4 space-y-2">
                          <div className="flex justify-between text-sm">
                            <span className="text-mist">Amount</span>
                            <span className="text-white">{formatCryptoAmount(amount, withdrawToken)}</span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span className="text-mist">Fee ({feePercentage})</span>
                            <span className="text-yellow-400">-{formatCryptoAmount(fee, withdrawToken)}</span>
                          </div>
                          <div className="flex justify-between text-sm border-t border-white/10 pt-2">
                            <span className="text-mist">You receive</span>
                            <span className="text-gold font-semibold">{formatCryptoAmount(netAmount, withdrawToken)}</span>
                          </div>
                        </div>
                      )}

                      <button
                        type="submit"
                        disabled={isSubmitting || !withdrawAmount || !withdrawAddress || !isValidEthAddress(withdrawAddress)}
                        className="w-full border border-gold bg-gold/10 px-6 py-3 text-sm uppercase tracking-widest text-gold hover:bg-gold/20 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {isSubmitting ? "Submitting..." : "Request Withdrawal"}
                      </button>
                    </>
                  );
                })()}
              </form>

              <div>
                <p className="text-xs uppercase tracking-[0.4em] text-mist mb-4">Recent Withdrawals</p>
                {withdrawals.length === 0 ? (
                  <div className="text-center py-8 border border-white/10 bg-white/5">
                    <p className="text-mist">No withdrawal history</p>
                  </div>
                ) : (
                  <div className="space-y-3 max-h-[400px] overflow-y-auto">
                    {withdrawals.map((w) => {
                      const statusConfig: Record<string, { color: string; label: string }> = {
                        pending: { color: "text-yellow-400", label: "Pending Review" },
                        approved: { color: "text-blue-400", label: "Processing" },
                        completed: { color: "text-green-400", label: "Completed" },
                        rejected: { color: "text-red-400", label: "Rejected" },
                      };
                      const status = statusConfig[w.status] || { color: "text-mist", label: w.status };
                      
                      return (
                        <div key={w.id} className="border border-white/10 bg-white/5 p-4">
                          <div className="flex justify-between items-start mb-2">
                            <div>
                              <p className="text-sm font-medium text-white">
                                -{formatCryptoAmount(w.amount, w.token)}
                              </p>
                              <p className="text-xs text-mist">
                                Fee: {formatCryptoAmount(w.fee, w.token)} | Net: {formatCryptoAmount(w.netAmount, w.token)}
                              </p>
                            </div>
                            <span className={`text-xs ${status.color}`}>{status.label}</span>
                          </div>
                          <p className="text-xs text-mist truncate">
                            To: {truncateAddress(w.destinationAddress, 10)}
                          </p>
                          <p className="text-xs text-mist mt-1">{formatDateTime(w.createdAt)}</p>
                          {w.status === "completed" && w.txHash && (
                            <a
                              href={getExplorerTxUrl(w.txHash)}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-xs text-royal hover:text-gold mt-2 inline-block"
                            >
                              View on Explorer
                            </a>
                          )}
                          {w.status === "rejected" && w.rejectionReason && (
                            <p className="text-xs text-red-400 mt-2">Reason: {w.rejectionReason}</p>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          )}

          <div className="border-t border-white/10 pt-4 mt-6">
            <p className="text-xs text-mist">
              Withdrawals are reviewed by our team and processed within 24 hours. A {feePercentage} fee applies to all withdrawals.
            </p>
          </div>
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
