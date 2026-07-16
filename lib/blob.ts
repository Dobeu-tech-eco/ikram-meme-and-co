import "server-only";
import { put } from "@vercel/blob";

/**
 * Upload a product image to Vercel Blob (CDN).
 * Requires BLOB_READ_WRITE_TOKEN. Caller stores the returned URL in products.images.
 */
export async function uploadProductImage(
  filename: string,
  body: Blob | ArrayBuffer | ReadableStream | Buffer | string,
  contentType?: string,
): Promise<{ url: string }> {
  const token = process.env.BLOB_READ_WRITE_TOKEN;
  if (!token) {
    throw new Error("BLOB_READ_WRITE_TOKEN is not configured");
  }
  const safe = filename.replace(/[^a-zA-Z0-9._-]/g, "_").slice(0, 128) || "image";
  const blob = await put(`products/${safe}`, body, {
    access: "public",
    token,
    contentType,
    addRandomSuffix: true,
  });
  return { url: blob.url };
}
