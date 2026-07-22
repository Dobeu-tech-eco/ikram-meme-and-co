import Image from "next/image";
import { useTranslations } from "next-intl";
import { getProductImageUrl } from "@/lib/product-merch";

type Props = {
  images: unknown;
  alt: string;
  className?: string;
  priority?: boolean;
  sizes?: string;
};

export function ProductImage({
  images,
  alt,
  className = "",
  priority = false,
  sizes = "(max-width: 768px) 100vw, 33vw",
}: Props) {
  const t = useTranslations("product");
  const url = getProductImageUrl(images);

  if (!url) {
    return (
      <div
        className={`frame relative flex aspect-square items-center justify-center ${className}`}
        role="img"
        aria-label={t("imageUnavailable")}
      >
        <span className="px-4 text-center text-xs font-medium tracking-wide text-[--color-muted]">
          {t("imageUnavailable")}
        </span>
      </div>
    );
  }

  const unoptimized = url.startsWith("http://") || url.startsWith("https://");

  return (
    <div className={`frame relative aspect-square overflow-hidden ${className}`}>
      <Image
        src={url}
        alt={alt}
        fill
        sizes={sizes}
        priority={priority}
        unoptimized={unoptimized}
        className="object-cover"
      />
    </div>
  );
}
