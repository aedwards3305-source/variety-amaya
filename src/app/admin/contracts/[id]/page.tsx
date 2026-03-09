"use client";

import { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import { useParams } from "next/navigation";
import type { Contract, CompanySettings } from "@/lib/contract-types";
import { STATUS_CONFIG } from "@/lib/contract-types";

export default function ContractViewPage() {
  const params = useParams();
  const id = params.id as string;

  const [contract, setContract] = useState<Contract | null>(null);
  const [settings, setSettings] = useState<CompanySettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const [generatingPdf, setGeneratingPdf] = useState(false);
  const [error, setError] = useState("");

  const pwd = typeof window !== "undefined" ? sessionStorage.getItem("adminPwd") : null;

  const loadData = useCallback(async (): Promise<void> => {
    if (!pwd) return;
    try {
      // Use cached contract data if available (avoids Vercel Blob propagation delay)
      const cached = sessionStorage.getItem(`contract-cache-${id}`);
      if (cached) sessionStorage.removeItem(`contract-cache-${id}`);

      const sRes = await fetch("/api/admin/company-settings", { headers: { "x-admin-password": pwd } });

      let contractData;
      if (cached) {
        contractData = JSON.parse(cached);
      } else {
        const cRes = await fetch(`/api/admin/contracts/${id}`, { headers: { "x-admin-password": pwd } });
        if (!cRes.ok) throw new Error("Contract not found");
        contractData = await cRes.json();
      }

      const settingsData = await sRes.json();
      setContract(contractData);
      setSettings(settingsData);
      setLoading(false);
    } catch {
      setError("Failed to load contract");
      setLoading(false);
    }
  }, [id, pwd]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const generatePdf = useCallback(async () => {
    if (!contract || !settings || generatingPdf) return;
    setGeneratingPdf(true);
    try {
      const { pdf } = await import("@react-pdf/renderer");
      const { ContractPDF } = await import("@/lib/contract-pdf");
      const logoUrl = window.location.origin + settings.logoPath;
      const blob = await pdf(
        ContractPDF({ contract, settings, logoUrl })
      ).toBlob();
      const url = URL.createObjectURL(blob);
      setPdfUrl(url);
    } catch (err) {
      console.error("PDF generation failed:", err);
      setError("Failed to generate PDF preview");
    } finally {
      setGeneratingPdf(false);
    }
  }, [contract, settings, generatingPdf]);

  useEffect(() => {
    if (contract && settings && !pdfUrl) {
      generatePdf();
    }
  }, [contract, settings, pdfUrl, generatePdf]);

  const downloadPdf = () => {
    if (!pdfUrl || !contract) return;
    const link = document.createElement("a");
    link.href = pdfUrl;
    link.download = `${contract.contractNumber}-${contract.customerName.replace(/\s+/g, "-")}.pdf`;
    link.click();
  };

  const emailContract = () => {
    if (!contract || !settings) return;
    const subject = encodeURIComponent(
      `Service Agreement ${contract.contractNumber} - ${settings.companyName}`
    );
    const body = encodeURIComponent(
      `Dear ${contract.customerName},\n\nPlease find attached the Service Agreement (${contract.contractNumber}) for your project at ${contract.projectAddress}.\n\nContract Amount: $${contract.totalPrice.toFixed(2)}\nDeposit Required: $${contract.depositAmount.toFixed(2)}\n\nPlease review the agreement and let us know if you have any questions. You can reach us at ${settings.phone}.\n\nBest regards,\n${settings.companyName}\n${settings.phone}\n${settings.website}`
    );
    window.open(`mailto:${contract.customerEmail}?subject=${subject}&body=${body}`);
  };

  const fmt = (n: number) =>
    new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(n);
  const fmtDate = (d: string) => {
    if (!d) return "";
    return new Date(d + (d.includes("T") ? "" : "T00:00:00")).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  if (!pwd) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-400 mb-4">Please log in through the admin panel first.</p>
          <Link href="/admin" className="text-[#D4AF37] hover:underline">Go to Admin Login</Link>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <p className="text-gray-500">Loading contract...</p>
      </div>
    );
  }

  if (error || !contract || !settings) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-400 mb-4">{error || "Contract not found"}</p>
          <Link href="/admin/contracts" className="text-[#D4AF37] hover:underline">Back to Contracts</Link>
        </div>
      </div>
    );
  }

  const statusCfg = STATUS_CONFIG[contract.status];

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      {/* Top Bar */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-black border-b border-gray-800 h-16 flex items-center px-4 lg:px-6">
        <div className="flex items-center gap-3">
          <div className="relative w-10 h-10">
            <Image src="/va-logo.png" alt="VA" fill className="object-contain" />
          </div>
          <h1 className="text-lg font-bold">
            <span className="text-[#D4AF37]">Variety Amaya</span> Admin
          </h1>
        </div>
        <nav className="ml-8 flex items-center gap-1">
          <Link href="/admin" className="px-3 py-1.5 rounded-md text-sm text-gray-400 hover:text-white hover:bg-gray-800 transition-colors">
            Media
          </Link>
          <Link href="/admin/contracts" className="px-3 py-1.5 rounded-md text-sm bg-[#D4AF37]/10 text-[#D4AF37] font-medium">
            Contracts
          </Link>
        </nav>
      </header>

      <main className="pt-24 pb-16 max-w-6xl mx-auto px-4 lg:px-6">
        {/* Back */}
        <Link href="/admin/contracts" className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-[#D4AF37] mb-6 transition-colors">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back to Contracts
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* ─── LEFT: Contract Details ─── */}
          <div className="lg:col-span-1 space-y-4">
            {/* Header card */}
            <div className="bg-gray-900 rounded-xl border border-gray-800 p-5">
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-xl font-bold text-[#D4AF37]">{contract.contractNumber}</h2>
                <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${statusCfg.bg} ${statusCfg.text}`}>
                  {statusCfg.label}
                </span>
              </div>
              <p className="text-xs text-gray-500">
                Created {fmtDate(contract.createdAt.split("T")[0])}
              </p>
            </div>

            {/* Customer */}
            <div className="bg-gray-900 rounded-xl border border-gray-800 p-5">
              <h3 className="text-xs text-gray-500 uppercase tracking-wider font-medium mb-3">Customer</h3>
              <p className="font-medium">{contract.customerName}</p>
              <p className="text-sm text-gray-400 mt-1">{contract.customerAddress}</p>
              <p className="text-sm text-gray-400">{contract.customerPhone}</p>
              {contract.customerEmail && <p className="text-sm text-gray-400">{contract.customerEmail}</p>}
            </div>

            {/* Project */}
            <div className="bg-gray-900 rounded-xl border border-gray-800 p-5">
              <h3 className="text-xs text-gray-500 uppercase tracking-wider font-medium mb-3">Project</h3>
              <p className="text-sm text-gray-300 mb-3">{contract.projectAddress}</p>
              <h4 className="text-xs text-gray-500 uppercase tracking-wider font-medium mb-1">Scope</h4>
              <p className="text-sm text-gray-400 whitespace-pre-wrap">{contract.scopeOfWork}</p>
            </div>

            {/* Pricing */}
            <div className="bg-gray-900 rounded-xl border border-gray-800 p-5">
              <h3 className="text-xs text-gray-500 uppercase tracking-wider font-medium mb-3">Pricing</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-400">Total</span>
                  <span className="font-medium">{fmt(contract.totalPrice)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Deposit</span>
                  <span>{fmt(contract.depositAmount)}</span>
                </div>
                <div className="flex justify-between pt-2 border-t border-gray-800">
                  <span className="font-medium">Balance</span>
                  <span className="text-[#D4AF37] font-bold">{fmt(contract.totalPrice - contract.depositAmount)}</span>
                </div>
              </div>
            </div>

            {/* Timeline */}
            <div className="bg-gray-900 rounded-xl border border-gray-800 p-5">
              <h3 className="text-xs text-gray-500 uppercase tracking-wider font-medium mb-3">Timeline</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-400">Start</span>
                  <span>{fmtDate(contract.startDate)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Est. Completion</span>
                  <span>{fmtDate(contract.estimatedCompletionDate)}</span>
                </div>
                {contract.projectDuration && (
                  <div className="flex justify-between">
                    <span className="text-gray-400">Duration</span>
                    <span>{contract.projectDuration}</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* ─── RIGHT: PDF Preview & Actions ─── */}
          <div className="lg:col-span-2">
            {/* Action buttons */}
            <div className="flex flex-wrap gap-3 mb-4">
              {contract.status === "draft" && (
                <Link
                  href={`/admin/contracts/${id}/edit`}
                  className="inline-flex items-center gap-2 bg-[#D4AF37] hover:bg-[#B8960C] text-black font-semibold px-5 py-2.5 rounded-lg text-sm transition-colors"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                  Edit Draft
                </Link>
              )}
              <button
                onClick={downloadPdf}
                disabled={!pdfUrl}
                className="inline-flex items-center gap-2 bg-[#D4AF37] hover:bg-[#B8960C] disabled:bg-gray-700 disabled:text-gray-500 text-black font-semibold px-5 py-2.5 rounded-lg text-sm transition-colors"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                Download PDF
              </button>
              {contract.customerEmail && (
                <button
                  onClick={emailContract}
                  className="inline-flex items-center gap-2 bg-gray-800 hover:bg-gray-700 text-white px-5 py-2.5 rounded-lg text-sm transition-colors border border-gray-700"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  Email to Customer
                </button>
              )}
              <button
                onClick={generatePdf}
                disabled={generatingPdf}
                className="inline-flex items-center gap-2 bg-gray-800 hover:bg-gray-700 text-white px-5 py-2.5 rounded-lg text-sm transition-colors border border-gray-700"
              >
                <svg className={`w-4 h-4 ${generatingPdf ? "animate-spin" : ""}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                {generatingPdf ? "Regenerating..." : "Regenerate PDF"}
              </button>
            </div>

            {/* PDF Preview - Desktop */}
            <div className="hidden lg:block bg-gray-900 rounded-xl border border-gray-800 overflow-hidden" style={{ height: "calc(100vh - 220px)", minHeight: "600px" }}>
              {generatingPdf && !pdfUrl ? (
                <div className="flex items-center justify-center h-full">
                  <div className="text-center">
                    <svg className="w-8 h-8 animate-spin mx-auto text-[#D4AF37] mb-3" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    <p className="text-gray-500 text-sm">Generating PDF preview...</p>
                  </div>
                </div>
              ) : pdfUrl ? (
                <iframe
                  src={pdfUrl}
                  className="w-full h-full"
                  title="Contract PDF Preview"
                />
              ) : (
                <div className="flex items-center justify-center h-full">
                  <p className="text-gray-500 text-sm">PDF preview will appear here</p>
                </div>
              )}
            </div>

            {/* PDF Status - Mobile */}
            <div className="lg:hidden bg-gray-900 rounded-xl border border-gray-800 p-6">
              {generatingPdf && !pdfUrl ? (
                <div className="text-center py-8">
                  <svg className="w-8 h-8 animate-spin mx-auto text-[#D4AF37] mb-3" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  <p className="text-gray-500 text-sm">Generating PDF...</p>
                </div>
              ) : pdfUrl ? (
                <div className="text-center py-4">
                  <svg className="w-12 h-12 mx-auto text-[#D4AF37] mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  <p className="text-white font-medium mb-1">PDF Ready</p>
                  <p className="text-gray-500 text-sm mb-4">Tap Download PDF above to save the contract.</p>
                </div>
              ) : (
                <div className="text-center py-4">
                  <p className="text-gray-500 text-sm">PDF will be generated automatically.</p>
                </div>
              )}
            </div>

            <p className="text-xs text-gray-600 mt-3 text-center">
              Tip: Download the PDF first, then attach it when emailing the customer.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
