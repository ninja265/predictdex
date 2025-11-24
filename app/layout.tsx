import type { Metadata } from "next";
import "./globals.css";
import { Providers } from "./providers";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export const metadata: Metadata = {
  title: "AfricaPredicts — Pan-African Prediction DEX",
  description:
    "AfricaPredicts is the futuristic prediction market for politics, business, entertainment, and sports across the continent.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-night text-white font-inter">
        <Providers>
          <div className="min-h-screen flex flex-col bg-african-grid bg-pattern">
            <Navbar />
            <main className="flex-1 px-6 py-10 lg:px-16">{children}</main>
            <Footer />
          </div>
        </Providers>
      </body>
    </html>
  );
}
