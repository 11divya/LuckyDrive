# 10 — Progressive Web App (PWA)

## Overview

LuckyDrive ships as a Progressive Web App: installable on iOS and Android home screens, with a full icon set, a Web App Manifest, theme color, and the "standalone" display mode so it feels like a native app once added to the home screen.

A service worker (offline cache, background sync) is **deliberately out of scope** for this first iteration. The manifest + icon set is enough for installability; offline behaviour can land in a later milestone.

## What Ships Today

- Square brand icon: [frontend/public/luckydrive-icon.svg](../frontend/public/luckydrive-icon.svg)
- Wordmark logo (full): [frontend/public/luckydrive-logo.svg](../frontend/public/luckydrive-logo.svg)
- Web App Manifest: [frontend/public/manifest.webmanifest](../frontend/public/manifest.webmanifest)
- Generated PNG icon set in `frontend/public/` and `frontend/public/icons/`:

  | File                              | Size    | Purpose                                  |
  |-----------------------------------|---------|------------------------------------------|
  | `favicon.ico`                     | 32×32   | Legacy favicon                           |
  | `favicon-16x16.png`               | 16×16   | Browser tab                              |
  | `favicon-32x32.png`               | 32×32   | Browser tab (HiDPI)                      |
  | `apple-touch-icon.png`            | 180×180 | iOS home screen                          |
  | `icons/icon-192.png`              | 192×192 | Android home screen (any)                |
  | `icons/icon-512.png`              | 512×512 | Splash + install prompt (any)            |
  | `icons/icon-192-maskable.png`     | 192×192 | Android adaptive icon (maskable, 70% safe zone) |
  | `icons/icon-512-maskable.png`     | 512×512 | Android adaptive icon (maskable)         |
  | `icons/og-image.png`              | 1200×630 | Open Graph share preview                |

- PWA-ready meta tags in [frontend/index.html](../frontend/index.html):
  - `theme-color: #12121e` (matches our dark palette)
  - `apple-mobile-web-app-capable: yes`
  - `apple-mobile-web-app-status-bar-style: black-translucent`
  - `apple-mobile-web-app-title: LuckyDrive`
  - manifest link, apple-touch-icon link, OG metadata

## Manifest Highlights

```json
{
  "name": "LuckyDrive",
  "short_name": "LuckyDrive",
  "start_url": "/",
  "scope": "/",
  "display": "standalone",
  "orientation": "portrait",
  "theme_color": "#12121e",
  "background_color": "#12121e",
  "categories": ["lifestyle", "shopping", "entertainment"],
  "lang": "en-ZA"
}
```

`display: standalone` removes the browser chrome on launch from the home screen. `theme_color` paints the system status bar gold-tinted dark to match the app.

## Icon Generation

The PNG set is produced by [frontend/scripts/generate-icons.mjs](../frontend/scripts/generate-icons.mjs), driven by `sharp`. Run it any time the source SVG changes:

```bash
cd frontend
npm run icons        # one-shot regeneration
npm run build        # also runs `prebuild: npm run icons` automatically
```

The script:

1. Renders the square `luckydrive-icon.svg` at high DPI (density 384) into PNGs at 16/32/48/180/192/512.
2. Produces maskable variants by rendering at 70% scale on a flat brand-colored canvas so Android can crop to any safe-zone shape (circle, rounded rect, squircle).
3. Composes a 1200×630 `og-image.png` for social shares — wordmark center, tagline below.
4. Writes a single-resolution PNG-in-ICO `favicon.ico` (modern browsers accept this; swap to `to-ico` for true multi-res later if needed).

## States & Edge Cases

- **Older iOS Safari**: no manifest support; the `apple-touch-icon` + `apple-mobile-web-app-*` meta tags carry the install experience.
- **Maskable icon clipping**: the script bakes a 15% padding safe zone so the car silhouette never gets cropped on circular Android masks.
- **Dark UI on light system theme**: `theme_color` is dark — that's intentional; we ship dark-mode-only.

## Future Enhancements

- **Service Worker**: cache shell + critical assets for offline browsing of viewed cars.
- **Push notifications**: subscribe customers to draw-result alerts (Web Push + VAPID).
- **Install Prompt**: a custom in-app prompt after the second visit ("Add LuckyDrive to your home screen for faster access").
- **Background Sync**: queue ticket purchases offline and replay when connectivity returns.
- **App Store wrappers**: ship the same PWA via Trusted Web Activity (Android) and a thin Capacitor shell (iOS) once usage justifies it.
