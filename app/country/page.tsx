"use client";

import Link from "next/link";
import { useCountries } from "@/lib/hooks/useCountries";

export default function CountriesPage() {
  const { countries, isLoading, error } = useCountries();

  const groupedByRegion = countries.reduce((acc, country) => {
    if (!acc[country.region]) {
      acc[country.region] = [];
    }
    acc[country.region].push(country);
    return acc;
  }, {} as Record<string, typeof countries>);

  return (
    <main className="min-h-screen bg-night">
      <section className="relative overflow-hidden border-b border-white/5 py-16">
        <div className="absolute inset-0 opacity-30">
          <div className="absolute inset-0" style={{
            backgroundImage: `repeating-linear-gradient(
              45deg,
              transparent,
              transparent 40px,
              rgba(59, 130, 246, 0.03) 40px,
              rgba(59, 130, 246, 0.03) 80px
            )`
          }} />
        </div>
        <div className="relative mx-auto max-w-6xl px-6 lg:px-12">
          <p className="text-xs uppercase tracking-[0.4em] text-gold mb-3">
            Browse by
          </p>
          <h1 className="text-4xl font-bold text-white md:text-5xl mb-4">
            Countries
          </h1>
          <p className="text-lg text-mist max-w-xl">
            Explore prediction markets across 20 African nations.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6 py-12 lg:px-12">
        {isLoading && (
          <div className="flex items-center justify-center py-20">
            <div className="animate-pulse text-mist">Loading countries...</div>
          </div>
        )}

        {error && (
          <div className="text-center py-20">
            <p className="text-red-400 mb-4">{error}</p>
          </div>
        )}

        {!isLoading && !error && Object.keys(groupedByRegion).length === 0 && (
          <div className="text-center py-20">
            <p className="text-mist">No countries available at this time.</p>
          </div>
        )}

        {!isLoading && !error && Object.keys(groupedByRegion).length > 0 && (
          <div className="space-y-12">
            {Object.entries(groupedByRegion).sort().map(([region, regionCountries]) => (
              <div key={region}>
                <h2 className="text-xs uppercase tracking-[0.3em] text-mist mb-6 border-b border-white/10 pb-2">
                  {region}
                </h2>
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                  {regionCountries.sort((a, b) => a.name.localeCompare(b.name)).map((country) => (
                    <Link
                      key={country.code}
                      href={`/country/${country.slug}`}
                      className="group flex items-center gap-4 p-4 border border-white/10 bg-white/[0.02] hover:bg-white/[0.05] hover:border-royal/50 transition-all"
                    >
                      <span className="text-3xl">{country.flagEmoji}</span>
                      <div>
                        <p className="font-medium text-white group-hover:text-gold transition-colors">
                          {country.name}
                        </p>
                        <p className="text-xs text-mist uppercase tracking-wider">
                          {country.code}
                        </p>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
