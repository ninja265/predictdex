"use client";

import { useState } from "react";
import { useAdminCrypto } from "@/lib/hooks/useAdmin";
import { toast } from "@/components/Toast";
import { truncateAddress } from "@/lib/utils";

type Tab = "deposits" | "withdrawals";

export default function AdminCryptoPage() {
  const [activeTab, setActiveTab] = useState<Tab>("deposits");
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [rejectReason, setRejectReason] = useState("");
  const [txHash, setTxHash] = useState("");
  const [showRejectModal, setShowRejectModal] = useState<string | null>(null);
  const [showCompleteModal, setShowCompleteModal] = useState<string | null>(null);

  const {
    deposits,
    depositStats,
    withdrawals,
    isLoading,
    error,
    refetch,
    creditDeposit,
    approveWithdrawal,
    rejectWithdrawal,
    completeWithdrawal,
  } = useAdminCrypto();

  const handleCreditDeposit = async (id: string) => {
    setProcessingId(id);
    const success = await creditDeposit(id);
    if (success) {
      toast("Deposit credited successfully", "success");
    } else {
      toast("Failed to credit deposit", "error");
    }
    setProcessingId(null);
  };

  const handleApproveWithdrawal = async (id: string) => {
    setProcessingId(id);
    const success = await approveWithdrawal(id);
    if (success) {
      toast("Withdrawal approved", "success");
    } else {
      toast("Failed to approve withdrawal", "error");
    }
    setProcessingId(null);
  };

  const handleRejectWithdrawal = async (id: string) => {
    if (!rejectReason.trim()) {
      toast("Please provide a reason", "error");
      return;
    }
    setProcessingId(id);
    const success = await rejectWithdrawal(id, rejectReason);
    if (success) {
      toast("Withdrawal rejected", "success");
      setShowRejectModal(null);
      setRejectReason("");
    } else {
      toast("Failed to reject withdrawal", "error");
    }
    setProcessingId(null);
  };

  const handleCompleteWithdrawal = async (id: string) => {
    if (!txHash.trim()) {
      toast("Please provide transaction hash", "error");
      return;
    }
    setProcessingId(id);
    const success = await completeWithdrawal(id, txHash);
    if (success) {
      toast("Withdrawal completed", "success");
      setShowCompleteModal(null);
      setTxHash("");
    } else {
      toast("Failed to complete withdrawal", "error");
    }
    setProcessingId(null);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-white">Crypto Management</h1>
        <p className="mt-1 text-mist">Manage deposits and withdrawals</p>
      </div>

      {depositStats && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="border border-white/10 bg-white/5 px-4 py-3">
            <p className="text-xs uppercase tracking-widest text-mist">Pending Deposits</p>
            <p className="text-2xl font-semibold text-gold mt-1">{depositStats.pendingCount ?? 0}</p>
          </div>
          <div className="border border-white/10 bg-white/5 px-4 py-3">
            <p className="text-xs uppercase tracking-widest text-mist">Pending Volume</p>
            <p className="text-2xl font-semibold text-white mt-1">${(depositStats.pendingVolume ?? 0).toLocaleString()}</p>
          </div>
          <div className="border border-white/10 bg-white/5 px-4 py-3">
            <p className="text-xs uppercase tracking-widest text-mist">Credited Today</p>
            <p className="text-2xl font-semibold text-white mt-1">{depositStats.creditedToday ?? 0}</p>
          </div>
          <div className="border border-white/10 bg-white/5 px-4 py-3">
            <p className="text-xs uppercase tracking-widest text-mist">Credited Volume Today</p>
            <p className="text-2xl font-semibold text-white mt-1">${(depositStats.creditedVolumeToday ?? 0).toLocaleString()}</p>
          </div>
        </div>
      )}

      <div className="flex items-center gap-3">
        <button
          onClick={() => setActiveTab("deposits")}
          className={`text-xs uppercase tracking-widest px-4 py-2 border ${
            activeTab === "deposits" ? "border-gold text-gold" : "border-white/10 text-mist hover:text-white"
          }`}
        >
          Deposits ({deposits?.length ?? 0})
        </button>
        <button
          onClick={() => setActiveTab("withdrawals")}
          className={`text-xs uppercase tracking-widest px-4 py-2 border ${
            activeTab === "withdrawals" ? "border-gold text-gold" : "border-white/10 text-mist hover:text-white"
          }`}
        >
          Withdrawals ({withdrawals?.length ?? 0})
        </button>
      </div>

      {error && (
        <div className="border border-red-500/30 bg-red-900/10 px-4 py-3 text-red-400 text-sm">
          {error}
        </div>
      )}

      {isLoading ? (
        <div className="space-y-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-20 bg-white/5 rounded animate-pulse"></div>
          ))}
        </div>
      ) : activeTab === "deposits" ? (
        <div className="border border-white/10 bg-charcoal/60 p-6">
          <h2 className="text-xs uppercase tracking-[0.4em] text-mist mb-4">Pending Deposits</h2>
          {!deposits || deposits.length === 0 ? (
            <div className="text-center py-8 text-mist">No pending deposits</div>
          ) : (
            <div className="space-y-3">
              {deposits.map((deposit) => (
                <div
                  key={deposit.id}
                  className="flex items-center justify-between border border-yellow-500/20 bg-yellow-900/10 px-4 py-3"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-4">
                      <span className="text-lg font-semibold text-yellow-400">
                        {deposit.amount} {deposit.token}
                      </span>
                      <span className="text-xs text-mist">
                        {deposit.confirmations}/{deposit.requiredConfirmations} confirmations
                      </span>
                    </div>
                    <p className="text-xs text-mist mt-1">
                      TX: {truncateAddress(deposit.txHash, 12)} | User: {deposit.user?.email || deposit.user?.walletAddress || deposit.user?.id?.slice(0, 8) || 'Unknown'}
                    </p>
                  </div>
                  {deposit.isThresholdMet && deposit.status === 'pending' && (
                    <button
                      onClick={() => handleCreditDeposit(deposit.id)}
                      disabled={processingId === deposit.id}
                      className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white text-xs uppercase tracking-widest disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {processingId === deposit.id ? "Processing..." : "Credit"}
                    </button>
                  )}
                  {!deposit.isThresholdMet && deposit.status === 'pending' && (
                    <span className="text-xs text-yellow-400">Waiting for confirmations...</span>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      ) : (
        <div className="border border-white/10 bg-charcoal/60 p-6">
          <h2 className="text-xs uppercase tracking-[0.4em] text-mist mb-4">Pending Withdrawals</h2>
          {!withdrawals || withdrawals.length === 0 ? (
            <div className="text-center py-8 text-mist">No pending withdrawals</div>
          ) : (
            <div className="space-y-3">
              {withdrawals.map((withdrawal) => (
                <div
                  key={withdrawal.id}
                  className="border border-white/10 bg-white/5 px-4 py-3"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-4">
                        <span className="text-lg font-semibold text-white">
                          {withdrawal.amount} {withdrawal.token}
                        </span>
                        <span className={`text-xs px-2 py-0.5 ${
                          withdrawal.status === "pending" ? "bg-yellow-500/20 text-yellow-400" :
                          withdrawal.status === "approved" ? "bg-blue-500/20 text-blue-400" :
                          withdrawal.status === "rejected" ? "bg-red-500/20 text-red-400" :
                          "bg-green-500/20 text-green-400"
                        }`}>
                          {withdrawal.status.toUpperCase()}
                        </span>
                      </div>
                      <p className="text-xs text-mist mt-1">
                        To: {truncateAddress(withdrawal.toAddress, 12)} | User: {withdrawal.userEmail || withdrawal.userId?.slice(0, 8) || 'Unknown'}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      {withdrawal.status === "pending" && (
                        <>
                          <button
                            onClick={() => handleApproveWithdrawal(withdrawal.id)}
                            disabled={processingId === withdrawal.id}
                            className="px-3 py-1 border border-green-500/50 text-green-400 hover:bg-green-500/10 text-xs uppercase tracking-widest disabled:opacity-50"
                          >
                            Approve
                          </button>
                          <button
                            onClick={() => setShowRejectModal(withdrawal.id)}
                            disabled={processingId === withdrawal.id}
                            className="px-3 py-1 border border-red-500/50 text-red-400 hover:bg-red-500/10 text-xs uppercase tracking-widest disabled:opacity-50"
                          >
                            Reject
                          </button>
                        </>
                      )}
                      {withdrawal.status === "approved" && (
                        <button
                          onClick={() => setShowCompleteModal(withdrawal.id)}
                          disabled={processingId === withdrawal.id}
                          className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white text-xs uppercase tracking-widest disabled:opacity-50"
                        >
                          Complete
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {showRejectModal && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
          <div className="bg-charcoal border border-white/10 w-full max-w-md p-6">
            <h2 className="text-lg font-semibold text-white mb-4">Reject Withdrawal</h2>
            <div className="mb-4">
              <label className="block text-xs uppercase tracking-widest text-mist mb-2">
                Reason
              </label>
              <textarea
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                className="w-full bg-white/5 border border-white/10 px-3 py-2 text-white focus:border-gold focus:outline-none h-24"
                placeholder="Reason for rejection..."
              />
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => handleRejectWithdrawal(showRejectModal)}
                disabled={processingId === showRejectModal}
                className="flex-1 bg-red-600 hover:bg-red-700 text-white py-2 text-sm uppercase tracking-widest disabled:opacity-50"
              >
                {processingId === showRejectModal ? "Processing..." : "Reject"}
              </button>
              <button
                onClick={() => {
                  setShowRejectModal(null);
                  setRejectReason("");
                }}
                className="px-4 py-2 border border-white/20 text-mist hover:text-white text-sm uppercase tracking-widest"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {showCompleteModal && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
          <div className="bg-charcoal border border-white/10 w-full max-w-md p-6">
            <h2 className="text-lg font-semibold text-white mb-4">Complete Withdrawal</h2>
            <div className="mb-4">
              <label className="block text-xs uppercase tracking-widest text-mist mb-2">
                Transaction Hash
              </label>
              <input
                type="text"
                value={txHash}
                onChange={(e) => setTxHash(e.target.value)}
                className="w-full bg-white/5 border border-white/10 px-3 py-2 text-white focus:border-gold focus:outline-none"
                placeholder="0x..."
              />
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => handleCompleteWithdrawal(showCompleteModal)}
                disabled={processingId === showCompleteModal}
                className="flex-1 bg-green-600 hover:bg-green-700 text-white py-2 text-sm uppercase tracking-widest disabled:opacity-50"
              >
                {processingId === showCompleteModal ? "Processing..." : "Complete"}
              </button>
              <button
                onClick={() => {
                  setShowCompleteModal(null);
                  setTxHash("");
                }}
                className="px-4 py-2 border border-white/20 text-mist hover:text-white text-sm uppercase tracking-widest"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
