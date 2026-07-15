"use server";
import { z } from "zod";
import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/actions/auth";
import type { Db } from "@/lib/db-types";

const productInput = z.object({
  slug: z
    .string()
    .min(1)
    .regex(/^[a-z0-9-]+$/),
  artist_id: z.uuid(),
  title_en: z.string().min(1),
  title_ar: z.string().min(1),
  description_en: z.string().optional(),
  description_ar: z.string().optional(),
  price_cents: z.number().int().positive(),
  fulfillment_type: z.enum(["original", "edition", "pod"]),
  quantity: z.number().int().min(0),
});

export type ActionResult<T> = { ok: true; data: T } | { ok: false; error: string };

// Pure core, testable with a stub client (no auth inside).
export async function createProductCore(
  db: Pick<Db, "from">,
  raw: unknown
): Promise<ActionResult<{ id: string }>> {
  const parsed = productInput.safeParse(raw);
  if (!parsed.success) return { ok: false, error: "invalid_input" };
  const { data, error } = await db
    .from("products")
    .insert({ ...parsed.data, status: "draft" })
    .select()
    .single();
  if (error || !data) return { ok: false, error: error?.message ?? "insert_failed" };
  return { ok: true, data: { id: (data as { id: string }).id } };
}

export async function createProduct(raw: unknown): Promise<ActionResult<{ id: string }>> {
  const { admin } = await requireAdmin();
  const result = await createProductCore(admin as never, raw);
  if (result.ok) revalidatePath("/admin/products");
  return result;
}

export async function updateProductStatus(
  id: string,
  status: "draft" | "available" | "archived"
): Promise<ActionResult<null>> {
  const { admin } = await requireAdmin();
  const { error } = await admin.from("products").update({ status }).eq("id", id);
  if (error) return { ok: false, error: error.message };
  revalidatePath("/admin/products");
  return { ok: true, data: null };
}
