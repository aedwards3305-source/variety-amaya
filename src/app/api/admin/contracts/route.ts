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

export async function GET(request: Request) {
  if (!validatePassword(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  return NextResponse.json(readContracts());
}

export async function POST(request: Request) {
  if (!validatePassword(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const contracts = readContracts();

  const year = new Date().getFullYear();
  const thisYearContracts = contracts.filter(
    (c: { contractNumber: string }) => c.contractNumber?.startsWith(`VA-${year}-`)
  );
  const nextNum = thisYearContracts.length + 1;
  const contractNumber = `VA-${year}-${String(nextNum).padStart(3, "0")}`;

  const now = new Date().toISOString();
  const contract = {
    id: `contract-${Date.now()}`,
    contractNumber,
    status: "draft",
    createdAt: now,
    updatedAt: now,
    ...body,
    totalPrice: parseFloat(body.totalPrice) || 0,
    depositAmount: parseFloat(body.depositAmount) || 0,
  };

  contracts.push(contract);
  writeContracts(contracts);

  return NextResponse.json(contract, { status: 201 });
}
