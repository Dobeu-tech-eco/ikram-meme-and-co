"use server";
import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/actions/auth";
import type { ActionResult } from "@/lib/actions/products";

export async function markOrderFulfilled(
  id: string,
  tracking: { tracking_number: string; carrier: string }
): Promise<ActionResult<null>> {
  const { admin } = await requireAdmin();
  const { error } = await admin
    .from("orders")
    .update({ status: "fulfilled", ...tracking })
    .eq("id", id);
  if (error) return { ok: false, error: error.message };
  revalidatePath("/admin/orders");
  return { ok: true, data: null };
}
