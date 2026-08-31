import { NextResponse } from "next/server";
import { readJSON, writeJSON } from "@/lib/blob-storage";

function validatePassword(request: Request): boolean {
  return request.headers.get("x-admin-password") === process.env.ADMIN_PASSWORD;
}

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!validatePassword(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { id } = await params;
  const contracts = await readJSON<Record<string, unknown>[]>("contracts.json", []);
  const contract = contracts.find((c) => c.id === id);
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
  try {
    const body = await request.json();
    const contracts = await readJSON<Record<string, unknown>[]>("contracts.json", []);
    const index = contracts.findIndex((c) => c.id === id);
    if (index === -1) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    contracts[index] = {
      ...contracts[index],
      ...body,
      updatedAt: new Date().toISOString(),
    };
    await writeJSON("contracts.json", contracts);

    return NextResponse.json(contracts[index]);
  } catch (err) {
    console.error("Update contract failed:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Could not save the contract" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!validatePassword(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { id } = await params;
  const contracts = await readJSON<Record<string, unknown>[]>("contracts.json", []);
  const filtered = contracts.filter((c) => c.id !== id);
  if (filtered.length === contracts.length) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  await writeJSON("contracts.json", filtered);
  return NextResponse.json({ success: true });
}
