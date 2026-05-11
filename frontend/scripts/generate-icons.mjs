// Generate the full LuckyDrive PWA icon set from luckydrive-icon.svg.
// Run with `node scripts/generate-icons.mjs` (sharp must be installed).

import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';
import sharp from 'sharp';

const __dirname = dirname(fileURLToPath(import.meta.url));
const PUBLIC_DIR = resolve(__dirname, '..', 'public');
const ICONS_DIR = resolve(PUBLIC_DIR, 'icons');

const SRC_ICON = resolve(PUBLIC_DIR, 'luckydrive-icon.svg');
const SRC_LOGO = resolve(PUBLIC_DIR, 'luckydrive-logo.svg');

const BRAND_BG = '#12121e';

const TARGETS = [
  { name: 'favicon-16x16.png',      size: 16,  dir: PUBLIC_DIR },
  { name: 'favicon-32x32.png',      size: 32,  dir: PUBLIC_DIR },
  { name: 'favicon-48x48.png',      size: 48,  dir: ICONS_DIR  },
  { name: 'apple-touch-icon.png',   size: 180, dir: PUBLIC_DIR },
  { name: 'icon-192.png',           size: 192, dir: ICONS_DIR  },
  { name: 'icon-512.png',           size: 512, dir: ICONS_DIR  },
];

const MASKABLE_TARGETS = [
  { name: 'icon-192-maskable.png',  size: 192 },
  { name: 'icon-512-maskable.png',  size: 512 },
];

async function ensureDirs() {
  await mkdir(ICONS_DIR, { recursive: true });
}

async function renderIcon(svgBuffer, size, outFile) {
  await sharp(svgBuffer, { density: 384 })
    .resize(size, size, { fit: 'contain', background: BRAND_BG })
    .png()
    .toFile(outFile);
  console.log(`  ✓ ${outFile.split('/').slice(-2).join('/')}  (${size}x${size})`);
}

async function renderMaskable(svgBuffer, size, outFile) {
  // Maskable icons need a safe zone: the visible content should fit in a
  // centered circle of ~80% diameter. We render the icon at 70% of the canvas
  // and pad with the brand background on a flat full-bleed square.
  const inner = Math.round(size * 0.7);
  const innerBuffer = await sharp(svgBuffer, { density: 384 })
    .resize(inner, inner, { fit: 'contain', background: BRAND_BG })
    .png()
    .toBuffer();

  await sharp({
    create: {
      width: size,
      height: size,
      channels: 4,
      background: BRAND_BG,
    },
  })
    .composite([{ input: innerBuffer, gravity: 'center' }])
    .png()
    .toFile(outFile);
  console.log(`  ✓ ${outFile.split('/').slice(-2).join('/')}  (${size}x${size}, maskable)`);
}

async function renderFaviconIco(svgBuffer) {
  // sharp can't write multi-resolution .ico directly; embed a single 32x32 PNG
  // renamed as .ico — modern browsers accept this. (For a true multi-res .ico,
  // swap to the `to-ico` package later.)
  const png32 = await sharp(svgBuffer, { density: 384 })
    .resize(32, 32, { fit: 'contain', background: BRAND_BG })
    .png()
    .toBuffer();
  await writeFile(resolve(PUBLIC_DIR, 'favicon.ico'), png32);
  console.log('  ✓ favicon.ico  (32x32 PNG-in-ICO)');
}

async function renderOgImage(logoSvgBuffer) {
  const W = 1200;
  const H = 630;
  const logoTargetH = 220;
  const logoBuffer = await sharp(logoSvgBuffer, { density: 320 })
    .resize({ height: logoTargetH, fit: 'contain', background: BRAND_BG })
    .png()
    .toBuffer();

  const subtitle = `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}">
    <rect width="100%" height="100%" fill="${BRAND_BG}"/>
    <text x="${W / 2}" y="${H - 90}" text-anchor="middle"
          font-family="Manrope, system-ui, sans-serif" font-size="28" font-weight="500"
          fill="#d6c4ac" letter-spacing="4">SOUTH AFRICA'S PREMIER LUXURY CAR DRAW</text>
    <text x="${W / 2}" y="${H - 50}" text-anchor="middle"
          font-family="Manrope, system-ui, sans-serif" font-size="20" font-weight="400"
          fill="#9f8e79">luckydrive.co.za</text>
  </svg>`;

  await sharp(Buffer.from(subtitle))
    .composite([{ input: logoBuffer, gravity: 'center' }])
    .png()
    .toFile(resolve(ICONS_DIR, 'og-image.png'));
  console.log('  ✓ icons/og-image.png  (1200x630)');
}

async function main() {
  await ensureDirs();
  const iconSvg = await readFile(SRC_ICON);
  const logoSvg = await readFile(SRC_LOGO);

  console.log('\nGenerating PWA icon set from luckydrive-icon.svg…\n');

  for (const t of TARGETS) {
    await renderIcon(iconSvg, t.size, resolve(t.dir, t.name));
  }

  for (const t of MASKABLE_TARGETS) {
    await renderMaskable(iconSvg, t.size, resolve(ICONS_DIR, t.name));
  }

  await renderFaviconIco(iconSvg);
  await renderOgImage(logoSvg);

  console.log('\nDone. All icons written to frontend/public/ and frontend/public/icons/.\n');
}

main().catch((err) => {
  console.error('\nIcon generation failed:', err);
  process.exit(1);
});
