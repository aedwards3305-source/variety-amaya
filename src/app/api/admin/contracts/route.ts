import { NextResponse } from "next/server";
import { readJSON, writeJSON } from "@/lib/blob-storage";

function validatePassword(request: Request): boolean {
  return request.headers.get("x-admin-password") === process.env.ADMIN_PASSWORD;
}

export async function GET(request: Request) {
  if (!validatePassword(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const contracts = await readJSON("contracts.json", []);
  return NextResponse.json(contracts);
}

export async function POST(request: Request) {
  if (!validatePassword(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const contracts = await readJSON<Record<string, unknown>[]>("contracts.json", []);

  const year = new Date().getFullYear();
  const thisYearContracts = contracts.filter(
    (c) => (c.contractNumber as string)?.startsWith(`VA-${year}-`)
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
  await writeJSON("contracts.json", contracts);

  return NextResponse.json(contract, { status: 201 });
}
