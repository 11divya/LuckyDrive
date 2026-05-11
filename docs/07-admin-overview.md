# 07 — Admin Overview Dashboard

## Overview

The admin landing screen — KPI tiles + draw-status grid + recent bookings rail — a one-glance answer to "How is the business doing right now?" Mirrors the Stitch "Admin Overview - Classic Sleek" reference.

## User Story

> As an admin, I want a single screen that shows revenue, tickets sold, active draws, total users, the status of every active draw, and the most recent bookings so I can spot anomalies and make decisions fast.

## UX Flow

1. Admin logs in → routed to `/admin` → redirected to `/admin/inventory` today, but `/admin/dashboard` will be the new default once this page ships.
2. Header: `Overview · Real-time performance metrics and system activity` + a `LAST 30 DAYS` segmented control (today, 7d, 30d, custom).
3. Row of 4 KPI tiles:
   - **TOTAL REVENUE** — `R 1,245,000` + `↑ 12.5% from last month` in green.
   - **TICKETS SOLD** — `12,450` + delta.
   - **ACTIVE DRAWS** — `3` + "Across 2 categories".
   - **TOTAL USERS** — `8,920` + `↑ 154 new this week`.
4. Two-column body:
   - **Draw Status** card (left, wider): a list of every active draw with thumbnail, name, draw date, sales-progress bar, percentage, and a status pill (`HIGH DEMAND` / `ACTIVE` / `CLOSING SOON`).
   - **Recent Bookings** rail (right): a vertical timeline of the last ~5 bookings — avatar dot, "John Doe purchased 5 tickets for Audi RS6", relative time.

## Data Model

No new schema — the dashboard is an aggregation over `Booking`, `Car`, `User`. A future `AdminMetric` collection could cache pre-computed daily snapshots.

## API Endpoints

| Method | Path                       | Auth  | Description                                             |
|--------|----------------------------|-------|---------------------------------------------------------|
| GET    | `/api/admin/overview`      | admin | KPI tiles + draw status + recent bookings (single call) |
| GET    | `/api/admin/overview?range=7d` | admin | Same, scoped to a window                            |

Response shape (from [backend/routes/admin.routes.js](../backend/routes/admin.routes.js)):

```ts
{
  kpis: { totalRevenueZAR, ticketsSold, activeDraws, totalUsers },
  drawStatus: [{ id, car, drawDate, ticketsSold, totalTickets, status }],
  recentBookings: [{ id, userName, quantity, car, when }]
}
```

## UI Components (planned)

| File | Purpose |
|------|---------|
| `pages/admin/Overview/Overview.jsx` | Page shell |
| `pages/admin/Overview/Overview.helper.js` | `fetchOverview`, KPI formatters |
| `components/StatCard.jsx` | KPI tile (label + big number + delta chip) |
| `components/DrawStatusList.jsx` | Draw progress list |
| `components/RecentBookingsRail.jsx` | Timeline rail |

## States & Edge Cases

- **Loading**: KPI tiles render as `Skeleton.Avatar`; lists render as `Skeleton.List`.
- **Empty**: "No bookings in the last 30 days" placeholder for the rail.
- **Timezone**: all dates stored UTC, rendered in `Africa/Johannesburg` for SA admins.
- **Big numbers**: thousands separators with `.toLocaleString('en-ZA')`; revenue uses `formatZAR(amount, { compact: true })` above R 1M.

## Future Enhancements

- Sparkline chart per KPI (last 30 days).
- Funnel from "viewed car detail" → "started checkout" → "paid".
- Anomaly badges (e.g. "Today's revenue is −40% vs 7-day average").
- Real-time updates over WebSocket / SSE.
