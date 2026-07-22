import { Link } from "@/i18n/navigation";
import { useLocale, useTranslations } from "next-intl";
import type { ProductRow } from "@/lib/catalog";
import { ProductImage } from "@/components/product-image";
import { ProductScarcity, ProductTypeBadge } from "@/components/product-type-badge";

export function ProductCard({ p }: { p: ProductRow }) {
  const locale = useLocale();
  const t = useTranslations("product");
  const title = locale === "ar" ? p.title_ar : p.title_en;

  return (
    <Link
      href={`/product/${p.slug}`}
      className="product-card group block overflow-hidden transition-opacity hover:opacity-95"
    >
      <div className="product-card-media">
        <ProductImage images={p.images} alt={title} />
      </div>
      <div className="border border-t-0 border-[--color-border] p-4">
        <div className="mb-2">
          <ProductTypeBadge p={p} />
        </div>
        <h3 className="font-display text-base font-semibold leading-snug">{title}</h3>
        <div className="mt-2 flex items-baseline justify-between gap-2 text-sm">
          <span className="font-semibold tabular-nums">
            ${(p.price_cents / 100).toFixed(0)}
          </span>
          <ProductScarcity p={p} />
        </div>
        <span className="sr-only">{t("buyNow")}</span>
      </div>
    </Link>
  );
}
