import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

const DATA_PATH = path.join(process.cwd(), "src", "data", "contracts.json");

function validatePassword(request: Request): boolean {
  return request.headers.get("x-admin-password") === process.env.ADMIN_PASSWORD;
}

function readContracts() {
  if (!fs.existsSync(DATA_PATH)) return [];
  return JSON.parse(fs.readFileSync(DATA_PATH, "utf-8"));
}

function writeContracts(data: unknown[]) {
  fs.writeFileSync(DATA_PATH, JSON.stringify(data, null, 2));
}

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!validatePassword(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { id } = await params;
  const contracts = readContracts();
  const contract = contracts.find((c: { id: string }) => c.id === id);
  if (!contract) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  return NextResponse.json(contract);
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!validatePassword(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { id } = await params;
  const body = await request.json();
  const contracts = readContracts();
  const index = contracts.findIndex((c: { id: string }) => c.id === id);
  if (index === -1) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  contracts[index] = {
    ...contracts[index],
    ...body,
    updatedAt: new Date().toISOString(),
  };
  writeContracts(contracts);

  return NextResponse.json(contracts[index]);
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!validatePassword(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { id } = await params;
  const contracts = readContracts();
  const filtered = contracts.filter((c: { id: string }) => c.id !== id);
  if (filtered.length === contracts.length) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  writeContracts(filtered);
  return NextResponse.json({ success: true });
}
