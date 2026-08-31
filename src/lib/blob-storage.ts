import { put, list } from "@vercel/blob";

const IS_VERCEL = !!process.env.BLOB_READ_WRITE_TOKEN;

// On Vercel the filesystem is read-only, so the local fallback below cannot work
// there. Without a Blob token every write would fail with an opaque EROFS error.
function assertStorageConfigured(): void {
  if (!IS_VERCEL && process.env.VERCEL) {
    throw new Error(
      "Blob storage is not configured: BLOB_READ_WRITE_TOKEN is missing. " +
        "Connect a Blob store to this project in Vercel and redeploy."
    );
  }
}

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
  assertStorageConfigured();
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
    const response = await fetch(blobs[0].url, { cache: "no-store" });
    const text = await response.text();
    return JSON.parse(text);
  } catch (err) {
    // Returning the fallback here would hand callers an empty list, and a
    // caller that then writes would erase every existing record.
    throw new Error(
      `Could not read ${filename} from Blob storage: ${err instanceof Error ? err.message : String(err)}`
    );
  }
}

export async function writeJSON(filename: string, data: unknown): Promise<void> {
  assertStorageConfigured();
  if (!IS_VERCEL) {
    await localWrite(filename, JSON.stringify(data, null, 2));
    return;
  }

  // `put` overwrites the existing blob because addRandomSuffix is off. Deleting
  // first would destroy the saved data whenever the write that follows fails.
  await put(filename, JSON.stringify(data, null, 2), {
    access: "public",
    addRandomSuffix: false,
    cacheControlMaxAge: 0,
  });
}
