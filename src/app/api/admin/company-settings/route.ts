import { NextResponse } from "next/server";
import { readJSON, writeJSON } from "@/lib/blob-storage";

const DEFAULT_SETTINGS = {
  companyName: "Variety Amaya LLC",
  address: "Fairfax, VA",
  phone: "(703) 677-0440",
  email: "",
  website: "varietyamaya.net",
  license: "",
  insurance: "",
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
  const data = await readJSON("company-settings.json", DEFAULT_SETTINGS);
  return NextResponse.json(data);
}

export async function PUT(request: Request) {
  if (!validatePassword(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const body = await request.json();
  await writeJSON("company-settings.json", body);
  return NextResponse.json({ success: true });
}
