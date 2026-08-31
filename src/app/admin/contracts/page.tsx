"use client";

import { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import type { Contract, ContractStatus, CompanySettings } from "@/lib/contract-types";
import { STATUS_CONFIG, FALLBACK_STATUS } from "@/lib/contract-types";
import { apiErrorMessage } from "@/lib/api-error";

export default function ContractsDashboard() {
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [settings, setSettings] = useState<CompanySettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [authed, setAuthed] = useState(false);
  const [filter, setFilter] = useState<ContractStatus | "all">("all");
  const [search, setSearch] = useState("");
  const [loadError, setLoadError] = useState("");
  const [showSettings, setShowSettings] = useState(false);
  const [editSettings, setEditSettings] = useState<CompanySettings | null>(null);
  const [savingSettings, setSavingSettings] = useState(false);

  const pwd = typeof window !== "undefined" ? sessionStorage.getItem("adminPwd") : null;

  const headers = useCallback(
    () => ({ "x-admin-password": pwd || "", "Content-Type": "application/json" }),
    [pwd]
  );

  useEffect(() => {
    if (!pwd) return;
    setAuthed(true);
    (async () => {
      try {
        const [cRes, sRes] = await Promise.all([
          fetch("/api/admin/contracts", { headers: { "x-admin-password": pwd } }),
          fetch("/api/admin/company-settings", { headers: { "x-admin-password": pwd } }),
        ]);
        // Without this an API failure renders as "No contracts yet", which looks
        // identical to an account that genuinely has none.
        if (!cRes.ok) throw new Error(await apiErrorMessage(cRes, "Could not load contracts"));
        const c = await cRes.json();
        setContracts(Array.isArray(c) ? c : []);
        setSettings(await sRes.json());
        setLoadError("");
      } catch (err) {
        setLoadError(err instanceof Error ? err.message : "Could not load contracts");
      } finally {
        setLoading(false);
      }
    })();
  }, [pwd]);

  const deleteContract = async (id: string) => {
    if (!confirm("Delete this contract? This cannot be undone.")) return;
    await fetch(`/api/admin/contracts/${id}`, { method: "DELETE", headers: headers() });
    setContracts((prev) => prev.filter((c) => c.id !== id));
  };

  const updateStatus = async (id: string, status: ContractStatus) => {
    const res = await fetch(`/api/admin/contracts/${id}`, {
      method: "PUT",
      headers: headers(),
      body: JSON.stringify({ status }),
    });
    if (res.ok) {
      const updated = await res.json();
      setContracts((prev) => prev.map((c) => (c.id === id ? updated : c)));
    }
  };

  const saveSettings = async () => {
    if (!editSettings) return;
    setSavingSettings(true);
    await fetch("/api/admin/company-settings", {
      method: "PUT",
      headers: headers(),
      body: JSON.stringify(editSettings),
    });
    setSettings(editSettings);
    setShowSettings(false);
    setSavingSettings(false);
  };

  const filtered = contracts
    .filter((c) => filter === "all" || c.status === filter)
    .filter(
      (c) =>
        c.customerName.toLowerCase().includes(search.toLowerCase()) ||
        c.contractNumber.toLowerCase().includes(search.toLowerCase()) ||
        c.projectAddress.toLowerCase().includes(search.toLowerCase())
    )
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  const totalValue = contracts.reduce((sum, c) => sum + Number(c.totalPrice), 0);
  const draftCount = contracts.filter((c) => c.status === "draft").length;
  const sentCount = contracts.filter((c) => c.status === "sent").length;
  const signedCount = contracts.filter((c) => c.status === "signed").length;

  if (!authed) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-400 mb-4">Please log in through the admin panel first.</p>
          <Link href="/admin" className="text-[#D4AF37] hover:underline">
            Go to Admin Login
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      {/* Top Bar */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-black border-b border-gray-800 h-16 flex items-center px-4 lg:px-6">
        <div className="flex items-center gap-3 min-w-0">
          <div className="relative w-10 h-10 shrink-0">
            <Image src="/va-logo.png" alt="VA" fill className="object-contain" />
          </div>
          <h1 className="text-lg font-bold hidden sm:block">
            <span className="text-[#D4AF37]">Variety Amaya</span> Admin
          </h1>
        </div>
        <nav className="ml-4 sm:ml-8 flex items-center gap-1">
          <Link href="/admin" className="px-3 py-1.5 rounded-md text-sm text-gray-400 hover:text-white hover:bg-gray-800 transition-colors">
            Media
          </Link>
          <span className="px-3 py-1.5 rounded-md text-sm bg-[#D4AF37]/10 text-[#D4AF37] font-medium">
            Contracts
          </span>
        </nav>
        <div className="ml-auto flex items-center gap-2 sm:gap-3">
          <button
            onClick={() => { setEditSettings(settings ? { ...settings } : null); setShowSettings(true); }}
            className="text-gray-400 hover:text-white text-sm transition-colors"
          >
            <span className="hidden sm:inline">Settings</span>
            <svg className="w-5 h-5 sm:hidden" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.066 2.573c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.573 1.066c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.066-2.573c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </button>
          <button
            onClick={() => { sessionStorage.removeItem("adminPwd"); window.location.href = "/admin"; }}
            className="text-gray-400 hover:text-white text-sm transition-colors"
          >
            <span className="hidden sm:inline">Log Out</span>
            <svg className="w-5 h-5 sm:hidden" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
          </button>
        </div>
      </header>

      <main className="pt-24 pb-12 max-w-6xl mx-auto px-4 lg:px-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          <div>
            <h2 className="text-2xl font-bold">Contracts</h2>
            <p className="text-sm text-gray-500 mt-1">Generate and manage customer contracts</p>
          </div>
          <Link
            href="/admin/contracts/new"
            className="inline-flex items-center gap-2 bg-[#D4AF37] hover:bg-[#B8960C] text-black font-semibold px-5 py-2.5 rounded-lg transition-colors text-sm"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            New Contract
          </Link>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {[
            { label: "Total Contracts", value: contracts.length, color: "text-white" },
            { label: "Drafts", value: draftCount, color: "text-gray-400" },
            { label: "Sent / Signed", value: sentCount + signedCount, color: "text-blue-400" },
            { label: "Total Value", value: new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(totalValue), color: "text-[#D4AF37]" },
          ].map((stat) => (
            <div key={stat.label} className="bg-gray-900 rounded-xl p-4 border border-gray-800">
              <p className="text-xs text-gray-500 uppercase tracking-wider">{stat.label}</p>
              <p className={`text-2xl font-bold mt-1 ${stat.color}`}>{stat.value}</p>
            </div>
          ))}
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          <div className="flex gap-1 bg-gray-900 rounded-lg p-1 overflow-x-auto">
            {(["all", "draft", "sent", "signed", "completed", "cancelled"] as const).map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors whitespace-nowrap ${
                  filter === f ? "bg-[#D4AF37] text-black" : "text-gray-400 hover:text-white"
                }`}
              >
                {f === "all" ? "All" : STATUS_CONFIG[f].label}
              </button>
            ))}
          </div>
          <input
            type="text"
            placeholder="Search customer, contract #, or address..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="flex-1 px-3 py-2 bg-gray-900 border border-gray-800 rounded-lg text-sm text-white placeholder-gray-500 focus:ring-1 focus:ring-[#D4AF37] focus:border-transparent outline-none"
          />
        </div>

        {loadError && (
          <div className="mb-6 bg-red-950/50 border border-red-900 rounded-lg px-4 py-3">
            <p className="text-sm text-red-300">{loadError}</p>
          </div>
        )}

        {/* Table */}
        {loading ? (
          <div className="text-center py-20 text-gray-500">Loading contracts...</div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-20">
            <svg className="w-16 h-16 mx-auto text-gray-700 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <p className="text-gray-500 text-lg">
              {contracts.length === 0 ? "No contracts yet" : "No contracts match your filters"}
            </p>
            {contracts.length === 0 && (
              <Link href="/admin/contracts/new" className="inline-block mt-4 text-[#D4AF37] hover:underline text-sm">
                Create your first contract
              </Link>
            )}
          </div>
        ) : (
          <>
          {/* Mobile card layout */}
          <div className="space-y-3 md:hidden">
            {filtered.map((c) => {
              const statusCfg = STATUS_CONFIG[c.status] || FALLBACK_STATUS;
              return (
                <div key={c.id} className="bg-gray-900 rounded-xl border border-gray-800 p-4">
                  <Link href={`/admin/contracts/${c.id}`} className="block active:opacity-80 transition-opacity">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[#D4AF37] font-medium text-sm">{c.contractNumber}</span>
                      <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${statusCfg.bg} ${statusCfg.text}`}>
                        {statusCfg.label}
                      </span>
                    </div>
                    <p className="text-white font-medium">{c.customerName}</p>
                    <p className="text-gray-400 text-sm truncate mt-0.5">{c.projectAddress}</p>
                    <div className="flex items-center justify-between mt-3">
                      <span className="text-[#D4AF37] font-bold">
                        {new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(Number(c.totalPrice))}
                      </span>
                      <span className="text-gray-500 text-xs">{new Date(c.createdAt).toLocaleDateString()}</span>
                    </div>
                  </Link>
                  <div className="flex items-center justify-end gap-2 mt-3 pt-3 border-t border-gray-800">
                    <Link
                      href={`/admin/contracts/${c.id}`}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs text-gray-400 hover:text-white bg-gray-800 rounded-lg transition-colors"
                    >
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                      View
                    </Link>
                    <Link
                      href={`/admin/contracts/${c.id}/edit`}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs text-gray-400 hover:text-white bg-gray-800 rounded-lg transition-colors"
                    >
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                      Edit
                    </Link>
                    <button
                      onClick={() => deleteContract(c.id)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs text-red-400 hover:text-red-300 bg-gray-800 rounded-lg transition-colors"
                    >
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                      Delete
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Desktop table layout */}
          <div className="bg-gray-900 rounded-xl border border-gray-800 overflow-hidden hidden md:block">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-800">
                    <th className="text-left px-4 py-3 text-xs text-gray-500 uppercase tracking-wider font-medium">Contract</th>
                    <th className="text-left px-4 py-3 text-xs text-gray-500 uppercase tracking-wider font-medium">Customer</th>
                    <th className="text-left px-4 py-3 text-xs text-gray-500 uppercase tracking-wider font-medium">Project</th>
                    <th className="text-right px-4 py-3 text-xs text-gray-500 uppercase tracking-wider font-medium">Amount</th>
                    <th className="text-center px-4 py-3 text-xs text-gray-500 uppercase tracking-wider font-medium">Status</th>
                    <th className="text-right px-4 py-3 text-xs text-gray-500 uppercase tracking-wider font-medium">Date</th>
                    <th className="text-right px-4 py-3 text-xs text-gray-500 uppercase tracking-wider font-medium w-20"></th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((c) => {
                    const statusCfg = STATUS_CONFIG[c.status] || FALLBACK_STATUS;
                    return (
                      <tr key={c.id} className="border-b border-gray-800/50 hover:bg-gray-800/30 transition-colors">
                        <td className="px-4 py-3">
                          <Link href={`/admin/contracts/${c.id}`} className="text-[#D4AF37] hover:underline font-medium">
                            {c.contractNumber}
                          </Link>
                        </td>
                        <td className="px-4 py-3 text-gray-300">{c.customerName}</td>
                        <td className="px-4 py-3 text-gray-400 truncate max-w-[200px]">{c.projectAddress}</td>
                        <td className="px-4 py-3 text-right font-medium">
                          {new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(c.totalPrice)}
                        </td>
                        <td className="px-4 py-3 text-center">
                          <select
                            value={c.status}
                            onChange={(e) => updateStatus(c.id, e.target.value as ContractStatus)}
                            className={`text-xs font-medium px-2 py-1 rounded-full border-0 cursor-pointer ${statusCfg.bg} ${statusCfg.text} bg-opacity-50 appearance-none text-center`}
                          >
                            {Object.entries(STATUS_CONFIG).map(([val, cfg]) => (
                              <option key={val} value={val}>{cfg.label}</option>
                            ))}
                          </select>
                        </td>
                        <td className="px-4 py-3 text-right text-gray-500 text-xs">
                          {new Date(c.createdAt).toLocaleDateString()}
                        </td>
                        <td className="px-4 py-3 text-right">
                          <div className="flex items-center justify-end gap-1">
                            <Link
                              href={`/admin/contracts/${c.id}`}
                              className="p-1.5 text-gray-500 hover:text-white rounded transition-colors"
                              title="View"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                              </svg>
                            </Link>
                            <button
                              onClick={() => deleteContract(c.id)}
                              className="p-1.5 text-gray-500 hover:text-red-400 rounded transition-colors"
                              title="Delete"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                              </svg>
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
          </>
        )}
      </main>

      {/* Company Settings Modal */}
      {showSettings && editSettings && (
        <div className="fixed inset-0 z-[60] bg-black/70 flex items-center justify-center p-4">
          <div className="bg-gray-900 rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto border border-gray-800">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-bold">Company / Letterhead Settings</h3>
                <button onClick={() => setShowSettings(false)} className="text-gray-500 hover:text-white">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              <div className="space-y-4">
                {([
                  ["companyName", "Company Name"],
                  ["address", "Address"],
                  ["phone", "Phone"],
                  ["email", "Email"],
                  ["website", "Website"],
                  ["license", "License Number"],
                  ["insurance", "Insurance / Credentials"],
                  ["tagline", "Tagline"],
                  ["logoPath", "Logo Path (e.g. /logo.png)"],
                ] as const).map(([key, label]) => (
                  <div key={key}>
                    <label className="block text-xs text-gray-500 uppercase tracking-wider mb-1">{label}</label>
                    <input
                      type="text"
                      value={editSettings[key]}
                      onChange={(e) => setEditSettings({ ...editSettings, [key]: e.target.value })}
                      className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-sm text-white focus:ring-1 focus:ring-[#D4AF37] focus:border-transparent outline-none"
                    />
                  </div>
                ))}
              </div>
              <div className="flex gap-3 mt-6">
                <button
                  onClick={saveSettings}
                  disabled={savingSettings}
                  className="flex-1 py-2.5 bg-[#D4AF37] hover:bg-[#B8960C] text-black font-semibold rounded-lg text-sm transition-colors"
                >
                  {savingSettings ? "Saving..." : "Save Settings"}
                </button>
                <button
                  onClick={() => setShowSettings(false)}
                  className="px-6 py-2.5 bg-gray-800 hover:bg-gray-700 rounded-lg text-gray-300 text-sm transition-colors"
                >
                  Cancel
                </button>
              </div>
              <p className="text-xs text-gray-600 mt-4">
                These settings appear on your contract letterhead and footer.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
