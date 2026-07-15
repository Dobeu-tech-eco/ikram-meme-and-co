"use client";
import { useState, useTransition } from "react";
import { createProduct } from "@/lib/actions/products";

export function NewProductForm() {
  const [pending, start] = useTransition();
  const [msg, setMsg] = useState<string | null>(null);

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    const raw = {
      slug: String(form.get("slug") ?? ""),
      artist_id: String(form.get("artist_id") ?? ""),
      title_en: String(form.get("title_en") ?? ""),
      title_ar: String(form.get("title_ar") ?? ""),
      description_en: String(form.get("description_en") ?? "") || undefined,
      description_ar: String(form.get("description_ar") ?? "") || undefined,
      price_cents: Number(form.get("price_cents") ?? 0),
      fulfillment_type: String(form.get("fulfillment_type") ?? "original"),
      quantity: Number(form.get("quantity") ?? 1),
    };
    start(async () => {
      const r = await createProduct(raw);
      setMsg(r.ok ? "Created (status: draft)." : `Error: ${r.error}`);
    });
  }

  const field = "rounded border px-3 py-2";
  return (
    <form onSubmit={onSubmit} className="grid max-w-lg gap-3">
      <input name="slug" placeholder="slug (a-z0-9-)" required className={field} />
      <input name="artist_id" placeholder="artist_id (uuid)" required className={field} />
      <input name="title_en" placeholder="Title (EN)" required className={field} />
      <input name="title_ar" placeholder="Title (AR)" required className={field} />
      <textarea name="description_en" placeholder="Description (EN)" className={field} />
      <textarea name="description_ar" placeholder="Description (AR)" className={field} />
      <input name="price_cents" type="number" placeholder="price_cents" required className={field} />
      <select name="fulfillment_type" className={field} defaultValue="original">
        <option value="original">original</option>
        <option value="edition">edition</option>
        <option value="pod">pod</option>
      </select>
      <input name="quantity" type="number" defaultValue={1} className={field} />
      <button
        type="submit"
        disabled={pending}
        className="rounded bg-black px-4 py-2 font-bold text-white disabled:opacity-50"
      >
        {pending ? "Saving…" : "Create product"}
      </button>
      {msg && <p className="text-sm">{msg}</p>}
      <p className="text-xs opacity-60">
        Image upload is Phase 2. For now, add image URLs via Supabase Studio after creating.
      </p>
    </form>
  );
}
