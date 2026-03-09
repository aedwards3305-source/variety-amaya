import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

const DATA_PATH = path.join(process.cwd(), "src", "data", "company-settings.json");

function validatePassword(request: Request): boolean {
  return request.headers.get("x-admin-password") === process.env.ADMIN_PASSWORD;
}

export async function GET(request: Request) {
  if (!validatePassword(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const data = JSON.parse(fs.readFileSync(DATA_PATH, "utf-8"));
  return NextResponse.json(data);
}

export async function PUT(request: Request) {
  if (!validatePassword(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const body = await request.json();
  fs.writeFileSync(DATA_PATH, JSON.stringify(body, null, 2));
  return NextResponse.json({ success: true });
}
