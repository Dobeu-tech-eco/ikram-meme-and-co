import { ImageResponse } from "next/og";

export const size = { width: 180, height: 180 };
export const contentType = "image/png";

/** Apple touch icon — same diamond mark as BrandLogo / app/icon.svg */
export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#151a22",
          borderRadius: 40,
        }}
      >
        <svg width="132" height="132" viewBox="0 0 40 40" fill="none">
          <defs>
            <linearGradient id="g" x1="6" y1="4" x2="34" y2="36" gradientUnits="userSpaceOnUse">
              <stop stopColor="#c9922a" />
              <stop offset="1" stopColor="#2f7a6b" />
            </linearGradient>
          </defs>
          <path
            d="M20 7.5L30.5 20L20 32.5L9.5 20L20 7.5Z"
            stroke="url(#g)"
            strokeWidth="2.2"
            strokeLinejoin="round"
          />
          <path
            d="M20 13.5L25.5 20L20 26.5L14.5 20L20 13.5Z"
            fill="url(#g)"
          />
        </svg>
      </div>
    ),
    { ...size },
  );
}
