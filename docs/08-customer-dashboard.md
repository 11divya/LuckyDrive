# 08 — Customer Dashboard

## Overview

The signed-in customer's home base. Greets by first name, shows three KPIs (active entries · total wins · reward points), lists their **My Active Tickets** (cars they have unresolved tickets for, with countdowns), and a **Draw History** table of every past draw they entered.

## User Story

> As a customer, I want to log in and instantly see which draws I'm in, how long until each one closes, what I've won in the past, and how many tickets I'm holding for each car.

## UX Flow

1. After login, customer routes to `/dashboard` (or follows a deep-link redirect).
2. Greeting: *"Welcome back, Alex."* + subtitle "Here's an overview of your active entries and past performances".
3. Three KPI tiles: `ACTIVE ENTRIES`, `TOTAL WINS`, `REWARD POINTS`.
4. **My Active Tickets** — horizontal scroll on mobile, 2-column grid on desktop:
   - Each tile shows car image, status pill (`CLOSING SOON`), name, prize value, "DRAW IN: 02d 14h 30m", and the customer's ticket numbers (`#LD-6492, #LD-6493`).
5. Side panel: "No Wins Yet — Your garage is waiting for its first masterpiece. Keep playing to increase your chances." + `Browse New Cars` CTA. Plus an `Account Settings` shortcut card (Profile Information, Payment Methods).
6. **Draw History** — full-width AntD table: Draw Date · Prize · Ticket Number · Status pill (`Draw Complete`).

## Data Model

Aggregates over existing `Ticket`, `Booking`, `Draw`, `Car` documents — no new schema.

## API Endpoints

| Method | Path                  | Auth     | Description                                        |
|--------|-----------------------|----------|----------------------------------------------------|
| GET    | `/api/users/me/dashboard` | customer | Single call: KPIs + active tickets + draw history |
| GET    | `/api/tickets/me`     | customer | All tickets for the current user                   |

Suggested response:

```ts
{
  kpis: { activeEntries, totalWins, rewardPoints },
  activeTickets: [{ car: { id, name, image, prizeValue, drawDate, status }, ticketCodes: [...] }],
  drawHistory:   [{ id, drawDate, car: { name, image, prizeValue }, ticketCode, status, isWinner }]
}
```

## UI Components (planned)

| File | Purpose |
|------|---------|
| `pages/customer/Dashboard/Dashboard.jsx` | Page shell |
| `pages/customer/Dashboard/Dashboard.helper.js` | Fetch + transforms |
| `pages/customer/Dashboard/ActiveTicketCard.jsx` | One active-ticket tile |
| `pages/customer/Dashboard/DrawHistoryTable.jsx` | Past draws table |
| `components/StatCard.jsx` | Shared KPI tile |

## States & Edge Cases

- **No tickets yet**: empty state for both panels with prompts to browse.
- **Pending booking**: a row in `My Active Tickets` shows a `PAYMENT PENDING` chip and a `Complete Payment` link.
- **Won a draw**: row gets a gold `WINNER` ribbon and a "Schedule Delivery" CTA that contacts ops.
- **Failed payment**: row in Draw History shows `PAYMENT FAILED` with a retry option.

## Future Enhancements

- Ticket QR codes (downloadable, scannable on draw-day livestream).
- Reward-points redemption (free entries, swag).
- Referral program tile.
- Push notification opt-in card on first visit (PWA install).
