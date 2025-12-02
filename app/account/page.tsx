"use client";

import { useState } from "react";
import Link from "next/link";
import { useAuthStore } from "@/lib/stores/useAuthStore";
import { useProfile } from "@/lib/hooks/useProfile";
import { formatCurrency, formatDateTime } from "@/lib/utils";
import { toast } from "@/components/Toast";

export default function AccountPage() {
  const { isAuthenticated, user, logout } = useAuthStore();
  const { profile, isLoading, error, updateProfile } = useProfile();
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState("");

  if (!isAuthenticated) {
    return (
      <div className="space-y-10">
        <header className="border border-white/5 bg-charcoal/60 px-8 py-10">
          <p className="text-xs uppercase tracking-[0.4em] text-gold">Account</p>
          <h1 className="mt-4 text-4xl font-semibold text-white">Sign in to view your profile</h1>
          <p className="mt-3 text-sm text-mist">
            Connect your wallet or sign in with email to access your account settings.
          </p>
        </header>
        <div className="text-center py-16">
          <Link
            href="/login"
            className="border border-royal/50 bg-royal/10 px-6 py-3 text-sm uppercase tracking-widest text-gold hover:bg-royal/20 transition-colors"
          >
            Sign In
          </Link>
        </div>
      </div>
    );
  }

  const handleSaveName = async () => {
    const success = await updateProfile({ name: editName });
    if (success) {
      toast("Profile updated successfully", "success");
      setIsEditing(false);
    } else {
      toast("Failed to update profile", "error");
    }
  };

  const startEditing = () => {
    setEditName(profile?.name || "");
    setIsEditing(true);
  };

  return (
    <div className="space-y-10">
      <header className="flex flex-col gap-4 border border-white/5 bg-charcoal/60 px-8 py-10 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.4em] text-gold">Account</p>
          <h1 className="mt-4 text-4xl font-semibold text-white">Profile & Settings</h1>
          <p className="mt-3 text-sm text-mist">
            Manage your account settings, preferences, and risk controls.
          </p>
        </div>
        <button
          onClick={logout}
          className="border border-white/20 bg-white/5 px-6 py-3 text-sm uppercase tracking-widest text-mist hover:bg-red-500/20 hover:border-red-500/50 hover:text-white transition-colors"
        >
          Sign Out
        </button>
      </header>

      {isLoading ? (
        <div className="grid gap-8 lg:grid-cols-2">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-48 animate-pulse border border-white/5 bg-charcoal/40"></div>
          ))}
        </div>
      ) : error ? (
        <div className="border border-red-500/20 bg-red-900/10 p-6 text-center">
          <p className="text-red-400">{error}</p>
        </div>
      ) : (
        <div className="grid gap-8 lg:grid-cols-2">
          <section className="border border-white/5 bg-slate/50 p-6">
            <div className="flex items-center justify-between mb-4">
              <p className="text-xs uppercase tracking-[0.35em] text-mist">Profile</p>
              {!isEditing && (
                <button
                  onClick={startEditing}
                  className="text-xs text-gold hover:text-white uppercase tracking-widest"
                >
                  Edit
                </button>
              )}
            </div>
            <div className="space-y-4 text-sm text-mist">
              <div>
                <p className="text-xs uppercase tracking-[0.35em] text-white mb-1">Display Name</p>
                {isEditing ? (
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      className="flex-1 border border-white/10 bg-transparent px-3 py-2 text-white focus:border-royal focus:outline-none"
                      placeholder="Enter your name"
                    />
                    <button
                      onClick={handleSaveName}
                      className="border border-gold/50 bg-gold/10 px-4 py-2 text-xs text-gold hover:bg-gold/20"
                    >
                      Save
                    </button>
                    <button
                      onClick={() => setIsEditing(false)}
                      className="border border-white/10 px-4 py-2 text-xs text-mist hover:text-white"
                    >
                      Cancel
                    </button>
                  </div>
                ) : (
                  <p>{profile?.name || "Not set"}</p>
                )}
              </div>
              <div>
                <p className="text-xs uppercase tracking-[0.35em] text-white mb-1">Email</p>
                <p>{profile?.email || user?.email || "Not set"}</p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-[0.35em] text-white mb-1">Role</p>
                <p className="capitalize">{profile?.role || "User"}</p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-[0.35em] text-white mb-1">Member Since</p>
                <p>{profile?.createdAt ? formatDateTime(profile.createdAt) : "N/A"}</p>
              </div>
            </div>
          </section>

          <section className="border border-white/5 bg-slate/50 p-6">
            <p className="text-xs uppercase tracking-[0.35em] text-mist mb-4">Verification</p>
            <div className="space-y-4 text-sm text-mist">
              <div>
                <p className="text-xs uppercase tracking-[0.35em] text-white mb-1">KYC Status</p>
                <p className={`capitalize ${
                  profile?.kycStatus === "verified" ? "text-green-400" :
                  profile?.kycStatus === "pending" ? "text-yellow-400" : "text-mist"
                }`}>
                  {profile?.kycStatus || "Not started"}
                </p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-[0.35em] text-white mb-1">Default Currency</p>
                <p>{profile?.defaultCurrency || "USDC"}</p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-[0.35em] text-white mb-1">Last Login</p>
                <p>{profile?.lastLoginAt ? formatDateTime(profile.lastLoginAt) : "N/A"}</p>
              </div>
            </div>
          </section>

          {profile?.riskSettings && profile.riskSettings.length > 0 && (
            <section className="border border-white/5 bg-slate/50 p-6">
              <p className="text-xs uppercase tracking-[0.35em] text-mist mb-4">Risk Limits</p>
              <div className="space-y-3">
                {profile.riskSettings.map((setting) => (
                  <div key={setting.currency} className="flex items-center justify-between border-b border-white/5 pb-2">
                    <span className="text-sm text-white">{setting.currency}</span>
                    <div className="text-xs text-mist">
                      <span>Max stake: {formatCurrency(setting.maxStake, setting.currency)}</span>
                      <span className="mx-2">|</span>
                      <span>Daily limit: {formatCurrency(setting.maxDailyVolume, setting.currency)}</span>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {profile?.balances && profile.balances.length > 0 && (
            <section className="border border-white/5 bg-slate/50 p-6">
              <p className="text-xs uppercase tracking-[0.35em] text-mist mb-4">Account Balances</p>
              <div className="grid gap-3 sm:grid-cols-3">
                {profile.balances
                  .filter((b) => ["ETH", "USDC", "USDT"].includes(b.currency))
                  .map((balance) => (
                    <div key={balance.currency} className="border border-white/10 bg-white/5 px-3 py-2">
                      <p className="text-xs text-mist">{balance.currency}</p>
                      <p className="text-lg font-semibold text-white">
                        {formatCurrency(balance.total, balance.currency)}
                      </p>
                    </div>
                  ))}
              </div>
              <Link
                href="/wallet"
                className="mt-4 inline-block text-xs text-gold hover:text-white uppercase tracking-widest"
              >
                Manage Wallet →
              </Link>
            </section>
          )}
        </div>
      )}
    </div>
  );
}
