"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";

interface FormData {
  customerName: string;
  customerAddress: string;
  customerPhone: string;
  customerEmail: string;
  projectAddress: string;
  scopeOfWork: string;
  totalPrice: string;
  depositAmount: string;
  paymentSchedule: string;
  startDate: string;
  estimatedCompletionDate: string;
  projectDuration: string;
  specialNotes: string;
}

const empty: FormData = {
  customerName: "",
  customerAddress: "",
  customerPhone: "",
  customerEmail: "",
  projectAddress: "",
  scopeOfWork: "",
  totalPrice: "",
  depositAmount: "",
  paymentSchedule: "",
  startDate: "",
  estimatedCompletionDate: "",
  projectDuration: "",
  specialNotes: "",
};

export default function NewContractPage() {
  const router = useRouter();
  const [form, setForm] = useState<FormData>(empty);
  const [errors, setErrors] = useState<string[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [savingDraft, setSavingDraft] = useState(false);
  const [draftSaved, setDraftSaved] = useState(false);
  const pwd = typeof window !== "undefined" ? sessionStorage.getItem("adminPwd") : null;

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

  const set = (field: keyof FormData, value: string) => setForm((p) => ({ ...p, [field]: value }));

  const validate = (): string[] => {
    const e: string[] = [];
    if (!form.customerName.trim()) e.push("Customer name is required");
    if (!form.customerAddress.trim()) e.push("Customer address is required");
    if (!form.customerPhone.trim()) e.push("Customer phone is required");
    if (!form.projectAddress.trim()) e.push("Project address is required");
    if (!form.scopeOfWork.trim()) e.push("Scope of work is required");
    const price = parseFloat(form.totalPrice);
    const deposit = parseFloat(form.depositAmount);
    if (!form.totalPrice || isNaN(price) || price <= 0) e.push("Total price must be greater than $0");
    if (!form.depositAmount || isNaN(deposit) || deposit < 0) e.push("Deposit amount is required");
    if (!isNaN(price) && !isNaN(deposit) && deposit > price) e.push("Deposit cannot exceed total price");
    if (!form.startDate) e.push("Start date is required");
    if (!form.estimatedCompletionDate) e.push("Estimated completion date is required");
    if (form.startDate && form.estimatedCompletionDate && form.startDate > form.estimatedCompletionDate) {
      e.push("Start date must be before estimated completion date");
    }
    return e;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const validationErrors = validate();
    if (validationErrors.length > 0) {
      setErrors(validationErrors);
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }
    setErrors([]);
    setSubmitting(true);

    try {
      const res = await fetch("/api/admin/contracts", {
        method: "POST",
        headers: { "x-admin-password": pwd, "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (!res.ok) throw new Error("Failed to create contract");
      const contract = await res.json();
      router.push(`/admin/contracts/${contract.id}`);
    } catch {
      setErrors(["Failed to save contract. Please try again."]);
      setSubmitting(false);
    }
  };

  const saveDraft = async () => {
    if (!form.customerName.trim()) {
      setErrors(["Customer name is required to save a draft"]);
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }
    setErrors([]);
    setSavingDraft(true);

    try {
      const res = await fetch("/api/admin/contracts", {
        method: "POST",
        headers: { "x-admin-password": pwd!, "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, isDraft: true }),
      });
      if (!res.ok) throw new Error("Failed to save draft");
      setDraftSaved(true);
      setTimeout(() => router.push("/admin/contracts"), 1000);
    } catch {
      setErrors(["Failed to save draft. Please try again."]);
      setSavingDraft(false);
    }
  };

  const inputClass =
    "w-full px-3 py-2.5 bg-gray-800 border border-gray-700 rounded-lg text-sm text-white placeholder-gray-500 focus:ring-1 focus:ring-[#D4AF37] focus:border-transparent outline-none transition-colors";
  const labelClass = "block text-xs text-gray-400 uppercase tracking-wider mb-1.5 font-medium";

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

      <main className="pt-24 pb-16 max-w-3xl mx-auto px-4 lg:px-6">
        {/* Back link */}
        <Link href="/admin/contracts" className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-[#D4AF37] mb-6 transition-colors">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back to Contracts
        </Link>

        <h2 className="text-2xl font-bold mb-2">New Contract</h2>
        <p className="text-sm text-gray-500 mb-8">Fill in the details below to generate a professional service agreement.</p>

        {/* Errors */}
        {errors.length > 0 && (
          <div className="bg-red-900/30 border border-red-800 rounded-xl p-4 mb-6">
            <p className="text-red-400 font-medium text-sm mb-2">Please fix the following:</p>
            <ul className="list-disc list-inside text-red-300 text-sm space-y-1">
              {errors.map((err, i) => (
                <li key={i}>{err}</li>
              ))}
            </ul>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {/* ─── CUSTOMER INFO ─── */}
          <div className="bg-gray-900 rounded-xl border border-gray-800 p-6 mb-6">
            <h3 className="text-sm font-semibold text-[#D4AF37] uppercase tracking-wider mb-5">Customer Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className={labelClass}>Customer Name *</label>
                <input type="text" value={form.customerName} onChange={(e) => set("customerName", e.target.value)} className={inputClass} placeholder="John Doe" />
              </div>
              <div>
                <label className={labelClass}>Customer Email</label>
                <input type="email" value={form.customerEmail} onChange={(e) => set("customerEmail", e.target.value)} className={inputClass} placeholder="john@example.com" />
              </div>
              <div>
                <label className={labelClass}>Customer Address *</label>
                <input type="text" value={form.customerAddress} onChange={(e) => set("customerAddress", e.target.value)} className={inputClass} placeholder="123 Main St, Fairfax, VA 22032" />
              </div>
              <div>
                <label className={labelClass}>Customer Phone *</label>
                <input type="tel" value={form.customerPhone} onChange={(e) => set("customerPhone", e.target.value)} className={inputClass} placeholder="(703) 555-0123" />
              </div>
            </div>
          </div>

          {/* ─── PROJECT DETAILS ─── */}
          <div className="bg-gray-900 rounded-xl border border-gray-800 p-6 mb-6">
            <h3 className="text-sm font-semibold text-[#D4AF37] uppercase tracking-wider mb-5">Project Details</h3>
            <div className="space-y-4">
              <div>
                <label className={labelClass}>Project Address *</label>
                <input type="text" value={form.projectAddress} onChange={(e) => set("projectAddress", e.target.value)} className={inputClass} placeholder="456 Oak Ave, Fairfax, VA 22032" />
              </div>
              <div>
                <label className={labelClass}>Scope of Work *</label>
                <textarea
                  value={form.scopeOfWork}
                  onChange={(e) => set("scopeOfWork", e.target.value)}
                  rows={5}
                  className={`${inputClass} resize-none`}
                  placeholder="Describe the work to be performed in detail. Include materials, areas, and any specific requirements..."
                />
              </div>
            </div>
          </div>

          {/* ─── PRICING ─── */}
          <div className="bg-gray-900 rounded-xl border border-gray-800 p-6 mb-6">
            <h3 className="text-sm font-semibold text-[#D4AF37] uppercase tracking-wider mb-5">Pricing &amp; Payment</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className={labelClass}>Total Price *</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 text-sm">$</span>
                  <input type="number" step="0.01" min="0" value={form.totalPrice} onChange={(e) => set("totalPrice", e.target.value)} className={`${inputClass} pl-7`} placeholder="5000.00" />
                </div>
              </div>
              <div>
                <label className={labelClass}>Deposit Amount *</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 text-sm">$</span>
                  <input type="number" step="0.01" min="0" value={form.depositAmount} onChange={(e) => set("depositAmount", e.target.value)} className={`${inputClass} pl-7`} placeholder="2500.00" />
                </div>
              </div>
            </div>
            {form.totalPrice && form.depositAmount && (
              <div className="mt-3 text-sm text-gray-400">
                Balance due upon completion:{" "}
                <span className="text-[#D4AF37] font-medium">
                  ${(parseFloat(form.totalPrice || "0") - parseFloat(form.depositAmount || "0")).toFixed(2)}
                </span>
              </div>
            )}
            <div className="mt-4">
              <label className={labelClass}>Payment Schedule</label>
              <div className="flex flex-wrap gap-2 mb-2">
                {[
                  "Deposit due upon signing",
                  "50% due at project midpoint",
                  "Balance due upon completion",
                  "Net 30 after completion",
                  "Progress payments as work is completed",
                  "Full payment due upon signing",
                ].map((item) => {
                  const isSelected = form.paymentSchedule.includes(item);
                  return (
                    <button
                      key={item}
                      type="button"
                      onClick={() => {
                        if (isSelected) {
                          const updated = form.paymentSchedule
                            .split("\n")
                            .filter((line) => line.trim() !== item)
                            .join("\n")
                            .trim();
                          set("paymentSchedule", updated);
                        } else {
                          const updated = form.paymentSchedule.trim()
                            ? form.paymentSchedule.trim() + "\n" + item
                            : item;
                          set("paymentSchedule", updated);
                        }
                      }}
                      className={`text-xs px-3 py-1.5 rounded-full border transition-colors ${
                        isSelected
                          ? "bg-[#D4AF37]/20 border-[#D4AF37] text-[#D4AF37]"
                          : "bg-gray-800 border-gray-700 text-gray-400 hover:border-gray-500 hover:text-gray-300"
                      }`}
                    >
                      {isSelected ? "✓ " : "+ "}{item}
                    </button>
                  );
                })}
              </div>
              <textarea
                value={form.paymentSchedule}
                onChange={(e) => set("paymentSchedule", e.target.value)}
                rows={3}
                className={`${inputClass} resize-none`}
                placeholder="Select common terms above or type custom payment schedule..."
              />
            </div>
          </div>

          {/* ─── TIMELINE ─── */}
          <div className="bg-gray-900 rounded-xl border border-gray-800 p-6 mb-6">
            <h3 className="text-sm font-semibold text-[#D4AF37] uppercase tracking-wider mb-5">Timeline</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className={labelClass}>Start Date *</label>
                <input type="date" value={form.startDate} onChange={(e) => set("startDate", e.target.value)} className={inputClass} />
              </div>
              <div>
                <label className={labelClass}>Est. Completion *</label>
                <input type="date" value={form.estimatedCompletionDate} onChange={(e) => set("estimatedCompletionDate", e.target.value)} className={inputClass} />
              </div>
              <div>
                <label className={labelClass}>Duration</label>
                <input type="text" value={form.projectDuration} onChange={(e) => set("projectDuration", e.target.value)} className={inputClass} placeholder="e.g., 2 weeks" />
              </div>
            </div>
          </div>

          {/* ─── ADDITIONAL ─── */}
          <div className="bg-gray-900 rounded-xl border border-gray-800 p-6 mb-8">
            <h3 className="text-sm font-semibold text-[#D4AF37] uppercase tracking-wider mb-5">Additional Notes</h3>
            <textarea
              value={form.specialNotes}
              onChange={(e) => set("specialNotes", e.target.value)}
              rows={4}
              className={`${inputClass} resize-none`}
              placeholder="Any special conditions, notes, or additional terms for this project..."
            />
          </div>

          {/* ─── ACTIONS ─── */}
          {draftSaved && (
            <div className="bg-green-900/30 border border-green-800 rounded-xl p-4 mb-4">
              <p className="text-green-400 text-sm font-medium">Draft saved! Redirecting...</p>
            </div>
          )}
          <div className="flex items-center justify-between">
            <Link href="/admin/contracts" className="text-gray-400 hover:text-white text-sm transition-colors">
              Cancel
            </Link>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={saveDraft}
                disabled={savingDraft || submitting}
                className="inline-flex items-center gap-2 bg-gray-800 hover:bg-gray-700 disabled:bg-gray-700 disabled:text-gray-500 text-white px-6 py-3 rounded-lg text-sm transition-colors border border-gray-700"
              >
                {savingDraft ? (
                  <>
                    <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    Saving...
                  </>
                ) : (
                  <>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
                    </svg>
                    Save Draft
                  </>
                )}
              </button>
              <button
                type="submit"
                disabled={submitting || savingDraft}
                className="inline-flex items-center gap-2 bg-[#D4AF37] hover:bg-[#B8960C] disabled:bg-gray-700 disabled:text-gray-500 text-black font-semibold px-8 py-3 rounded-lg text-sm transition-colors"
              >
                {submitting ? (
                  <>
                    <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    Generating...
                  </>
                ) : (
                  <>
                    Generate Contract
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Disclaimer */}
          <p className="text-center text-xs text-gray-600 mt-8">
            This system generates business contract templates. It does not constitute legal advice.
            Consult a licensed attorney for legal review of your contracts.
          </p>
        </form>
      </main>
    </div>
  );
}
