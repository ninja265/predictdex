"use client";

import { useState } from "react";
import { apiAuditor } from "@/lib/api/audit";
import type { AuditReport, EndpointTestResult } from "@/lib/api/audit";

export default function AuditPage() {
  const [report, setReport] = useState<AuditReport | null>(null);
  const [isRunning, setIsRunning] = useState(false);
  const [filter, setFilter] = useState<"all" | "success" | "error" | "skipped">("all");

  const runAudit = async () => {
    setIsRunning(true);
    try {
      const result = await apiAuditor.runFullAudit();
      setReport(result);
    } catch (error) {
      console.error("Audit failed:", error);
    } finally {
      setIsRunning(false);
    }
  };

  const filteredResults = report?.results.filter((r) => {
    if (filter === "all") return true;
    return r.status === filter;
  }) || [];

  const getStatusColor = (status: EndpointTestResult["status"]) => {
    switch (status) {
      case "success":
        return "text-green-400 bg-green-500/10 border-green-500/30";
      case "error":
        return "text-red-400 bg-red-500/10 border-red-500/30";
      case "skipped":
        return "text-yellow-400 bg-yellow-500/10 border-yellow-500/30";
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-white">API Endpoint Audit</h1>
          <p className="mt-1 text-mist">Test all API endpoints for availability and performance</p>
        </div>
        <button
          onClick={runAudit}
          disabled={isRunning}
          className="border border-gold bg-gold/10 px-6 py-3 text-sm uppercase tracking-widest text-gold hover:bg-gold/20 transition-colors disabled:opacity-50"
        >
          {isRunning ? "Running Audit..." : "Run Full Audit"}
        </button>
      </div>

      {report && (
        <>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
            <div className="border border-white/10 bg-white/5 px-4 py-3">
              <p className="text-xs uppercase tracking-widest text-mist">Total Endpoints</p>
              <p className="text-2xl font-semibold text-white mt-1">{report.totalEndpoints}</p>
            </div>
            <div className="border border-green-500/30 bg-green-500/10 px-4 py-3">
              <p className="text-xs uppercase tracking-widest text-mist">Successful</p>
              <p className="text-2xl font-semibold text-green-400 mt-1">{report.successful}</p>
            </div>
            <div className="border border-red-500/30 bg-red-500/10 px-4 py-3">
              <p className="text-xs uppercase tracking-widest text-mist">Failed</p>
              <p className="text-2xl font-semibold text-red-400 mt-1">{report.failed}</p>
            </div>
            <div className="border border-yellow-500/30 bg-yellow-500/10 px-4 py-3">
              <p className="text-xs uppercase tracking-widest text-mist">Skipped</p>
              <p className="text-2xl font-semibold text-yellow-400 mt-1">{report.skipped}</p>
            </div>
            <div className="border border-white/10 bg-white/5 px-4 py-3">
              <p className="text-xs uppercase tracking-widest text-mist">Auth Status</p>
              <p className="text-sm text-white mt-2">
                {report.isAuthenticated ? (
                  <span className="text-green-400">{report.isAdmin ? "Admin" : "User"}</span>
                ) : (
                  <span className="text-mist">Not logged in</span>
                )}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-xs uppercase tracking-widest text-mist">Filter:</span>
            {(["all", "success", "error", "skipped"] as const).map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`text-xs uppercase tracking-widest px-3 py-1 border ${
                  filter === f ? "border-gold text-gold" : "border-white/10 text-mist hover:text-white"
                }`}
              >
                {f}
              </button>
            ))}
          </div>

          <div className="border border-white/10 bg-charcoal/60">
            <div className="p-4 border-b border-white/10">
              <p className="text-xs uppercase tracking-widest text-mist">
                {filteredResults.length} Results | Audit Time: {report.timestamp}
              </p>
            </div>
            <div className="divide-y divide-white/5">
              {filteredResults.map((result, index) => (
                <div
                  key={index}
                  className={`flex items-center justify-between px-4 py-3 ${
                    result.status === "error" ? "bg-red-900/5" : ""
                  }`}
                >
                  <div className="flex items-center gap-4">
                    <span
                      className={`text-xs px-2 py-0.5 border ${getStatusColor(result.status)}`}
                    >
                      {result.status.toUpperCase()}
                    </span>
                    <span className="text-xs text-mist font-mono">{result.method}</span>
                    <span className="text-sm text-white font-mono">{result.endpoint}</span>
                  </div>
                  <div className="flex items-center gap-4">
                    {result.status !== "skipped" && (
                      <span className="text-xs text-mist">{result.responseTime}ms</span>
                    )}
                    {result.status === "error" && (
                      <span className="text-xs text-red-400 max-w-xs truncate">{result.message}</span>
                    )}
                    {result.status === "skipped" && (
                      <span className="text-xs text-yellow-400">{result.message}</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </>
      )}

      {!report && !isRunning && (
        <div className="text-center py-16 border border-white/10 bg-charcoal/60">
          <p className="text-mist">Click "Run Full Audit" to test all API endpoints</p>
          <p className="text-xs text-mist mt-2">
            This will test public, authenticated, and admin endpoints based on your login status
          </p>
        </div>
      )}

      {isRunning && (
        <div className="text-center py-16 border border-white/10 bg-charcoal/60">
          <div className="w-8 h-8 border-2 border-gold border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="mt-4 text-mist">Running audit...</p>
        </div>
      )}
    </div>
  );
}
