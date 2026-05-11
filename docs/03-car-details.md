# 03 — Car Details

## Overview

Single-car page presenting full vehicle information, image gallery, key stats, vehicle overview text, FAQ, and a sticky right rail to purchase tickets.

## User Story

> As a customer, I want to see the full car details — pictures, specs, prize value, ticket price, draw timing — and quickly choose how many tickets to buy.

## UX Flow

1. Customer arrives via `/cars/:id` (from a card or a deep link).
2. Breadcrumb: `Home / Cars / <car name>`.
3. Display title in Noto Serif (e.g. *"2024 Volkswagen Golf R"*).
4. Two-column layout:
   - **Left**: 16:10 hero image + thumbnail strip (4 thumbs, last one shows `+N more`), 4-stat row (Engine, Year, Mileage, Prize Value), Vehicle Overview text, FAQ via AntD `Collapse` ("How is the winner selected?", "Are there cash alternatives?", "When does the draw take place?").
   - **Right (sticky)**: Ticket price headline, full-block countdown (DD/HH/MIN/SEC), tickets-sold percentage, AntD `InputNumber` quantity selector, total, gold `Buy Now`, three trust icons (Secure / Audited / Verified).
5. Tapping `Buy Now`:
   - If unauthenticated → redirect to `/login` with `state.from` so the user is sent back after login.
   - If authenticated → call `POST /api/tickets/purchase` and redirect to `redirectUrl` returned by the payments adapter.
6. On mobile the rail collapses into a fixed bottom bar.

## Data Model

Same `Car` schema as the catalog (see [02-car-catalog.md](./02-car-catalog.md)) plus the optional `faq: [{ question, answer }]` array used to render the AntD `Collapse`.

## API Endpoints

| Method | Path                  | Auth | Body                            | Response                                      |
|--------|-----------------------|------|---------------------------------|-----------------------------------------------|
| GET    | `/api/cars/:id`       | —    | —                               | `Car`                                         |
| POST   | `/api/tickets/purchase` | yes | `{ carId, quantity }`           | `{ booking, redirectUrl }`                    |

## UI Components

| File | Purpose |
|------|---------|
| [frontend/src/pages/public/CarDetail/CarDetail.jsx](../frontend/src/pages/public/CarDetail/CarDetail.jsx) | Page shell + composition |
| [frontend/src/pages/public/CarDetail/CarDetail.helper.js](../frontend/src/pages/public/CarDetail/CarDetail.helper.js) | `fetchCar`, `buildBreadcrumbs`, `buildStats`, `calcTotal`, `buildPurchaseHandler` |
| [frontend/src/pages/public/CarDetail/CarGallery.jsx](../frontend/src/pages/public/CarDetail/CarGallery.jsx) | Hero + thumbs |
| [frontend/src/pages/public/CarDetail/CarStatsStrip.jsx](../frontend/src/pages/public/CarDetail/CarStatsStrip.jsx) | 4-stat row |
| [frontend/src/pages/public/CarDetail/CarFAQ.jsx](../frontend/src/pages/public/CarDetail/CarFAQ.jsx) | AntD Collapse FAQ |
| [frontend/src/pages/public/CarDetail/TicketPurchaseRail.jsx](../frontend/src/pages/public/CarDetail/TicketPurchaseRail.jsx) | Sticky right rail |

## States & Edge Cases

- **Loading**: AntD `Skeleton` for the whole page until `fetchCar` resolves.
- **Not found**: dedicated empty page ("Car not found · The draw you are looking for is no longer available.") with a back link.
- **Sold out**: `Buy Now` disabled when `ticketsSold >= totalTickets`; rail header reads "SOLD OUT".
- **Draw ended**: `CountdownTimer` shows "Draw Complete"; rail collapses into a "View Result" link.
- **Not logged in**: `Buy Now` triggers a redirect to `/login` with the current page as `state.from` for return.

## Future Enhancements

- Lightbox gallery with zoom + keyboard navigation.
- Video walkaround embed.
- Recently viewed cars rail.
- Live "X people are looking at this draw" socket presence indicator.
- Share to WhatsApp button (high signal in SA).
