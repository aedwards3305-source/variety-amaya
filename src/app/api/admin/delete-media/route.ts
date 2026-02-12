import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

export async function POST(request: Request) {
  const password = request.headers.get("x-admin-password");
  if (password !== process.env.ADMIN_PASSWORD) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { filePath } = await request.json();

  if (!filePath || !filePath.startsWith("/work/")) {
    return NextResponse.json({ error: "Invalid file path" }, { status: 400 });
  }

  const fullPath = path.join(process.cwd(), "public", filePath);

  if (fs.existsSync(fullPath)) {
    fs.unlinkSync(fullPath);
  }

  return NextResponse.json({ success: true });
}
