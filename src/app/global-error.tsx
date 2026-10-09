"use client";

import { ThemeSync } from "@/components/theme-sync";
import { THEME_HEAD_SCRIPT } from "@/lib/theme-head-script";

// Both themes, keyed to the data-theme the head script sets: this page replaces the root
// layout, so neither globals.css nor its tokens are loaded (class standard section 6).
const STYLE = `
body { margin: 0; padding: 4rem 1.5rem; text-align: center; font-family: system-ui, sans-serif;
  font-size: 1rem; line-height: 1.5; background: #faf6ee; color: #232a3d; }
p { color: #5d6378; }
button { margin-top: 1rem; min-height: 2.75rem; padding: 0.5rem 1.5rem; cursor: pointer; font: inherit;
  font-weight: 700; border: 0; border-radius: 1rem; background: #1e5ae8; color: #ffffff; }
button:focus-visible { outline: 2px solid #1e5ae8; outline-offset: 2px; }
:root[data-theme="dark"] { color-scheme: dark; }
:root[data-theme="dark"] body { background: #131a29; color: #edf0f7; }
:root[data-theme="dark"] p { color: #a9b1c5; }
:root[data-theme="dark"] button:focus-visible { outline-color: #8db2ff; }
`;

// Catches errors in the root layout itself; must render its own <html>.
export default function GlobalError({ reset }: { error: Error; reset: () => void }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: THEME_HEAD_SCRIPT }} />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <style dangerouslySetInnerHTML={{ __html: STYLE }} />
      </head>
      <body>
        <ThemeSync />
        <h1>Something went wrong</h1>
        <p>Your progress is saved locally, so nothing is lost.</p>
        <button type="button" onClick={() => reset()}>
          Try again
        </button>
      </body>
    </html>
  );
}
