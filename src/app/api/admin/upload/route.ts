import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

export async function POST(request: Request) {
  const password = request.headers.get("x-admin-password");
  if (password !== process.env.ADMIN_PASSWORD) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const formData = await request.formData();
  const file = formData.get("file") as File;
  const slug = formData.get("slug") as string;

  if (!file || !slug) {
    return NextResponse.json({ error: "Missing file or slug" }, { status: 400 });
  }

  const ext = path.extname(file.name).toLowerCase();
  const allowedExts = [".jpg", ".jpeg", ".png", ".webp", ".heic", ".mp4", ".webm", ".mov"];

  if (!allowedExts.includes(ext)) {
    return NextResponse.json(
      { error: `File type ${ext} not allowed. Allowed: ${allowedExts.join(", ")}` },
      { status: 400 }
    );
  }

  const timestamp = Date.now();
  const sanitizedSlug = slug.replace(/[^a-z0-9-]/g, "");
  const filename = `${sanitizedSlug}-${timestamp}${ext}`;
  const publicPath = `/work/${filename}`;
  const filePath = path.join(process.cwd(), "public", "work", filename);

  const workDir = path.join(process.cwd(), "public", "work");
  if (!fs.existsSync(workDir)) {
    fs.mkdirSync(workDir, { recursive: true });
  }

  const buffer = Buffer.from(await file.arrayBuffer());
  fs.writeFileSync(filePath, buffer);

  return NextResponse.json({ path: publicPath, filename });
}
