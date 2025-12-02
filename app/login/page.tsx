"use client";

import { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuthStore } from "@/lib/stores/useAuthStore";
import { useAccount, useSignMessage } from "wagmi";
import { useConnectModal } from "@rainbow-me/rainbowkit";
import { toast } from "@/components/Toast";

type AuthMode = "email" | "wallet";
type EmailStep = "email" | "otp";

export default function LoginPage() {
  const router = useRouter();
  const [mode, setMode] = useState<AuthMode>("email");
  const [emailStep, setEmailStep] = useState<EmailStep>("email");
  const [email, setEmail] = useState("");
  const [otpCode, setOtpCode] = useState("");
  
  const { requestOtp, verifyOtp, loginWithWallet, isLoading, error, setError } = useAuthStore();
  const { address, isConnected } = useAccount();
  const { signMessageAsync } = useSignMessage();
  const { openConnectModal } = useConnectModal();

  const handleEmailSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!email) {
      toast("Please enter your email address", "error");
      return;
    }

    const success = await requestOtp(email);
    if (success) {
      setEmailStep("otp");
      toast("Verification code sent to your email", "success");
    } else if (error) {
      toast(error, "error");
    }
  };

  const handleOtpSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!otpCode || otpCode.length !== 6) {
      toast("Please enter a 6-digit code", "error");
      return;
    }

    const success = await verifyOtp(email, otpCode);
    if (success) {
      toast("Login successful!", "success");
      router.push("/markets");
    } else if (error) {
      toast(error, "error");
    }
  };

  const handleWalletLogin = async () => {
    if (!isConnected || !address) {
      openConnectModal?.();
      return;
    }

    const signFn = async (message: string) => {
      return await signMessageAsync({ message });
    };

    const success = await loginWithWallet(address, signFn);
    if (success) {
      toast("Wallet connected successfully!", "success");
      router.push("/markets");
    } else if (error) {
      toast(error, "error");
    }
  };

  const resetEmailFlow = () => {
    setEmailStep("email");
    setOtpCode("");
    setError(null);
  };

  return (
    <div className="flex min-h-[70vh] items-center justify-center">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <Link href="/" className="inline-flex items-center gap-2">
            <div className="grid h-12 w-12 place-items-center border border-royal/70 bg-royal/10 text-gold font-bold text-xl tracking-tight">
              AP
            </div>
          </Link>
          <h1 className="mt-6 text-3xl font-semibold text-white">Welcome Back</h1>
          <p className="mt-2 text-sm text-mist">
            Sign in to trade on African narratives
          </p>
        </div>

        <div className="border border-white/10 bg-charcoal/60 p-8">
          <div className="mb-6 flex border border-white/10">
            <button
              onClick={() => {
                setMode("email");
                resetEmailFlow();
              }}
              className={`flex-1 py-3 text-xs uppercase tracking-[0.35em] transition-colors ${
                mode === "email"
                  ? "bg-royal/20 text-gold"
                  : "text-mist hover:text-white"
              }`}
            >
              Email
            </button>
            <button
              onClick={() => {
                setMode("wallet");
                setError(null);
              }}
              className={`flex-1 py-3 text-xs uppercase tracking-[0.35em] transition-colors ${
                mode === "wallet"
                  ? "bg-royal/20 text-gold"
                  : "text-mist hover:text-white"
              }`}
            >
              Wallet
            </button>
          </div>

          {mode === "email" && (
            <>
              {emailStep === "email" ? (
                <form onSubmit={handleEmailSubmit} className="space-y-6">
                  <div>
                    <label className="block text-xs uppercase tracking-[0.35em] text-mist">
                      Email Address
                    </label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="you@example.com"
                      className="mt-2 w-full border border-white/10 bg-transparent px-4 py-3 text-white placeholder:text-mist/50 focus:border-royal focus:outline-none"
                      disabled={isLoading}
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full bg-royal py-4 text-xs uppercase tracking-[0.35em] text-white hover:bg-royal/80 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    {isLoading ? "Sending..." : "Send Verification Code"}
                  </button>
                </form>
              ) : (
                <form onSubmit={handleOtpSubmit} className="space-y-6">
                  <div>
                    <div className="flex items-center justify-between">
                      <label className="block text-xs uppercase tracking-[0.35em] text-mist">
                        Verification Code
                      </label>
                      <button
                        type="button"
                        onClick={resetEmailFlow}
                        className="text-xs text-electric hover:text-white"
                      >
                        Change Email
                      </button>
                    </div>
                    <p className="mt-1 text-xs text-mist">
                      Code sent to <span className="text-white">{email}</span>
                    </p>
                    <input
                      type="text"
                      value={otpCode}
                      onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
                      placeholder="123456"
                      className="mt-3 w-full border border-white/10 bg-transparent px-4 py-3 text-white text-center text-2xl tracking-[0.5em] placeholder:text-mist/50 focus:border-royal focus:outline-none"
                      disabled={isLoading}
                      maxLength={6}
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={isLoading || otpCode.length !== 6}
                    className="w-full bg-gold py-4 text-xs uppercase tracking-[0.35em] text-night hover:bg-gold/80 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    {isLoading ? "Verifying..." : "Verify & Sign In"}
                  </button>
                  <button
                    type="button"
                    onClick={() => requestOtp(email)}
                    disabled={isLoading}
                    className="w-full border border-white/10 py-3 text-xs uppercase tracking-[0.35em] text-mist hover:text-white hover:border-white/20 disabled:opacity-50 transition-colors"
                  >
                    Resend Code
                  </button>
                </form>
              )}
            </>
          )}

          {mode === "wallet" && (
            <div className="space-y-6">
              <p className="text-sm text-mist text-center">
                Connect your wallet and sign a message to authenticate securely.
              </p>
              
              {isConnected && address ? (
                <div className="space-y-4">
                  <div className="border border-white/10 bg-white/5 px-4 py-3 text-center">
                    <p className="text-xs uppercase tracking-[0.35em] text-mist">Connected Wallet</p>
                    <p className="mt-1 text-white font-mono">
                      {address.slice(0, 6)}...{address.slice(-4)}
                    </p>
                  </div>
                  <button
                    onClick={handleWalletLogin}
                    disabled={isLoading}
                    className="w-full bg-electric py-4 text-xs uppercase tracking-[0.35em] text-white hover:bg-electric/80 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    {isLoading ? "Signing..." : "Sign In with Wallet"}
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => openConnectModal?.()}
                  className="w-full bg-royal py-4 text-xs uppercase tracking-[0.35em] text-white hover:bg-royal/80 transition-colors"
                >
                  Connect Wallet
                </button>
              )}

              <div className="flex items-center gap-4 text-xs text-mist">
                <div className="flex-1 border-t border-white/10"></div>
                <span>Supported Wallets</span>
                <div className="flex-1 border-t border-white/10"></div>
              </div>
              
              <div className="flex justify-center gap-6 text-xs uppercase tracking-[0.35em] text-mist">
                <span>MetaMask</span>
                <span>WalletConnect</span>
                <span>Coinbase</span>
              </div>
            </div>
          )}
        </div>

        <p className="text-center text-xs text-mist">
          By signing in, you agree to our{" "}
          <Link href="/terms" className="text-electric hover:text-white">
            Terms of Service
          </Link>{" "}
          and{" "}
          <Link href="/privacy" className="text-electric hover:text-white">
            Privacy Policy
          </Link>
        </p>
      </div>
    </div>
  );
}
