# 11 — Design System

Public mirror of [`.cursor/rules/design-system.mdc`](../.cursor/rules/design-system.mdc) — the AI agent rules file is intentionally git-ignored, so this document is the long-lived source for human readers, designers, and onboarding engineers.

## Identity

LuckyDrive's visual language is **Premium High-Tech Lottery** — sleek, modern, authoritative — calibrated for a South African audience that wants a luxury-club feel rather than a casual gaming site. The aesthetic comes from the Stitch project "Classic Sleek" theme and the LuckyDrive brand SVG.

- **Mood**: dark luxury · vibrant gold accent · premium-but-secure.
- **Mode**: dark only. Light mode is not supported.
- **Inspiration**: high-performance automotive dashboards, premium fintech, members-only clubs.

## Color Palette

| Token                  | Hex      | Usage                                                  |
|------------------------|----------|--------------------------------------------------------|
| `dark.DEFAULT`         | `#12121e`| Page background                                        |
| `dark.50`              | `#1a1a27`| Subtle inset (admin sidebar)                           |
| `dark.100`             | `#1f1e2b`| Cards, surface containers                              |
| `dark.200`             | `#292936`| Inputs, table-row hover, countdown chip                |
| `dark.300`             | `#343341`| Highest elevation                                      |
| `dark.400`             | `#383846`|                                                        |
| `primary.DEFAULT`      | `#f0a500`| Gold — all CTAs, active states, countdown digits       |
| `primary.light`        | `#ffc56c`| Hover/focus tint                                       |
| `primary.dim`          | `#ffba44`|                                                        |
| `primary.fixed`        | `#ffddaf`| Subtle gold fill                                       |
| `outline.DEFAULT`      | `#9f8e79`| Visible separators                                     |
| `outline.variant`      | `#514533`| Subtle separators, card borders                        |
| `text.DEFAULT`         | `#e3e0f2`| Body text on dark surfaces                             |
| `text.muted`           | `#d6c4ac`| Captions, helper text, table headers                   |
| `success`              | `#22c55e`|                                                        |
| `warning`              | `#f59e0b`|                                                        |
| `danger`               | `#ffb4ab`|                                                        |

These tokens are the only allowed color references. Raw hex / RGB values are forbidden in JSX and CSS. They are codified in:

- [frontend/tailwind.config.js](../frontend/tailwind.config.js) — Tailwind theme.
- [frontend/src/theme.js](../frontend/src/theme.js) — Ant Design 5 `ConfigProvider` theme.

## Typography

- **Body / UI default**: Manrope (`font-sans`).
- **Display / hero / section headings**: Noto Serif (`.font-display`).
- **Labels / chips / table headers**: uppercase Manrope 14px / `0.05em` tracking / 700 weight (`.font-label-bold`).
- **Numeric data** (countdowns, ticket counts, prices): always with `tabular-nums` so digits don't jiggle.

Custom Tailwind size scale:

| Class            | Size   | Use                              |
|------------------|--------|----------------------------------|
| `text-display-xl` | 60px  | Hero headline                    |
| `text-headline-lg` | 48px | Page title                       |
| `text-headline-md` | 32px | Section heading                  |
| `text-headline-sm` | 24px | Sub-section heading              |
| `text-body-lg`    | 18px  | Lead paragraph                   |
| `text-body-md`    | 16px  | Default body                     |
| `text-label-bold` | 14px  | Labels, pills                    |
| `text-caption`    | 12px  | Helper text                      |

Google Fonts loaded in `index.html`:

```html
<link href="https://fonts.googleapis.com/css2?family=Manrope:wght@400;500;600;700&family=Noto+Serif:wght@400;600;700&display=swap" rel="stylesheet">
```

## Radius

| Token | Value   | Use                         |
|-------|---------|-----------------------------|
| `rounded-sm` | 4px | Pills, tiny chips           |
| `rounded`    | 8px | Buttons, inputs (matches AntD `borderRadius: 8`) |
| `rounded-xl` | 12px | Sub-cards, panels          |
| `rounded-2xl`| 16px | Cards, modals, login card  |
| `rounded-full` | 9999px | Status pills only         |

## Spacing

8-px scale only (Tailwind `p-2`/`p-4`/`p-6`/`p-8`/`gap-6`/`py-12`/`py-20`). Container width: `max-w-[1280px] mx-auto px-4 md:px-6` via the `.ld-container` utility.

## Surfaces & Elevation

| Level | Recipe                                                                                 | Use                       |
|-------|----------------------------------------------------------------------------------------|---------------------------|
| 0     | `bg-dark`                                                                              | Page background           |
| 1     | `bg-dark-100 border border-outline-variant/30 rounded-xl shadow-card` (`.ld-card`)     | Cards                     |
| 2     | `bg-dark-200`                                                                          | Inputs, hover, countdown  |
| 3     | `bg-dark-300`                                                                          | Highest accents           |

`shadow-card` = `0 12px 30px rgba(0, 0, 0, 0.30)`.

## Component Recipes

### Primary CTA

Rendered through the shared `<Button>` (wraps AntD `Button`). Variants:

| Variant     | Visual                                | Use                            |
|-------------|---------------------------------------|--------------------------------|
| `primary`   | Solid gold fill, dark text            | Default for every CTA          |
| `secondary` | Transparent, outline border           | Lower-priority alternative CTA |
| `ghost`     | Transparent, no border, muted text    | Tertiary actions               |

### Status Pills

| Status            | Recipe                                         |
|-------------------|------------------------------------------------|
| `ACTIVE DRAW`     | `bg-primary text-dark`                         |
| `CLOSING SOON`    | `bg-primary/15 text-primary border-primary/30` |
| `DRAW COMPLETE`   | `bg-dark-200 text-text-muted`                  |
| `DELIVERED`       | `bg-success/20 text-success border-success/40` |

### Countdown Timer

The single `<CountdownTimer>` component is the only place countdown UI lives. Two variants:

- `compact` — inline gold strip (used on `<CarCard>`).
- `block` — labelled DD/HH/MIN/SEC tiles (used on the Car Detail rail).

### Sales Progress

`<SalesProgress sold={x} total={y} />` — gold fill on `bg-dark-200` track. With or without the `sold/goal` labels on top.

## Iconography

- `@ant-design/icons` for admin / forms / table actions.
- `lucide-react` for marketing & public surfaces.
- Don't mix the two in the same component.

## Drift Prevention

Before merging a new component, check:

1. No raw hex anywhere in JSX/CSS — only token classes and AntD theme.
2. Headlines use `.font-display`; everything else uses default Manrope.
3. Spacing on the 8-px scale.
4. CTAs go through the shared `<Button>`.
5. Status indicators use the canonical pills above.
6. Numeric/countdown text has `tabular-nums`.
7. Icons come from one library per component.
8. No `style={{}}` overrides on AntD components except where called out in the rules.

If you genuinely need a token that doesn't exist yet, add it here and to `tailwind.config.js` + `theme.js` first, then use it.
