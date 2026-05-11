# 02 — Car Catalog (Home / Browse Cars)

## Overview

The public landing page that introduces the brand and surfaces the **Featured Draws** — a grid of `<CarCard>`s, each showing the prize value, sales-progress bar, live countdown to the draw, ticket price, and an `Enter Now` CTA.

## User Story

> As a visitor, I want to instantly see which cars are available, how much a ticket costs, how many tickets are left, and how soon the draw closes so I can decide whether to buy in.

## UX Flow

1. Visitor lands on `/`.
2. Hero panel:
   - Eyebrow `★ SOUTH AFRICA'S PREMIER LUXURY CAR DRAW`.
   - H1 in Noto Serif: *"Win Your Dream Car Today."* with `Today.` highlighted gold.
   - Two CTAs: `Browse Live Draws` (primary), `How It Works` (secondary).
   - Hero car image on the right.
3. **Featured Draws** — 3-up grid (responsive: 1 col mobile, 2 tablet, 3 desktop).
4. Each card shows: image, optional `CLOSING SOON` pill, name, prize value, sales progress, countdown strip, price/ticket, gold `Enter Now` button.
5. Clicking `Enter Now` (or any card body interaction) routes to `/cars/:id`.
6. **How It Works** — four-step grid below the fold.

## Data Model — `Car` (relevant fields)

Backend file: [backend/models/Car.js](../backend/models/Car.js)

| Field          | Type     | Notes                                                         |
|----------------|----------|---------------------------------------------------------------|
| `name`         | String   | required, indexed                                             |
| `images`       | [String] | first image is the hero in card + detail                      |
| `prizeValue`   | Number   | required, ZAR                                                 |
| `ticketPrice`  | Number   | required, ZAR                                                 |
| `totalTickets` | Number   | required                                                      |
| `ticketsSold`  | Number   | default 0                                                     |
| `drawDate`     | Date     | required, indexed                                             |
| `status`       | String   | enum `['draft','active','closing_soon','draw_complete','delivered']` |
| `salesProgress` | Virtual | `min(100, ticketsSold/totalTickets * 100)`                    |

## API Endpoints

| Method | Path            | Query              | Response (data)                                      |
|--------|-----------------|--------------------|------------------------------------------------------|
| GET    | `/api/cars`     | `page`, `limit`    | `[Car...]` + `meta: { page, limit, total }`         |
| GET    | `/api/cars/:id` | —                  | `Car`                                                |

The frontend currently falls back to [frontend/src/data/demoCars.js](../frontend/src/data/demoCars.js) when the API returns 501 so the UI is alive without a database.

## UI Components

| File | Purpose |
|------|---------|
| [frontend/src/pages/public/Home/Home.jsx](../frontend/src/pages/public/Home/Home.jsx) | Page shell |
| [frontend/src/pages/public/Home/Home.helper.js](../frontend/src/pages/public/Home/Home.helper.js) | `fetchHomeData`, `HOW_IT_WORKS` |
| [frontend/src/components/CarCard.jsx](../frontend/src/components/CarCard.jsx) | Card layout |
| [frontend/src/components/CountdownTimer.jsx](../frontend/src/components/CountdownTimer.jsx) | Compact countdown |
| [frontend/src/components/SalesProgress.jsx](../frontend/src/components/SalesProgress.jsx) | Gold progress bar |
| [frontend/src/components/Navbar.jsx](../frontend/src/components/Navbar.jsx) | Top nav |
| [frontend/src/components/Footer.jsx](../frontend/src/components/Footer.jsx) | Footer |

## States & Edge Cases

- **Loading**: 3 AntD `Skeleton` cards rendered in the grid until data arrives.
- **Empty**: when no cars match (no draws scheduled), a centered empty state with an icon + "No active draws — check back soon" + a `Notify Me` CTA.
- **API 501 fallback**: helper falls back to `demoCars` so the home page is never blank.
- **Expired draw**: countdown switches to "Draw Complete" pill; `Enter Now` becomes `View Result`.

## Future Enhancements

- Filter chips (price range, make, year, status).
- Sorting (Closing Soon · Newest · Highest Prize · Most Tickets Sold).
- Infinite scroll or paginator.
- "Notify me" email capture for sold-out draws.
- Personalized recommendations once auth is in place (based on past entries).
