# 04 — Ticket Purchase

## Overview

The purchase flow turns a quantity selection on the Car Detail page into a `Booking` record and redirects the user to a payment provider's checkout. Payment confirmation flips the booking to `paid` and mints individual `Ticket` documents (one per ticket purchased).

In the current scaffold, payments go through a `PaymentsAdapter` interface backed by a `MockProvider` that always succeeds. The adapter is designed so swapping in PayFast, Yoco, or Stripe later is a one-file change.

## User Story

> As a customer, I want to buy one or more tickets for a specific car in a single transaction, get a clear receipt, and see my tickets in my dashboard.

## UX Flow

1. On `/cars/:id` the customer picks `quantity` and taps **Buy Now**.
2. Frontend calls `POST /api/tickets/purchase`.
3. Backend creates a `Booking` (status `pending`), reserves `quantity` against the car's `totalTickets`, then calls `PaymentsAdapter.createCheckout({ booking, returnUrl, cancelUrl })`.
4. The adapter returns `{ redirectUrl, providerRef }`. The booking stores `providerRef`.
5. Frontend redirects the browser to `redirectUrl`.
6. After payment the provider redirects back to `returnUrl?ref=<providerRef>`.
7. The frontend reads `ref`, calls `POST /api/tickets/confirm` (or the webhook fires server-to-server). Backend:
   - Calls `PaymentsAdapter.confirmPayment(providerRef)`.
   - On `paid`: marks booking `paid`, increments `Car.ticketsSold`, mints `quantity` × `Ticket` docs with unique `code` (e.g. `LD-6492`), pushes them onto `booking.tickets`.
   - On `failed`: marks booking `failed`, no tickets minted.
8. Customer is shown a success screen with the ticket numbers.

## Data Model

### `Booking` — see [backend/models/Booking.js](../backend/models/Booking.js)

| Field             | Type     | Notes                                                |
|-------------------|----------|------------------------------------------------------|
| `user`            | ObjectId | required, ref `User`                                 |
| `car`             | ObjectId | required, ref `Car`                                  |
| `quantity`        | Number   | required, min 1                                      |
| `unitPrice`       | Number   | required (snapshot at time of purchase)              |
| `totalAmount`     | Number   | required                                             |
| `currency`        | String   | default `'ZAR'`                                      |
| `paymentStatus`   | String   | enum `['pending','paid','failed','refunded']`        |
| `paymentProvider` | String   | default `'mock'`                                     |
| `providerRef`     | String   | indexed                                              |
| `paidAt`          | Date     |                                                      |
| `tickets`         | [ObjectId] | refs `Ticket`                                      |

### `Ticket` — see [backend/models/Ticket.js](../backend/models/Ticket.js)

| Field         | Type     | Notes                              |
|---------------|----------|------------------------------------|
| `code`        | String   | required, unique, indexed (`LD-6492`) |
| `car`         | ObjectId | required, ref `Car`                 |
| `user`        | ObjectId | required, ref `User`                |
| `booking`     | ObjectId | required, ref `Booking`             |
| `isWinner`    | Boolean  | default false, indexed              |
| `purchasedAt` | Date     | default `Date.now`                  |

## API Endpoints

| Method | Path                       | Auth     | Body                         | Response                                            |
|--------|----------------------------|----------|------------------------------|-----------------------------------------------------|
| POST   | `/api/tickets/purchase`    | customer | `{ carId, quantity }`        | `{ booking, redirectUrl }`                          |
| POST   | `/api/tickets/confirm`     | customer | `{ providerRef }`            | `{ booking, tickets }` (future)                     |
| POST   | `/api/payments/webhook`    | none     | raw                          | `200 OK` after `verifyWebhook` (future)             |
| GET    | `/api/tickets/me`          | customer | —                            | `[Ticket...]` for the current user                  |

## Payments Adapter

Defined in [backend/services/payments/index.js](../backend/services/payments/index.js):

```js
PaymentsAdapter.createCheckout({ booking, returnUrl, cancelUrl }) // → { redirectUrl, providerRef }
PaymentsAdapter.confirmPayment(providerRef)                       // → { status, amount? }
PaymentsAdapter.verifyWebhook(req)                                // → { event, data }
```

The provider is selected by `PAYMENTS_PROVIDER` env var. Today only `mock` is implemented ([backend/services/payments/mock.provider.js](../backend/services/payments/mock.provider.js)) — it always returns `paid` after a noop delay so the rest of the flow can be tested end-to-end.

## UI Components

- [frontend/src/pages/public/CarDetail/TicketPurchaseRail.jsx](../frontend/src/pages/public/CarDetail/TicketPurchaseRail.jsx) — quantity + Buy Now.
- [frontend/src/pages/public/CarDetail/CarDetail.helper.js](../frontend/src/pages/public/CarDetail/CarDetail.helper.js) — `buildPurchaseHandler` and total math.

## States & Edge Cases

- **Quantity above remaining**: backend rejects with `400 — only N tickets remaining`; UI surfaces toast and clamps the input.
- **Concurrent oversell**: backend uses `findOneAndUpdate` with an atomic `$inc` guarded by `ticketsSold + qty <= totalTickets`. If guard fails → `409 Conflict`.
- **Payment failed / cancelled**: booking moves to `failed`; reserved tickets are released; UI shows retry option.
- **Webhook arrives late**: idempotent on `providerRef` — second call is a no-op.
- **Refund after draw**: reduces `ticketsSold` only if draw hasn't run; otherwise admin handles manually.

## Future Enhancements

- Wire up PayFast as the first real provider (SA-native, ITN webhook).
- Add Yoco card-form embed for inline checkout.
- Apple Pay / Samsung Pay via Stripe (international).
- Promo codes / first-ticket discount.
- Email + WhatsApp ticket receipts (with QR codes for the actual draw).
