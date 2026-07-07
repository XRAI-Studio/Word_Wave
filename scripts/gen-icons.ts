/* One-off generator for PWA icons: renders the LingoDuo mark (rounded brand
 * square with a white "L") at the sizes Android/Chrome and iOS expect.
 * Run: npx tsx scripts/gen-icons.ts
 */
import path from "node:path";
import sharp from "sharp";

const BRAND = "#1e5ae8";
const BRAND_DEEP = "#1743ae";

// maskable icons need the mark inside the central 80% safe zone
function svg(size: number, opts: { radius: number; pad: number }) {
  const glyphSize = size - opts.pad * 2;
  return Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}">
  <rect width="${size}" height="${size}" rx="${opts.radius}" fill="${BRAND}"/>
  <rect y="${size * 0.9}" width="${size}" height="${size * 0.1}" rx="${opts.radius / 3}" fill="${BRAND_DEEP}"/>
  <text x="50%" y="54%" dominant-baseline="central" text-anchor="middle"
        font-family="Arial, Helvetica, sans-serif" font-weight="800"
        font-size="${glyphSize * 0.72}" fill="#ffffff">L</text>
</svg>`);
}

async function main() {
  const pub = path.join(process.cwd(), "public");
  const targets = [
    { file: "icon-192.png", size: 192, radius: 42, pad: 20 },
    { file: "icon-512.png", size: 512, radius: 112, pad: 52 },
    // full-bleed square; the launcher applies its own mask
    { file: "icon-maskable-512.png", size: 512, radius: 0, pad: 110 },
    { file: "apple-touch-icon.png", size: 180, radius: 0, pad: 20 },
  ];
  for (const t of targets) {
    await sharp(svg(t.size, t)).png().toFile(path.join(pub, t.file));
    console.log("wrote", t.file);
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
