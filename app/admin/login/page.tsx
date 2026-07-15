"use client";
import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

export default function AdminLoginPage() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    const supabase = createClient();
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: `${location.origin}/auth/callback?next=/admin` },
    });
    if (error) setError(error.message);
    else setSent(true);
  }

  return (
    <div className="mx-auto flex min-h-svh max-w-sm flex-col justify-center p-6">
      <h1 className="mb-6 text-2xl font-black">Admin sign in</h1>
      {sent ? (
        <p>Check your email for a sign-in link.</p>
      ) : (
        <form onSubmit={onSubmit} className="flex flex-col gap-3">
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            className="rounded-lg border px-3 py-2"
          />
          <button type="submit" className="rounded-lg bg-black px-4 py-2 font-bold text-white">
            Send magic link
          </button>
          {error && <p className="text-sm text-red-600">{error}</p>}
        </form>
      )}
    </div>
  );
}
