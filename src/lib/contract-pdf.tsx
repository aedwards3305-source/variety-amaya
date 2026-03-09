"use client";

import {
  Document,
  Page,
  View,
  Text,
  Image,
  StyleSheet,
} from "@react-pdf/renderer";
import type { Contract, CompanySettings } from "./contract-types";

const GOLD = "#B8960C";
const DARK = "#1a1a1a";
const GRAY = "#555555";
const BORDER = "#cccccc";

function fmt(amount: number): string {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(amount);
}

function fmtDate(dateStr: string): string {
  if (!dateStr) return "";
  const d = new Date(dateStr + "T00:00:00");
  return d.toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });
}

const s = StyleSheet.create({
  page: {
    paddingTop: 30,
    paddingBottom: 65,
    paddingHorizontal: 50,
    fontFamily: "Helvetica",
    fontSize: 10,
    color: DARK,
    lineHeight: 1.6,
  },
  // Header
  headerRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 5 },
  logo: { width: 60, height: 60 },
  companyInfo: { textAlign: "right" },
  companyName: { fontSize: 16, fontFamily: "Helvetica-Bold", color: DARK },
  companyDetail: { fontSize: 8, color: GRAY },
  headerLine: { height: 3, backgroundColor: GOLD, marginVertical: 10 },
  // Title
  title: { fontSize: 18, fontFamily: "Helvetica-Bold", textAlign: "center", marginVertical: 10, color: DARK },
  meta: { flexDirection: "row", justifyContent: "space-between", marginBottom: 20, fontSize: 9, color: GRAY },
  // Parties
  partiesRow: { flexDirection: "row", marginBottom: 15, gap: 8 },
  partyBox: { flex: 1, padding: 12, borderWidth: 1, borderColor: BORDER, borderRadius: 4 },
  partyTitle: { fontSize: 9, fontFamily: "Helvetica-Bold", color: GOLD, marginBottom: 6, textTransform: "uppercase", letterSpacing: 1 },
  partyText: { fontSize: 10, marginBottom: 2 },
  // Project location
  locationBox: { padding: 12, backgroundColor: "#fafaf0", borderLeftWidth: 3, borderLeftColor: GOLD, marginBottom: 12 },
  locationLabel: { fontSize: 8, color: GRAY, textTransform: "uppercase", marginBottom: 2 },
  locationValue: { fontSize: 11, fontFamily: "Helvetica-Bold" },
  // Sections
  sectionTitle: { fontSize: 11, fontFamily: "Helvetica-Bold", color: DARK, marginTop: 14, marginBottom: 6, paddingBottom: 3, borderBottomWidth: 1, borderBottomColor: GOLD },
  body: { fontSize: 10, lineHeight: 1.6, marginBottom: 4 },
  clause: { fontSize: 9, lineHeight: 1.5, marginBottom: 4, color: "#444444" },
  // Pricing
  priceRow: { flexDirection: "row", justifyContent: "space-between", paddingVertical: 5, borderBottomWidth: 1, borderBottomColor: "#eeeeee" },
  priceLabel: { fontSize: 10 },
  priceValue: { fontSize: 10, fontFamily: "Helvetica-Bold" },
  totalRow: { flexDirection: "row", justifyContent: "space-between", paddingVertical: 7, borderTopWidth: 2, borderTopColor: DARK, marginTop: 4 },
  totalLabel: { fontSize: 12, fontFamily: "Helvetica-Bold" },
  totalValue: { fontSize: 12, fontFamily: "Helvetica-Bold", color: GOLD },
  // Timeline
  timelineGrid: { flexDirection: "row", flexWrap: "wrap", marginBottom: 8 },
  timelineItem: { width: "33%", paddingVertical: 6 },
  timelineLabel: { fontSize: 8, color: GRAY, textTransform: "uppercase", marginBottom: 2 },
  timelineValue: { fontSize: 10, fontFamily: "Helvetica-Bold" },
  // Notes
  notesBox: { padding: 12, backgroundColor: "#fafafa", borderWidth: 1, borderColor: BORDER, borderRadius: 4, marginTop: 4 },
  // Signatures
  sigSection: { marginTop: 25, flexDirection: "row", justifyContent: "space-between" },
  sigBox: { width: "45%" },
  sigLine: { borderBottomWidth: 1, borderBottomColor: DARK, marginBottom: 4, marginTop: 40 },
  sigLabel: { fontSize: 9, color: GRAY },
  dateLine: { borderBottomWidth: 1, borderBottomColor: DARK, marginBottom: 4, marginTop: 20 },
  sigHeader: { fontSize: 9, fontFamily: "Helvetica-Bold", marginBottom: 2 },
  // Footer
  footer: { position: "absolute", bottom: 25, left: 50, right: 50, borderTopWidth: 1, borderTopColor: BORDER, paddingTop: 6, flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  footerText: { fontSize: 7, color: GRAY },
  disclaimer: { fontSize: 7, color: "#999999", fontStyle: "italic" },
  // Agreement text
  agreementText: { fontSize: 10, lineHeight: 1.6, marginTop: 14 },
  boldLabel: { fontSize: 9, fontFamily: "Helvetica-Bold", marginTop: 6, marginBottom: 2 },
});

interface Props {
  contract: Contract;
  settings: CompanySettings;
  logoUrl?: string;
}

export function ContractPDF({ contract, settings, logoUrl }: Props) {
  const balance = contract.totalPrice - contract.depositAmount;
  const createdDate = contract.createdAt ? contract.createdAt.split("T")[0] : "";

  return (
    <Document>
      <Page size="LETTER" style={s.page}>
        {/* ─── LETTERHEAD ─── */}
        <View style={s.headerRow}>
          {logoUrl && <Image src={logoUrl} style={s.logo} />}
          <View style={s.companyInfo}>
            <Text style={s.companyName}>{settings.companyName}</Text>
            <Text style={s.companyDetail}>{settings.address}</Text>
            <Text style={s.companyDetail}>{settings.phone}</Text>
            {settings.email ? <Text style={s.companyDetail}>{settings.email}</Text> : null}
            <Text style={s.companyDetail}>{settings.website}</Text>
            {settings.insurance ? <Text style={s.companyDetail}>{settings.insurance}</Text> : null}
            {settings.license ? <Text style={s.companyDetail}>{"License: " + settings.license}</Text> : null}
          </View>
        </View>
        <View style={s.headerLine} />

        {/* ─── TITLE ─── */}
        <Text style={s.title}>SERVICE AGREEMENT</Text>
        <View style={s.meta}>
          <Text>{"Contract #: " + contract.contractNumber}</Text>
          <Text>{"Date: " + fmtDate(createdDate)}</Text>
        </View>

        {/* ─── PARTIES ─── */}
        <View style={s.partiesRow}>
          <View style={s.partyBox}>
            <Text style={s.partyTitle}>Contractor</Text>
            <Text style={s.partyText}>{settings.companyName}</Text>
            <Text style={s.partyText}>{settings.address}</Text>
            <Text style={s.partyText}>{settings.phone}</Text>
          </View>
          <View style={s.partyBox}>
            <Text style={s.partyTitle}>Customer</Text>
            <Text style={s.partyText}>{contract.customerName}</Text>
            <Text style={s.partyText}>{contract.customerAddress}</Text>
            <Text style={s.partyText}>{contract.customerPhone}</Text>
            {contract.customerEmail ? <Text style={s.partyText}>{contract.customerEmail}</Text> : null}
          </View>
        </View>

        {/* ─── PROJECT LOCATION ─── */}
        <View style={s.locationBox}>
          <Text style={s.locationLabel}>Project Location</Text>
          <Text style={s.locationValue}>{contract.projectAddress}</Text>
        </View>

        {/* ─── 1. SCOPE OF WORK ─── */}
        <Text style={s.sectionTitle}>1. Scope of Work</Text>
        <Text style={s.body}>
          The Contractor agrees to furnish all labor, materials, equipment, and services necessary to complete the following work:
        </Text>
        <Text style={s.body}>{contract.scopeOfWork}</Text>

        {/* ─── 2. PRICING ─── */}
        <Text style={s.sectionTitle}>2. Contract Price &amp; Payment</Text>
        <View style={s.priceRow}>
          <Text style={s.priceLabel}>Total Contract Price</Text>
          <Text style={s.priceValue}>{fmt(contract.totalPrice)}</Text>
        </View>
        <View style={s.priceRow}>
          <Text style={s.priceLabel}>Deposit Due Upon Signing</Text>
          <Text style={s.priceValue}>{fmt(contract.depositAmount)}</Text>
        </View>
        <View style={s.totalRow}>
          <Text style={s.totalLabel}>Balance Due Upon Completion</Text>
          <Text style={s.totalValue}>{fmt(balance)}</Text>
        </View>
        {contract.paymentSchedule ? (
          <View>
            <Text style={s.boldLabel}>Payment Schedule:</Text>
            <Text style={s.body}>{contract.paymentSchedule}</Text>
          </View>
        ) : null}

        {/* ─── 3. TIMELINE ─── */}
        <Text style={s.sectionTitle}>3. Project Timeline</Text>
        <View style={s.timelineGrid}>
          <View style={s.timelineItem}>
            <Text style={s.timelineLabel}>Start Date</Text>
            <Text style={s.timelineValue}>{fmtDate(contract.startDate)}</Text>
          </View>
          <View style={s.timelineItem}>
            <Text style={s.timelineLabel}>Est. Completion</Text>
            <Text style={s.timelineValue}>{fmtDate(contract.estimatedCompletionDate)}</Text>
          </View>
          {contract.projectDuration ? (
            <View style={s.timelineItem}>
              <Text style={s.timelineLabel}>Duration</Text>
              <Text style={s.timelineValue}>{contract.projectDuration}</Text>
            </View>
          ) : null}
        </View>
        <Text style={s.clause}>
          The estimated completion date is subject to change due to weather, material availability, unforeseen site conditions, or customer-requested changes. Contractor will communicate any timeline adjustments promptly.
        </Text>

        {/* ─── 4. TERMS ─── */}
        <Text style={s.sectionTitle}>4. Terms &amp; Conditions</Text>
        <Text style={s.clause}>
          a) All work shall be performed in a professional and workmanlike manner in accordance with applicable building codes and standards.
        </Text>
        <Text style={s.clause}>
          b) Contractor shall obtain all necessary permits and schedule required inspections at Contractor expense unless otherwise stated.
        </Text>
        <Text style={s.clause}>
          c) Customer agrees to provide reasonable access to the project site during normal working hours.
        </Text>
        <Text style={s.clause}>
          d) Contractor shall maintain a clean and safe work area and remove all debris upon project completion.
        </Text>
        <Text style={s.clause}>
          e) Customer is responsible for relocating personal belongings and fragile items from the work area prior to project start.
        </Text>

        {/* ─── 5. CANCELLATION ─── */}
        <Text style={s.sectionTitle}>5. Cancellation Policy</Text>
        <Text style={s.clause}>
          Customer may cancel this agreement within three (3) business days of signing without penalty. After this period, a cancellation fee equal to 15% of the total contract price shall apply. Any work completed or materials purchased prior to cancellation shall be billed at the agreed-upon rates.
        </Text>

        {/* ─── 6. CHANGE ORDERS ─── */}
        <Text style={s.sectionTitle}>6. Change Orders</Text>
        <Text style={s.clause}>
          Any additions, modifications, or deletions to the scope of work described herein must be authorized in writing by both parties. Change orders may result in adjustments to the total contract price and project timeline. No additional work shall commence until a change order has been signed by both parties.
        </Text>

        {/* ─── 7. WARRANTY ─── */}
        <Text style={s.sectionTitle}>7. Warranty</Text>
        <Text style={s.clause}>
          Contractor warrants all workmanship for a period of one (1) year from the date of project completion. This warranty covers defects in workmanship and Contractor-supplied materials. This warranty does not cover damage resulting from misuse, neglect, acts of God, or normal wear and tear. Manufacturer warranties on materials and equipment are passed through to the Customer.
        </Text>

        {/* ─── 8. LIABILITY ─── */}
        <Text style={s.sectionTitle}>8. Liability &amp; Insurance</Text>
        <Text style={s.clause}>
          Contractor maintains general liability insurance and workers compensation coverage as required by law. Contractor is not responsible for pre-existing conditions not identified in the scope of work. Customer is responsible for maintaining homeowner insurance during the project.
        </Text>

        {/* ─── 9. DISPUTES ─── */}
        <Text style={s.sectionTitle}>9. Dispute Resolution</Text>
        <Text style={s.clause}>
          Any disputes arising from this agreement shall first be addressed through good-faith negotiation between the parties. If a resolution cannot be reached, disputes shall be submitted to mediation before any legal action is pursued. This agreement shall be governed by the laws of the Commonwealth of Virginia.
        </Text>

        {/* ─── 10. SPECIAL NOTES ─── */}
        {contract.specialNotes ? (
          <View>
            <Text style={s.sectionTitle}>10. Special Notes &amp; Conditions</Text>
            <View style={s.notesBox}>
              <Text style={s.body}>{contract.specialNotes}</Text>
            </View>
          </View>
        ) : null}

        {/* ─── AGREEMENT ─── */}
        <Text style={s.agreementText}>
          By signing below, both parties agree to the terms and conditions set forth in this Service Agreement. This contract represents the entire agreement between the parties and supersedes any prior discussions or agreements.
        </Text>

        {/* ─── SIGNATURES ─── */}
        <View style={s.sigSection}>
          <View style={s.sigBox}>
            <Text style={s.sigHeader}>CONTRACTOR</Text>
            <View style={s.sigLine} />
            <Text style={s.sigLabel}>{settings.companyName}</Text>
            <View style={s.dateLine} />
            <Text style={s.sigLabel}>Date</Text>
          </View>
          <View style={s.sigBox}>
            <Text style={s.sigHeader}>CUSTOMER</Text>
            <View style={s.sigLine} />
            <Text style={s.sigLabel}>{contract.customerName}</Text>
            <View style={s.dateLine} />
            <Text style={s.sigLabel}>Date</Text>
          </View>
        </View>

        {/* ─── FOOTER ─── */}
        <View style={s.footer} fixed>
          <Text style={s.footerText}>
            {settings.companyName + " | " + settings.phone + " | " + settings.website}
          </Text>
          <Text style={s.disclaimer}>
            This is a business contract template, not legal advice.
          </Text>
        </View>
      </Page>
    </Document>
  );
}
