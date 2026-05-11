# LuckyDrive — Feature Docs

LuckyDrive is a lottery-based car-selling platform for the South African market. Customers browse luxury cars, buy lottery tickets at a fixed price, and the winner of each car is announced on-platform on the published draw date. Admins manage the inventory, ticket sales, and the draw lifecycle.

This folder contains one document per feature. Each follows the same structure:

1. **Overview** — what the feature is, in one paragraph.
2. **User Story** — primary actor + goal.
3. **UX Flow** — step-by-step interaction.
4. **Data Model** — relevant Mongoose fields.
5. **API Endpoints** — paths, methods, request/response shapes.
6. **UI Components** — files and shared components used.
7. **States & Edge Cases** — loading, empty, error, success.
8. **Future Enhancements** — what is intentionally out of scope today.

## Glossary

| Term | Meaning |
|------|---------|
| **Draw** | The lottery event for a single car. One car = one draw. |
| **Ticket** | A single entry to a draw, owned by a `User`. |
| **Booking** | The purchase aggregate — one or more tickets for one car, paid in a single transaction. |
| **Winner** | The user holding the winning ticket after the draw is run. |
| **ZAR** | South African Rand. All amounts are stored as integers (cents) or floats (rands) and displayed as `R 1,500,000`. |

## Roles

| Role       | Description                                                                 |
|------------|-----------------------------------------------------------------------------|
| `customer` | End user. Can browse cars, buy tickets, see their dashboard, view winners. |
| `admin`    | Operations user. Manages inventory, runs draws, contacts winners.           |

## Index

| #  | Document                                              | Status         |
|----|-------------------------------------------------------|----------------|
| 01 | [Authentication](./01-authentication.md)              | Implemented UI · backend stubbed |
| 02 | [Car Catalog (Home)](./02-car-catalog.md)             | Implemented UI · backend stubbed |
| 03 | [Car Details](./03-car-details.md)                    | Implemented UI · backend stubbed |
| 04 | [Ticket Purchase](./04-ticket-purchase.md)            | Mock payments adapter              |
| 05 | [Lucky Draw](./05-lucky-draw.md)                      | Backend stub only                  |
| 06 | [Admin Inventory Management](./06-admin-inventory.md) | Implemented UI · backend stubbed |
| 07 | [Admin Overview](./07-admin-overview.md)              | Backend stub only                  |
| 08 | [Customer Dashboard](./08-customer-dashboard.md)      | Backend stub only                  |
| 09 | [Booking Tracking](./09-booking-tracking.md)          | Schema only                        |
| 10 | [PWA Installation](./10-pwa-installation.md)          | Implemented (manifest + icons)     |
| 11 | [Design System](./11-design-system.md)                | Locked (mirrors `.cursor/rules`)  |
