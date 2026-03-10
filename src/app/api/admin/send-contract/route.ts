import { NextResponse } from "next/server";
import { readJSON, writeJSON } from "@/lib/blob-storage";
import type { Contract, CompanySettings } from "@/lib/contract-types";

function validatePassword(request: Request): boolean {
  return request.headers.get("x-admin-password") === process.env.ADMIN_PASSWORD;
}

export async function POST(request: Request) {
  try {
    if (!validatePassword(request)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { contractId } = await request.json();
    if (!contractId) {
      return NextResponse.json({ error: "contractId required" }, { status: 400 });
    }

    // Load contract and settings
    const contracts = await readJSON<Contract[]>("contracts.json", []);
    const contract = contracts.find((c) => c.id === contractId);
    if (!contract) {
      return NextResponse.json({ error: "Contract not found" }, { status: 404 });
    }
    if (!contract.customerEmail) {
      return NextResponse.json({ error: "Customer has no email address" }, { status: 400 });
    }

    const settings = await readJSON<CompanySettings>("company-settings.json", {
      companyName: "Variety Amaya LLC",
      address: "Fairfax, VA",
      phone: "(703) 677-0440",
      email: "",
      website: "varietyamaya.net",
      license: "2638609",
      insurance: "Nautilus Insurance Company NAIC #17370",
      tagline: "",
      logoPath: "/va-logo.png",
    });

    // Check SendGrid config
    const apiKey = process.env.SENDGRID_API_KEY;
    const fromEmail = process.env.SENDGRID_FROM_EMAIL;
    if (!apiKey || !fromEmail) {
      return NextResponse.json(
        { error: "Email service not configured. Set SENDGRID_API_KEY and SENDGRID_FROM_EMAIL in Vercel." },
        { status: 500 }
      );
    }

    // Generate PDF server-side
    const { renderToBuffer } = await import("@react-pdf/renderer");
    const { ContractPDF } = await import("@/lib/contract-pdf");

    // Build absolute logo URL from request origin
    const origin = request.headers.get("x-forwarded-host")
      ? `https://${request.headers.get("x-forwarded-host")}`
      : request.headers.get("origin") || "https://varietyamaya.net";
    const logoUrl = origin + settings.logoPath;

    const pdfBuffer = await renderToBuffer(
      ContractPDF({ contract, settings, logoUrl })
    );

    const totalPrice = Number(contract.totalPrice).toFixed(2);
    const depositAmount = Number(contract.depositAmount).toFixed(2);
    const filename = `${contract.contractNumber}-${contract.customerName.replace(/\s+/g, "-")}.pdf`;

    // Send via SendGrid
    const sgMail = (await import("@sendgrid/mail")).default;
    sgMail.setApiKey(apiKey);

    await sgMail.send({
      to: contract.customerEmail,
      from: { email: fromEmail, name: settings.companyName },
      subject: `Service Agreement ${contract.contractNumber} - ${settings.companyName}`,
      text: `Dear ${contract.customerName},

Please find attached the Service Agreement (${contract.contractNumber}) for your project at ${contract.projectAddress}.

Contract Amount: $${totalPrice}
Deposit Required: $${depositAmount}

Please review the agreement and let us know if you have any questions. You can reach us at ${settings.phone}.

Best regards,
${settings.companyName}
${settings.phone}
${settings.website}`,
      html: `<p>Dear ${contract.customerName},</p>
<p>Please find attached the Service Agreement (<strong>${contract.contractNumber}</strong>) for your project at ${contract.projectAddress}.</p>
<table style="border-collapse:collapse;margin:16px 0;">
  <tr><td style="padding:4px 16px 4px 0;color:#666;">Contract Amount:</td><td style="font-weight:bold;">$${totalPrice}</td></tr>
  <tr><td style="padding:4px 16px 4px 0;color:#666;">Deposit Required:</td><td style="font-weight:bold;">$${depositAmount}</td></tr>
</table>
<p>Please review the agreement and let us know if you have any questions. You can reach us at <strong>${settings.phone}</strong>.</p>
<p>Best regards,<br/><strong>${settings.companyName}</strong><br/>${settings.phone}<br/>${settings.website}</p>`,
      attachments: [
        {
          content: Buffer.from(pdfBuffer).toString("base64"),
          filename,
          type: "application/pdf",
          disposition: "attachment",
        },
      ],
    });

    // Update contract status to "sent" if it's still a draft
    const idx = contracts.findIndex((c) => c.id === contractId);
    if (idx !== -1 && contracts[idx].status === "draft") {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const entry = contracts[idx] as any;
      entry.status = "sent";
      entry.sentAt = new Date().toISOString();
      entry.updatedAt = new Date().toISOString();
      await writeJSON("contracts.json", contracts);
    }

    return NextResponse.json({ success: true, sentTo: contract.customerEmail });
  } catch (err) {
    console.error("Send contract error:", err);
    const message = err instanceof Error ? err.message : "Failed to send email";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
