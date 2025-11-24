"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import ConnectWalletButton from "./ConnectWalletButton";

const links = [
  { href: "/markets", label: "Markets" },
  { href: "/country/nigeria", label: "Countries" },
  { href: "/category/politics", label: "Categories" },
  { href: "/wallet", label: "Wallet" },
  { href: "/account", label: "Account" },
];

export default function Navbar() {
  const pathname = usePathname();

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
          {links.map((link) => {
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
          <ConnectWalletButton />
        </div>
      </div>
    </header>
  );
}

