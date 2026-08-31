import { NextResponse } from "next/server";
import { readJSON, writeJSON } from "@/lib/blob-storage";

const DEFAULT_SETTINGS = {
  companyName: "Variety Amaya LLC",
  address: "Fairfax, VA",
  phone: "(703) 677-0440",
  email: "",
  website: "varietyamaya.net",
  license: "2638609",
  insurance: "Nautilus Insurance Company NAIC #17370",
  tagline: "Serving Our Community",
  logoPath: "/va-logo.png",
};

function validatePassword(request: Request): boolean {
  return request.headers.get("x-admin-password") === process.env.ADMIN_PASSWORD;
}

export async function GET(request: Request) {
  if (!validatePassword(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  try {
    const data = await readJSON("company-settings.json", DEFAULT_SETTINGS);
    return NextResponse.json(data);
  } catch (err) {
    // Settings are presentation-only and have sane defaults, so a storage
    // outage should not take the admin down with it.
    console.error("Read company settings failed, using defaults:", err);
    return NextResponse.json(DEFAULT_SETTINGS);
  }
}

export async function PUT(request: Request) {
  if (!validatePassword(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  try {
    const body = await request.json();
    await writeJSON("company-settings.json", body);
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Save company settings failed:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Could not save settings" },
      { status: 500 }
    );
  }
}
