import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

export async function POST(request: Request) {
  const currentPassword = request.headers.get("x-admin-password");
  if (currentPassword !== process.env.ADMIN_PASSWORD) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { newPassword } = await request.json();

  if (!newPassword || newPassword.length < 6) {
    return NextResponse.json(
      { error: "New password must be at least 6 characters" },
      { status: 400 }
    );
  }

  const envPath = path.join(process.cwd(), ".env.local");
  let envContent = fs.readFileSync(envPath, "utf-8");
  envContent = envContent.replace(
    /^ADMIN_PASSWORD=.*/m,
    `ADMIN_PASSWORD=${newPassword}`
  );
  fs.writeFileSync(envPath, envContent);

  // Update the runtime env so the new password works immediately
  process.env.ADMIN_PASSWORD = newPassword;

  return NextResponse.json({ success: true });
}
