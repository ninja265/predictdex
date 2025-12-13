"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuthStore } from "@/lib/stores/useAuthStore";
import { useEffect } from "react";

const links = [
  { href: "/markets", label: "Markets" },
  { href: "/country", label: "Countries" },
  { href: "/category/politics", label: "Categories" },
  { href: "/wallet", label: "Wallet", protected: true },
  { href: "/account", label: "Account", protected: true },
];

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, isAuthenticated, logout, checkAuth } = useAuthStore();

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  const handleLogout = async () => {
    await logout();
    router.push("/");
  };

  const visibleLinks = links.filter(
    (link) => !link.protected || isAuthenticated
  );

  return (
    <header className="sticky top-0 z-50 bg-night/95 backdrop-blur border-b border-white/5">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-5 lg:px-12">
        <Link href="/" className="flex items-center gap-2">
          <div className="grid h-10 w-10 place-items-center border border-royal/70 bg-royal/10 text-gold font-bold text-lg tracking-tight">
            AP
          </div>
          <div>
            <p className="text-sm uppercase tracking-[0.4em] text-mist">Africa</p>
            <p className="text-lg font-semibold text-white">Predicts</p>
          </div>
        </Link>

        <nav className="hidden items-center gap-6 text-sm uppercase tracking-[0.25em] lg:flex">
          {visibleLinks.map((link) => {
            const isActive = pathname.startsWith(link.href);
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`px-2 py-1 ${
                  isActive ? "text-gold" : "text-mist hover:text-white"
                } transition-colors`}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>

        <div className="flex items-center gap-4">
          {isAuthenticated ? (
            <div className="flex items-center gap-4">
              {user?.role === "admin" && (
                <Link
                  href="/admin"
                  className="uppercase tracking-widest text-[11px] font-semibold px-3 py-1.5 border border-gold/50 bg-gold/10 text-gold hover:bg-gold/20 transition-colors"
                >
                  Admin
                </Link>
              )}
              <span className="text-xs text-mist uppercase tracking-widest">
                {user?.email || user?.walletAddress?.slice(0, 8) + "..."}
              </span>
              <button
                onClick={handleLogout}
                className="uppercase tracking-widest text-[11px] font-semibold px-4 py-2 border border-white/20 bg-white/5 hover:bg-red-500/20 hover:border-red-500/50 transition-colors text-mist hover:text-white"
              >
                Logout
              </button>
            </div>
          ) : (
            <Link
              href="/login"
              className="uppercase tracking-widest text-[11px] font-semibold px-4 py-2 border border-royal/50 bg-royal/10 hover:bg-royal/20 transition-colors text-gold"
            >
              Sign In
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
