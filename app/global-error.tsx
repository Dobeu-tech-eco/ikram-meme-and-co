"use client";

// Root-level error boundary. The root layout failed, so no app styles or
// providers are guaranteed here — this component renders its own <html>/<body>
// and relies only on inline styles.
export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="en">
      <body
        style={{
          margin: 0,
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontFamily:
            "system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial, sans-serif",
          background: "oklch(0.98 0.005 90)",
          color: "oklch(0.2 0.02 270)",
          padding: "1.5rem",
        }}
      >
        <div style={{ maxWidth: "32rem", textAlign: "center" }}>
          <h1 style={{ fontSize: "2rem", fontWeight: 900, margin: "0 0 0.75rem" }}>
            Something went wrong
          </h1>
          <p style={{ fontSize: "1.05rem", lineHeight: 1.6, opacity: 0.8, margin: "0 0 1.5rem" }}>
            An unexpected error occurred. Please try again.
          </p>
          <button
            onClick={() => reset()}
            style={{
              cursor: "pointer",
              border: "none",
              borderRadius: "1.25rem",
              padding: "0.9rem 2rem",
              fontSize: "1rem",
              fontWeight: 700,
              color: "#fff",
              background: "oklch(0.68 0.21 25)",
            }}
          >
            Try again
          </button>
          {error.digest && (
            <p style={{ marginTop: "1.5rem", fontSize: "0.8rem", opacity: 0.5 }}>
              Ref: {error.digest}
            </p>
          )}
        </div>
      </body>
    </html>
  );
}
