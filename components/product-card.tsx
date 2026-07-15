import { Link } from "@/i18n/navigation";
import { useLocale, useTranslations } from "next-intl";
import type { ProductRow } from "@/lib/catalog";

export function ProductCard({ p }: { p: ProductRow }) {
  const locale = useLocale();
  const t = useTranslations("product");
  const sold = p.status === "sold" || (p.fulfillment_type === "edition" && p.quantity < 1);
  return (
    <Link
      href={`/product/${p.slug}`}
      className="glass block overflow-hidden transition hover:scale-[1.02]"
    >
      <div className="aspect-square bg-[--color-surface-2]" />
      <div className="p-4">
        <h3 className="font-bold">{locale === "ar" ? p.title_ar : p.title_en}</h3>
        <div className="mt-1 flex items-center justify-between text-sm">
          <span className="font-black text-[--color-accent]">
            ${(p.price_cents / 100).toFixed(0)}
          </span>
          {sold && (
            <span
              className="rounded-full px-2 py-0.5 text-xs font-bold text-white"
              style={{ background: "var(--color-accent)" }}
            >
              {t("sold")}
            </span>
          )}
          {p.fulfillment_type === "original" && !sold && (
            <span className="text-xs opacity-70">1 of 1</span>
          )}
        </div>
      </div>
    </Link>
  );
}
