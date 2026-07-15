import "server-only";
import type { Db } from "@/lib/db-types";

export type ArtistRef = { slug: string; name_en: string; name_ar: string };

export type ProductRow = {
  id: string;
  slug: string;
  artist_id: string;
  title_en: string;
  title_ar: string;
  description_en: string | null;
  description_ar: string | null;
  price_cents: number;
  currency: string;
  fulfillment_type: string;
  status: string;
  quantity: number;
  images: unknown;
  artists?: ArtistRef | null;
};

export type ArtistRow = {
  id: string;
  slug: string;
  name_en: string;
  name_ar: string;
  bio_en: string | null;
  bio_ar: string | null;
  photo_url: string | null;
  instagram: string | null;
};

export async function getLiveProducts(db: Db): Promise<ProductRow[]> {
  const { data } = await db
    .from("products")
    .select("*, artists(slug, name_en, name_ar)")
    .neq("status", "draft")
    .neq("status", "archived")
    .order("created_at", { ascending: false });
  return (data ?? []) as ProductRow[];
}

export async function getProductBySlug(db: Db, slug: string): Promise<ProductRow | null> {
  const { data } = await db
    .from("products")
    .select("*, artists(slug, name_en, name_ar)")
    .eq("slug", slug)
    .single();
  return (data as ProductRow | null) ?? null;
}

export async function getArtists(db: Db): Promise<ArtistRow[]> {
  const { data } = await db.from("artists").select("*").order("name_en");
  return (data ?? []) as ArtistRow[];
}

export async function getArtistWithWorks(
  db: Db,
  slug: string
): Promise<{ artist: ArtistRow; works: ProductRow[] } | null> {
  const { data: artist } = await db.from("artists").select("*").eq("slug", slug).single();
  if (!artist) return null;
  const { data: works } = await db
    .from("products")
    .select("*")
    .eq("artist_id", (artist as ArtistRow).id)
    .neq("status", "draft")
    .order("created_at", { ascending: false });
  return { artist: artist as ArtistRow, works: (works ?? []) as ProductRow[] };
}
