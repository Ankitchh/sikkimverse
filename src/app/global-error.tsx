"use client";

import { useEffect } from "react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[Global Error Boundary]", error);
  }, [error]);

  return (
    <html lang="en">
      <body style={{ margin: 0, fontFamily: "sans-serif", background: "#0a0a0a", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", minHeight: "100vh" }}>
        <div style={{ textAlign: "center", maxWidth: 400, padding: "2rem" }}>
          <div style={{ fontSize: "3rem", marginBottom: "1rem" }}>⚠️</div>
          <h1 style={{ fontSize: "1.5rem", fontWeight: 700, marginBottom: "0.5rem" }}>Critical error</h1>
          <p style={{ color: "#aaa", marginBottom: "1.5rem", fontSize: "0.9rem" }}>
            SIKKIMVERSE encountered a critical error. Please refresh the page.
          </p>
          {error.digest && (
            <p style={{ color: "#666", fontSize: "0.75rem", marginBottom: "1.5rem", fontFamily: "monospace" }}>
              ID: {error.digest}
            </p>
          )}
          <button
            onClick={reset}
            style={{
              background: "#16A34A",
              color: "#fff",
              border: "none",
              borderRadius: "0.75rem",
              padding: "0.75rem 2rem",
              fontSize: "1rem",
              fontWeight: 700,
              cursor: "pointer",
            }}
          >
            Reload
          </button>
        </div>
      </body>
    </html>
  );
}
