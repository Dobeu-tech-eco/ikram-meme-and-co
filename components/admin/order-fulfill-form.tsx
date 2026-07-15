"use client";
import { useState, useTransition } from "react";
import { markOrderFulfilled } from "@/lib/actions/orders";

export function OrderFulfillForm({ id }: { id: string }) {
  const [pending, start] = useTransition();
  const [msg, setMsg] = useState<string | null>(null);

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    const tracking = {
      tracking_number: String(form.get("tracking_number") ?? ""),
      carrier: String(form.get("carrier") ?? ""),
    };
    start(async () => {
      const r = await markOrderFulfilled(id, tracking);
      setMsg(r.ok ? "Fulfilled." : `Error: ${r.error}`);
    });
  }

  return (
    <form onSubmit={onSubmit} className="flex flex-wrap items-center gap-2">
      <input name="tracking_number" placeholder="tracking #" required className="rounded border px-2 py-1 text-sm" />
      <input name="carrier" placeholder="carrier" required className="rounded border px-2 py-1 text-sm" />
      <button
        type="submit"
        disabled={pending}
        className="rounded bg-black px-3 py-1 text-sm font-bold text-white disabled:opacity-50"
      >
        {pending ? "…" : "Mark fulfilled"}
      </button>
      {msg && <span className="text-xs">{msg}</span>}
    </form>
  );
}
