export interface Contract {
  id: string;
  contractNumber: string;
  status: ContractStatus;
  createdAt: string;
  updatedAt: string;
  sentAt?: string;

  // Customer
  customerName: string;
  customerAddress: string;
  customerPhone: string;
  customerEmail: string;

  // Project
  projectAddress: string;
  scopeOfWork: string;

  // Pricing
  totalPrice: number;
  depositAmount: number;
  paymentSchedule: string;

  // Timeline
  startDate: string;
  estimatedCompletionDate: string;
  projectDuration: string;

  // Additional
  specialNotes: string;
}

export type ContractStatus = "draft" | "sent" | "signed" | "completed" | "cancelled";

export interface CompanySettings {
  companyName: string;
  address: string;
  phone: string;
  email: string;
  website: string;
  license: string;
  insurance: string;
  tagline: string;
  logoPath: string;
}

export const STATUS_CONFIG: Record<string, { label: string; bg: string; text: string }> = {
  draft: { label: "Draft", bg: "bg-gray-700", text: "text-gray-300" },
  sent: { label: "Sent", bg: "bg-blue-900/50", text: "text-blue-300" },
  signed: { label: "Signed", bg: "bg-green-900/50", text: "text-green-300" },
  completed: { label: "Completed", bg: "bg-purple-900/50", text: "text-purple-300" },
  cancelled: { label: "Cancelled", bg: "bg-red-900/50", text: "text-red-300" },
};

export const FALLBACK_STATUS = { label: "Unknown", bg: "bg-gray-700", text: "text-gray-300" };
