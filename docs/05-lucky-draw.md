# 05 — Lucky Draw & Winner Announcement

## Overview

The lottery draw selects a single winning `Ticket` for a given car using a verifiable RNG. Once the draw runs, the winner is announced on-platform and the LuckyDrive operations team contacts them to arrange delivery.

## User Story

> As a customer, I want to see when each draw will run, watch the live countdown, and be the first to know if I won. As an admin, I want to trigger the draw on the published date with a transparent, auditable procedure.

## UX Flow (customer)

1. While the draw is open, every car page shows a live countdown to `drawDate`.
2. When the timer hits zero, the page swaps to a "Draw in progress…" banner.
3. After the admin runs the draw, the public **Winners** page (`/winners`) lists the latest results.
4. If the current user holds the winning ticket they get an in-app notification + email/SMS, and a confetti modal on next visit.

## UX Flow (admin)

1. Admin opens **Draw History** (`/admin/draws`) and selects the car whose draw is now eligible.
2. Confirms `Run Draw` in a modal (requires re-typing the car name to confirm).
3. Backend generates a verifiable seed, picks a winning ticket, persists the `Draw`, marks the car `draw_complete`, sets `Ticket.isWinner = true` on the chosen ticket, and writes a notification to the winner.
4. Admin sees the result + winner contact details and can mark the draw `delivered` after the car is handed over.

## Data Model — `Draw`

Backend file: [backend/models/Draw.js](../backend/models/Draw.js)

| Field           | Type     | Notes                                                       |
|-----------------|----------|-------------------------------------------------------------|
| `car`           | ObjectId | required, unique (one draw per car), ref `Car`              |
| `winningTicket` | ObjectId | ref `Ticket`                                                |
| `winner`        | ObjectId | ref `User`                                                  |
| `drawnAt`       | Date     |                                                             |
| `drawnBy`       | ObjectId | ref `User` (the admin who ran the draw)                     |
| `seed`          | String   | the random seed used (stored for audit / reproducibility)   |
| `status`        | String   | enum `['scheduled','completed','announced','delivered']`    |
| `notes`         | String   |                                                             |

## API Endpoints

| Method | Path                  | Auth  | Description                                           |
|--------|-----------------------|-------|-------------------------------------------------------|
| GET    | `/api/draws`          | —     | Public list of upcoming + completed draws             |
| GET    | `/api/draws/:id`      | —     | Single draw with winner public info (name initial only) |
| POST   | `/api/draws/:id/run`  | admin | Run the draw (idempotent on `Draw.status === 'completed'`) |
| POST   | `/api/draws/:id/announce` | admin | Flip `status` to `announced` (publishes to the home & winners page) |

## Draw Algorithm (planned)

1. Collect all `Ticket._id` for the car (`paymentStatus: 'paid'` only).
2. Generate seed: `sha256(carId + drawnAt.toISOString() + Math.random())`.
3. Pick index = `parseInt(seed.slice(0,12), 16) % tickets.length`.
4. Persist `seed` and `winningTicket` on the `Draw`.
5. Side-effects (in a transaction):
   - `Ticket.findByIdAndUpdate(winningTicketId, { isWinner: true })`
   - `Car.findByIdAndUpdate(carId, { status: 'draw_complete' })`
   - Send notifications to the winner.

## UI Components (planned)

- `pages/public/Winners/Winners.jsx` — public list (winner first name + initial).
- `pages/public/DrawAnnouncement/DrawAnnouncement.jsx` — single-car winner reveal page.
- `pages/admin/DrawHistory/DrawHistory.jsx` — admin draw lifecycle table with `Run Draw` action.

## States & Edge Cases

- **No paid tickets when drawing**: refuse and require admin to extend the draw.
- **Admin double-clicks Run Draw**: idempotent on `Draw.status === 'completed'`.
- **Draw runs early (admin override)**: requires `?force=true` query and an audit note.
- **Winner has deleted account**: store name + email snapshot on the `Draw` for audit.

## Future Enhancements

- Live-streamed draw with on-screen RNG reveal (chainlink VRF or commit-reveal).
- Public seed publication 24 hours before the draw for verifiable randomness.
- Winners archive page with filters (year · prize value · car model).
- "Better luck next time" credit for non-winners — partial discount on next ticket.
