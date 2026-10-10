"use client";

import { ThemeSync } from "@/components/theme-sync";
import { ERROR_PAGE_STYLE } from "@/lib/error-page-style";
import { THEME_HEAD_SCRIPT } from "@/lib/theme-head-script";

// Catches errors in the root layout itself; must render its own <html>. It replaces the root
// layout and globals.css, so it carries the head script (a server-rendered error), ThemeSync
// (a client-rendered one) and its own styles keyed to data-theme (class standard section 6).
// The static production 500 page is src/pages/500.tsx, with the same styles.
export default function GlobalError({ reset }: { error: Error; reset: () => void }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: THEME_HEAD_SCRIPT }} />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <style dangerouslySetInnerHTML={{ __html: ERROR_PAGE_STYLE }} />
      </head>
      <body>
        <ThemeSync />
        <h1>Something went wrong</h1>
        <p>Your progress is saved locally, so nothing is lost.</p>
        <button type="button" className="action" onClick={() => reset()}>
          Try again
        </button>
      </body>
    </html>
  );
}
