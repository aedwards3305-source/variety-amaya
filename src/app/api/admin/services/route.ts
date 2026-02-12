import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

const DATA_PATH = path.join(process.cwd(), "src", "data", "services-data.json");

function validatePassword(request: Request): boolean {
  const password = request.headers.get("x-admin-password");
  return password === process.env.ADMIN_PASSWORD;
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

  const { slug, data } = await request.json();

  if (!slug || !data) {
    return NextResponse.json({ error: "Missing slug or data" }, { status: 400 });
  }

  const allData = JSON.parse(fs.readFileSync(DATA_PATH, "utf-8"));

  if (!allData[slug]) {
    return NextResponse.json({ error: "Service not found" }, { status: 404 });
  }

  allData[slug] = data;
  fs.writeFileSync(DATA_PATH, JSON.stringify(allData, null, 2));

  return NextResponse.json({ success: true });
}
