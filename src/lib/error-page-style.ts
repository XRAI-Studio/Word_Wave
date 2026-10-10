/**
 * Self-contained styles for the pages that render outside the root layout and globals.css:
 * src/app/global-error.tsx and the static production 500 page (src/pages/500.tsx). Both
 * themes key off the data-theme the head script sets (class standard section 6), never the
 * OS media query: 16 px text, a 44 px action, the LingoDuo paper, ink and brand colours.
 */
export const ERROR_PAGE_STYLE = `
body { margin: 0; min-height: 100vh; box-sizing: border-box; padding: 4rem 1.5rem; text-align: center;
  font: 16px/1.5 system-ui, sans-serif; background: #faf6ee; color: #232a3d; overflow-wrap: anywhere; }
h1 { font-size: 1.5rem; }
p { font-size: 1rem; color: #5d6378; }
.action { display: inline-flex; align-items: center; justify-content: center; box-sizing: border-box;
  min-height: 44px; min-width: 44px; margin-top: 1rem; padding: 0.5rem 1.5rem; cursor: pointer;
  font: 700 1rem system-ui, sans-serif; border: 0; border-radius: 1rem; background: #1e5ae8; color: #ffffff;
  text-decoration: none; }
.action:focus-visible { outline: 2px solid #1e5ae8; outline-offset: 2px; }
:root[data-theme="dark"] { color-scheme: dark; }
:root[data-theme="dark"] body { background: #131a29; color: #edf0f7; }
:root[data-theme="dark"] p { color: #a9b1c5; }
:root[data-theme="dark"] .action:focus-visible { outline-color: #8db2ff; }
`;
