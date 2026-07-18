import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "WordWave — Learn Spanish",
    short_name: "WordWave",
    description: "Lessons, streaks, and spaced repetition — five minutes at a time.",
    start_url: "/learn",
    display: "standalone",
    background_color: "#faf6ee",
    theme_color: "#1e5ae8",
    icons: [
      { src: "/icon-192.png", sizes: "192x192", type: "image/png" },
      { src: "/icon-512.png", sizes: "512x512", type: "image/png" },
      { src: "/icon-maskable-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
  };
}
