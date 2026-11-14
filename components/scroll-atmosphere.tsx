"use client";

import { useScrollCssVars } from "@/lib/hooks/use-scroll-css-vars";

/**
 * Fixed site atmosphere: mesh blobs + grain that drift with page scroll.
 * Sets --scroll-y (0–1) on :root for CSS parallax fallbacks.
 */
export function ScrollAtmosphere() {
  useScrollCssVars();

  return (
    <div className="site-atmosphere" aria-hidden>
      <div className="site-atmosphere__layer site-atmosphere__layer--a">
        <div className="mesh-a site-atmosphere__blob" />
      </div>
      <div className="site-atmosphere__layer site-atmosphere__layer--b">
        <div className="mesh-b site-atmosphere__blob" />
      </div>
      <div className="site-atmosphere__layer site-atmosphere__layer--c">
        <div className="site-atmosphere__orb" />
      </div>
      <div className="grain site-atmosphere__grain" />
    </div>
  );
}
