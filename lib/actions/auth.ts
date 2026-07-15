import "server-only";
import { createClient, createAdminClient } from "@/lib/supabase/server";
import { isAdminEmail } from "@/lib/utils";

export class AuthError extends Error {
  constructor(public code: "not_authenticated" | "forbidden") {
    super(code);
  }
}

export async function requireAdmin() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new AuthError("not_authenticated");
  if (!isAdminEmail(user.email)) throw new AuthError("forbidden");
  return { user, admin: createAdminClient() };
}
