"use client";

// Global error boundary — catches failures in the root layout itself,
// so it must render its own <html> and <body> without app styles.
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
          background: "#E4EBF5",
          color: "#31344B",
          fontFamily: "system-ui, sans-serif",
          textAlign: "center",
          padding: "1rem",
        }}
      >
        <div>
          <h1 style={{ fontSize: "1.5rem", marginBottom: "0.5rem" }}>
            Something went wrong
          </h1>
          <p style={{ color: "#7B8BA3", marginBottom: "1.5rem" }}>
            A critical error occurred while loading SwiftTray.
            {error.digest ? ` (Error ID: ${error.digest})` : ""}
          </p>
          <button
            onClick={reset}
            style={{
              padding: "0.75rem 1.5rem",
              borderRadius: "9999px",
              border: "none",
              background: "linear-gradient(135deg, #5DE5D5 0%, #6EC6C8 100%)",
              color: "#1A2E35",
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
