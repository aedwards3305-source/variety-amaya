import { put, list } from "@vercel/blob";

const IS_VERCEL = !!process.env.BLOB_READ_WRITE_TOKEN;

// Fallback to filesystem for local development
async function localRead(filename: string): Promise<string | null> {
  const fs = await import("fs");
  const path = await import("path");
  const filePath = path.join(process.cwd(), "src", "data", filename);
  if (!fs.existsSync(filePath)) return null;
  return fs.readFileSync(filePath, "utf-8");
}

async function localWrite(filename: string, data: string): Promise<void> {
  const fs = await import("fs");
  const path = await import("path");
  const filePath = path.join(process.cwd(), "src", "data", filename);
  fs.writeFileSync(filePath, data);
}

export async function readJSON<T>(filename: string, fallback: T): Promise<T> {
  if (!IS_VERCEL) {
    const content = await localRead(filename);
    return content ? JSON.parse(content) : fallback;
  }

  try {
    const { blobs } = await list({ prefix: filename });
    if (blobs.length === 0) {
      // Try reading from bundled file as initial seed
      try {
        const content = await localRead(filename);
        if (content) return JSON.parse(content);
      } catch {
        // No local file either
      }
      return fallback;
    }
    const response = await fetch(blobs[0].url);
    const text = await response.text();
    return JSON.parse(text);
  } catch {
    return fallback;
  }
}

export async function writeJSON(filename: string, data: unknown): Promise<void> {
  if (!IS_VERCEL) {
    await localWrite(filename, JSON.stringify(data, null, 2));
    return;
  }

  // Delete existing blob(s) with this name first
  const { blobs } = await list({ prefix: filename });
  if (blobs.length > 0) {
    const { del } = await import("@vercel/blob");
    await del(blobs.map((b) => b.url));
  }

  await put(filename, JSON.stringify(data, null, 2), {
    access: "public",
    addRandomSuffix: false,
  });
}
