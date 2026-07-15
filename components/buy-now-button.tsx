"use client";
import { useState, useTransition } from "react";
import { useLocale, useTranslations } from "next-intl";
import { buyNow } from "@/app/[locale]/product/[slug]/actions";

export function BuyNowButton({ productId }: { productId: string }) {
  const locale = useLocale() as "en" | "ar";
  const t = useTranslations("product");
  const [pending, start] = useTransition();
  const [error, setError] = useState<string | null>(null);
  return (
    <div>
      <button
        disabled={pending}
        onClick={() =>
          start(async () => {
            const r = await buyNow(productId, locale);
            if (r && !r.ok) {
              setError(r.error === "sold_out" ? t("justSold") : "Something went wrong.");
            }
          })
        }
        className="w-full rounded-[--radius-xl] px-8 py-4 text-lg font-black text-white disabled:opacity-50"
        style={{ background: "var(--color-accent)" }}
      >
        {pending ? "…" : t("buyNow")}
      </button>
      {error && <p className="mt-2 text-sm font-bold text-[--color-accent]">{error}</p>}
    </div>
  );
}
