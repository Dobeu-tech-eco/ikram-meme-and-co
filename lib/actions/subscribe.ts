"use server";
import { z } from "zod";
import { createAdminClient } from "@/lib/supabase/server";
import type { ActionResult } from "@/lib/actions/products";
import type { Db } from "@/lib/db-types";

const input = z.object({ email: z.email(), locale: z.enum(["en", "ar"]) });

export async function subscribeCore(
  db: Pick<Db, "from">,
  raw: unknown
): Promise<ActionResult<null>> {
  const parsed = input.safeParse(raw);
  if (!parsed.success) return { ok: false, error: "invalid_email" };
  const { error } = await db
    .from("subscribers")
    .upsert(
      { email: parsed.data.email.toLowerCase(), locale: parsed.data.locale },
      { onConflict: "email" }
    );
  if (error) return { ok: false, error: error.message };
  return { ok: true, data: null };
}

export async function subscribe(raw: unknown): Promise<ActionResult<null>> {
  // Mirroring to a Resend Audience is a one-line non-fatal add behind
  // RESEND_AUDIENCE_ID once that exists.
  return subscribeCore(createAdminClient() as never, raw);
}
