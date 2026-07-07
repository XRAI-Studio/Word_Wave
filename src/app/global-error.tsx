"use client";

// Catches errors in the root layout itself; must render its own <html>.
export default function GlobalError({ reset }: { error: Error; reset: () => void }) {
  return (
    <html lang="en">
      <body style={{ fontFamily: "system-ui, sans-serif", padding: "4rem", textAlign: "center" }}>
        <h1>Something went wrong</h1>
        <p>Your progress is saved locally, so nothing is lost.</p>
        <button
          onClick={() => reset()}
          style={{ marginTop: "1rem", padding: "0.5rem 1.5rem", cursor: "pointer" }}
        >
          Try again
        </button>
      </body>
    </html>
  );
}
