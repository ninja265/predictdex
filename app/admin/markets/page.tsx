"use client";

import React, { useState, useEffect } from "react";
import { useAdminMarkets } from "@/lib/hooks/useAdmin";
import { useCountries } from "@/lib/hooks/useCountries";
import { toast } from "@/components/Toast";
import type { MarketStatus, MarketCategory, AdminMarketCreate, AdminMarketUpdate, Country, Market } from "@/lib/api/types";

const CATEGORIES: MarketCategory[] = ["Politics", "Civics", "Sports", "Culture"];
const STATUSES: MarketStatus[] = ["draft", "open", "closed", "resolved"];

export default function AdminMarketsPage() {
  const [statusFilter, setStatusFilter] = useState<MarketStatus | undefined>(undefined);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingMarket, setEditingMarket] = useState<string | null>(null);
  const [resolvingMarket, setResolvingMarket] = useState<string | null>(null);

  const { markets, total, isLoading, error, refetch, createMarket, updateMarket, resolveMarket } = useAdminMarkets({
    status: statusFilter,
    limit: 50,
  });

  const handleCreate = async (data: AdminMarketCreate) => {
    try {
      const result = await createMarket(data);
      if (result) {
        toast("Market created successfully", "success");
        setShowCreateModal(false);
      } else {
        toast(error || "Failed to create market", "error");
      }
    } catch (err) {
      toast(err instanceof Error ? err.message : "Failed to create market", "error");
    }
  };

  const handleResolve = async (id: string, outcome: "YES" | "NO") => {
    const success = await resolveMarket(id, outcome, "Resolved via admin dashboard");
    if (success) {
      toast("Market resolved successfully", "success");
      setResolvingMarket(null);
    } else {
      toast("Failed to resolve market", "error");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-white">Markets Management</h1>
          <p className="mt-1 text-mist">Create, edit, and resolve prediction markets</p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="border border-gold bg-gold/10 px-4 py-2 text-sm uppercase tracking-widest text-gold hover:bg-gold/20 transition-colors"
        >
          Create Market
        </button>
      </div>

      <div className="flex items-center gap-3">
        <span className="text-xs uppercase tracking-widest text-mist">Filter:</span>
        <button
          onClick={() => setStatusFilter(undefined)}
          className={`text-xs uppercase tracking-widest px-3 py-1 border ${
            !statusFilter ? "border-gold text-gold" : "border-white/10 text-mist hover:text-white"
          }`}
        >
          All
        </button>
        {STATUSES.map((status) => (
          <button
            key={status}
            onClick={() => setStatusFilter(status)}
            className={`text-xs uppercase tracking-widest px-3 py-1 border ${
              statusFilter === status ? "border-gold text-gold" : "border-white/10 text-mist hover:text-white"
            }`}
          >
            {status}
          </button>
        ))}
      </div>

      {error && (
        <div className="border border-red-500/30 bg-red-900/10 px-4 py-3 text-red-400 text-sm">
          {error}
        </div>
      )}

      {isLoading ? (
        <div className="space-y-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-24 bg-white/5 rounded animate-pulse"></div>
          ))}
        </div>
      ) : !markets || markets.length === 0 ? (
        <div className="text-center py-12 text-mist">
          No markets found
        </div>
      ) : (
        <div className="space-y-4">
          <p className="text-xs text-mist">{total} markets found</p>
          {markets.map((market) => (
            <div
              key={market.id}
              className="border border-white/10 bg-charcoal/60 p-4"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <span className={`text-xs px-2 py-0.5 ${
                      market.status === "open" ? "bg-green-500/20 text-green-400" :
                      market.status === "draft" ? "bg-yellow-500/20 text-yellow-400" :
                      market.status === "closed" ? "bg-orange-500/20 text-orange-400" :
                      "bg-purple-500/20 text-purple-400"
                    }`}>
                      {market.status.toUpperCase()}
                    </span>
                    <span className="text-xs text-mist">{market.category}</span>
                    <span className="text-xs text-mist">{market.currency}</span>
                    {market.countryCode && (
                      <span className="text-xs text-mist">{market.countryName || market.countryCode}</span>
                    )}
                  </div>
                  <h3 className="text-white font-medium">{market.question}</h3>
                  <p className="text-xs text-mist mt-2">
                    Slug: {market.slug} | Volume: {market.symbol}{(market.volume ?? 0).toLocaleString()}
                  </p>
                  <p className="text-xs text-mist mt-1">
                    YES: {((market.yesPrice ?? 0.5) * 100).toFixed(1)}% | NO: {((market.noPrice ?? 0.5) * 100).toFixed(1)}%
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  {market.status === "draft" && (
                    <button
                      onClick={async () => {
                        const success = await updateMarket(market.id, { status: "open" });
                        if (success) {
                          toast("Market launched successfully", "success");
                        } else {
                          toast("Failed to launch market", "error");
                        }
                      }}
                      className="text-xs uppercase tracking-widest px-3 py-1 border border-green-500 text-green-400 hover:bg-green-500/10"
                    >
                      Launch
                    </button>
                  )}
                  {market.status === "closed" && (
                    <button
                      onClick={() => setResolvingMarket(market.id)}
                      className="text-xs uppercase tracking-widest px-3 py-1 border border-gold text-gold hover:bg-gold/10"
                    >
                      Resolve
                    </button>
                  )}
                  <button
                    onClick={() => setEditingMarket(market.id)}
                    className="text-xs uppercase tracking-widest px-3 py-1 border border-white/20 text-mist hover:text-white hover:border-white/40"
                  >
                    Edit
                  </button>
                </div>
              </div>

              {resolvingMarket === market.id && (
                <div className="mt-4 pt-4 border-t border-white/10">
                  <p className="text-sm text-white mb-3">Select winning outcome:</p>
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => handleResolve(market.id, "YES")}
                      className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white text-sm uppercase tracking-widest"
                    >
                      YES Wins
                    </button>
                    <button
                      onClick={() => handleResolve(market.id, "NO")}
                      className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-sm uppercase tracking-widest"
                    >
                      NO Wins
                    </button>
                    <button
                      onClick={() => setResolvingMarket(null)}
                      className="px-4 py-2 border border-white/20 text-mist hover:text-white text-sm uppercase tracking-widest"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {showCreateModal && (
        <CreateMarketModal
          onClose={() => setShowCreateModal(false)}
          onSubmit={handleCreate}
        />
      )}

      {editingMarket && (
        <EditMarketModal
          market={markets?.find(m => m.id === editingMarket) || null}
          onClose={() => setEditingMarket(null)}
          onSubmit={async (data) => {
            const success = await updateMarket(editingMarket, data);
            if (success) {
              toast("Market updated successfully", "success");
              setEditingMarket(null);
            } else {
              toast(error || "Failed to update market", "error");
            }
          }}
        />
      )}
    </div>
  );
}

function CreateMarketModal({
  onClose,
  onSubmit,
}: {
  onClose: () => void;
  onSubmit: (data: AdminMarketCreate) => Promise<void>;
}) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [closesAtLocal, setClosesAtLocal] = useState("");
  const { countries } = useCountries();
  const [formData, setFormData] = useState<Omit<AdminMarketCreate, "closesAt">>({
    slug: "",
    question: "",
    description: "",
    category: "Politics",
    currency: "USDC",
    countryCode: "",
    yesPrice: 0.5,
    noPrice: 0.5,
  });

  // Group countries by region
  const regionGroups = countries.reduce((acc, country) => {
    const region = country.region || "Other";
    if (!acc[region]) acc[region] = [];
    acc[region].push(country);
    return acc;
  }, {} as Record<string, Country[]>);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!closesAtLocal) return;
    
    // Parse datetime-local input and convert to ISO 8601
    const parsedDate = new Date(closesAtLocal);
    if (isNaN(parsedDate.getTime())) {
      toast("Invalid date format. Please select a valid date and time.", "error");
      return;
    }
    
    setIsSubmitting(true);
    
    const payload: AdminMarketCreate = {
      slug: formData.slug,
      question: formData.question,
      description: formData.description,
      category: formData.category,
      currency: formData.currency,
      closesAt: parsedDate.toISOString(),
      countryCode: formData.countryCode || undefined,
    };
    await onSubmit(payload);
    setIsSubmitting(false);
  };

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
      <div className="bg-charcoal border border-white/10 w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-white/10">
          <h2 className="text-lg font-semibold text-white">Create New Market</h2>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-xs uppercase tracking-widest text-mist mb-2">
              Question
            </label>
            <input
              type="text"
              value={formData.question}
              onChange={(e) => setFormData({ ...formData, question: e.target.value })}
              className="w-full bg-white/5 border border-white/10 px-3 py-2 text-white focus:border-gold focus:outline-none"
              placeholder="Will X happen by Y date?"
              required
            />
          </div>
          <div>
            <label className="block text-xs uppercase tracking-widest text-mist mb-2">
              Slug
            </label>
            <input
              type="text"
              value={formData.slug}
              onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
              className="w-full bg-white/5 border border-white/10 px-3 py-2 text-white focus:border-gold focus:outline-none"
              placeholder="market-slug-here"
              required
            />
          </div>
          <div>
            <label className="block text-xs uppercase tracking-widest text-mist mb-2">
              Description
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full bg-white/5 border border-white/10 px-3 py-2 text-white focus:border-gold focus:outline-none h-24"
              placeholder="Detailed resolution criteria..."
              required
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs uppercase tracking-widest text-mist mb-2">
                Category
              </label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value as MarketCategory })}
                className="w-full bg-white/5 border border-white/10 px-3 py-2 text-white focus:border-gold focus:outline-none"
              >
                {CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs uppercase tracking-widest text-mist mb-2">
                Currency
              </label>
              <select
                value={formData.currency}
                onChange={(e) => setFormData({ ...formData, currency: e.target.value as any })}
                className="w-full bg-white/5 border border-white/10 px-3 py-2 text-white focus:border-gold focus:outline-none"
              >
                <option value="ETH">ETH</option>
                <option value="USDC">USDC</option>
                <option value="USDT">USDT</option>
              </select>
            </div>
          </div>
          <div>
            <label className="block text-xs uppercase tracking-widest text-mist mb-2">
              Country <span className="text-mist/60 normal-case">(Optional)</span>
            </label>
            <select
              value={formData.countryCode}
              onChange={(e) => setFormData({ ...formData, countryCode: e.target.value })}
              className="w-full bg-white/5 border border-white/10 px-3 py-2 text-white focus:border-gold focus:outline-none"
            >
              <option value="">— Select Country —</option>
              {Object.entries(regionGroups).map(([region, regionCountries]) => (
                <optgroup key={region} label={region} className="bg-charcoal">
                  {regionCountries.map((country) => (
                    <option key={country.code} value={country.code}>
                      {country.flagEmoji} {country.name}
                    </option>
                  ))}
                </optgroup>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs uppercase tracking-widest text-mist mb-2">
              Closes At
            </label>
            <input
              type="datetime-local"
              value={closesAtLocal}
              onChange={(e) => setClosesAtLocal(e.target.value)}
              className="w-full bg-white/5 border border-white/10 px-3 py-2 text-white focus:border-gold focus:outline-none"
              required
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs uppercase tracking-widest text-mist mb-2">
                Initial YES Price
              </label>
              <input
                type="number"
                step="0.01"
                min="0.01"
                max="0.99"
                value={formData.yesPrice}
                onChange={(e) => setFormData({ ...formData, yesPrice: parseFloat(e.target.value), noPrice: 1 - parseFloat(e.target.value) })}
                className="w-full bg-white/5 border border-white/10 px-3 py-2 text-white focus:border-gold focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs uppercase tracking-widest text-mist mb-2">
                Initial NO Price
              </label>
              <input
                type="number"
                step="0.01"
                min="0.01"
                max="0.99"
                value={formData.noPrice}
                disabled
                className="w-full bg-white/5 border border-white/10 px-3 py-2 text-mist cursor-not-allowed"
              />
            </div>
          </div>
          <div className="flex items-center gap-3 pt-4">
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 bg-gold text-midnight py-2 text-sm uppercase tracking-widest hover:bg-gold/90 disabled:opacity-50"
            >
              {isSubmitting ? "Creating..." : "Create Market"}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-white/20 text-mist hover:text-white text-sm uppercase tracking-widest"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function EditMarketModal({
  market,
  onClose,
  onSubmit,
}: {
  market: Market | null;
  onClose: () => void;
  onSubmit: (data: AdminMarketUpdate) => Promise<void>;
}) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [question, setQuestion] = useState("");
  const [description, setDescription] = useState("");
  const [status, setStatus] = useState<MarketStatus>("draft");
  const [closesAt, setClosesAt] = useState("");
  const [originalClosesAt, setOriginalClosesAt] = useState("");

  // Helper to convert UTC ISO string to local datetime-local format
  const toLocalDatetimeString = (isoString: string) => {
    const date = new Date(isoString);
    const offset = date.getTimezoneOffset();
    const localDate = new Date(date.getTime() - offset * 60 * 1000);
    return localDate.toISOString().slice(0, 16);
  };

  // Re-sync form state when market changes
  useEffect(() => {
    if (market) {
      setQuestion(market.question || "");
      setDescription(market.description || "");
      setStatus(market.status || "draft");
      if (market.closesAt) {
        const localStr = toLocalDatetimeString(market.closesAt);
        setClosesAt(localStr);
        setOriginalClosesAt(localStr);
      } else {
        setClosesAt("");
        setOriginalClosesAt("");
      }
    }
  }, [market?.id]);

  if (!market) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    const payload: AdminMarketUpdate = {};
    if (question !== market.question) payload.question = question;
    if (description !== (market.description || "")) payload.description = description;
    if (status !== market.status) payload.status = status;
    // Only update closesAt if it was actually changed
    if (closesAt && closesAt !== originalClosesAt) {
      // Convert local datetime-local value back to UTC ISO string
      payload.closesAt = new Date(closesAt).toISOString();
    }

    await onSubmit(payload);
    setIsSubmitting(false);
  };

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
      <div className="bg-charcoal border border-white/10 w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-white/10">
          <h2 className="text-lg font-semibold text-white">Edit Market</h2>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-xs uppercase tracking-widest text-mist mb-2">
              Question
            </label>
            <input
              type="text"
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              className="w-full bg-white/5 border border-white/10 px-3 py-2 text-white focus:border-gold focus:outline-none"
              required
            />
          </div>
          <div>
            <label className="block text-xs uppercase tracking-widest text-mist mb-2">
              Description
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full bg-white/5 border border-white/10 px-3 py-2 text-white focus:border-gold focus:outline-none h-24"
            />
          </div>
          <div>
            <label className="block text-xs uppercase tracking-widest text-mist mb-2">
              Status
            </label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as MarketStatus)}
              className="w-full bg-white/5 border border-white/10 px-3 py-2 text-white focus:border-gold focus:outline-none"
            >
              <option value="draft">Draft</option>
              <option value="open">Open</option>
              <option value="closed">Closed</option>
            </select>
          </div>
          <div>
            <label className="block text-xs uppercase tracking-widest text-mist mb-2">
              Closes At
            </label>
            <input
              type="datetime-local"
              value={closesAt}
              onChange={(e) => setClosesAt(e.target.value)}
              className="w-full bg-white/5 border border-white/10 px-3 py-2 text-white focus:border-gold focus:outline-none"
            />
          </div>
          <div className="flex items-center gap-3 pt-4">
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 bg-gold text-midnight py-2 text-sm uppercase tracking-widest hover:bg-gold/90 disabled:opacity-50"
            >
              {isSubmitting ? "Saving..." : "Save Changes"}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-white/20 text-mist hover:text-white text-sm uppercase tracking-widest"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
