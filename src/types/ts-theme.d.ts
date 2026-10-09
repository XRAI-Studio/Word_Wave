// The head script (src/lib/theme-head-script.ts) defines window.TSTheme; ThemeSync calls it.
export {};

declare global {
  interface Window {
    TSTheme?: { apply: () => void };
  }
}
