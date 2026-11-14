"use client";

import { SpatialStage } from "@/components/landing/spatial-stage";
import type { ProductRow } from "@/lib/catalog";

/** Homepage hero — immersive spatial stage. */
export function Hero({ featured }: { featured?: ProductRow | null }) {
  return <SpatialStage featured={featured} />;
}
