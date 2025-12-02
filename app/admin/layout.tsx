"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuthStore } from "@/lib/stores/useAuthStore";

const adminNavItems = [
  { href: "/admin", label: "Overview" },
  { href: "/admin/markets", label: "Markets" },
  { href: "/admin/settlement", label: "Settlement" },
  { href: "/admin/crypto", label: "Crypto" },
  { href: "/admin/audit", label: "Audit" },
];

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const { isAuthenticated, user, isLoading, checkAuth } = useAuthStore();
  const [authChecked, setAuthChecked] = useState(false);

  useEffect(() => {
    const verifyAuth = async () => {
      await checkAuth();
      setAuthChecked(true);
    };
    verifyAuth();
  }, [checkAuth]);

  useEffect(() => {
    if (authChecked && !isLoading) {
      if (!isAuthenticated) {
        router.replace("/login");
      } else if (user?.role !== "admin") {
        router.replace("/");
      }
    }
  }, [authChecked, isAuthenticated, user, isLoading, router]);

  if (!authChecked || isLoading) {
    return (
      <div className="min-h-screen bg-midnight flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-gold border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="mt-4 text-mist text-sm">Verifying access...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  if (user?.role !== "admin") {
    return (
      <div className="min-h-screen bg-midnight flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-400 text-lg">Access Denied</p>
          <p className="mt-2 text-mist">You do not have permission to access this area.</p>
          <Link
            href="/"
            className="mt-4 inline-block text-gold hover:text-white text-sm uppercase tracking-widest"
          >
            Return Home
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-midnight">
      <div className="border-b border-white/10 bg-charcoal/60">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-6">
              <Link href="/admin" className="text-gold font-semibold text-lg">
                Admin Panel
              </Link>
              <nav className="flex items-center gap-4">
                {adminNavItems.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className="text-xs uppercase tracking-[0.35em] text-mist hover:text-white transition-colors"
                  >
                    {item.label}
                  </Link>
                ))}
              </nav>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-xs text-mist">
                Logged in as <span className="text-gold">{user?.email || user?.walletAddress?.slice(0, 8)}</span>
              </span>
              <Link
                href="/"
                className="text-xs uppercase tracking-widest text-mist hover:text-white"
              >
                Exit Admin
              </Link>
            </div>
          </div>
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-4 py-8">
        {children}
      </main>
    </div>
  );
}
