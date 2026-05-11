# 06 — Admin Inventory Management

## Overview

The admin's primary workspace. Lists every car with thumbnail, ID, prize value, ticket price, sales-progress bar, status pill, and per-row actions (edit, view public page). Includes search, status-tab filter (All / Active / Completed), and a `+ New Listing` CTA.

## User Story

> As an admin, I want to see every car at a glance, sort them by status, search by model or ID, and edit any listing's pricing, images, or draw schedule without reloading the page.

## UX Flow

1. Admin logs in → routed to `/admin` → redirected to `/admin/inventory` (the default tab).
2. Page header: title `Car Inventory`, subtitle, search input on the right, `Filter` button.
3. Tabs row: **All Cars · Active Draws · Completed**, plus a `+ New Listing` button on the far right.
4. AntD `Table` lists cars with columns:
   - **VEHICLE DETAILS** — thumbnail + name + `ID: LD-XXXX · Color`.
   - **PRIZE VALUE** — display font, ZAR.
   - **TICKET PRICE** — small, neutral.
   - **SALES PROGRESS** — `pct% · sold/goal` + a gold mini progress bar.
   - **STATUS** — `Active Draw` (gold solid pill) / `Closing Soon` (gold soft) / `Draw Complete` (muted).
   - **ACTIONS** — edit (pencil) + view (eye) icon buttons.
5. Edit opens a modal/route with the full form; create opens the same form pre-filled with sensible defaults.
6. Pagination footer: 10 rows per page, "Showing 1 to 3 of 42 entries" + Prev/Next.

## Data Model

Same `Car` schema documented in [02-car-catalog.md](./02-car-catalog.md). Admin endpoints expose all fields (inc. `draft` status), public endpoints only expose `active` / `closing_soon` / `draw_complete`.

## API Endpoints

| Method | Path                    | Auth  | Description                                  |
|--------|-------------------------|-------|----------------------------------------------|
| GET    | `/api/admin/cars`       | admin | Paginated list with all fields               |
| POST   | `/api/admin/cars`       | admin | Create car                                   |
| PUT    | `/api/admin/cars/:id`   | admin | Update car (validates status transitions)    |
| DELETE | `/api/admin/cars/:id`   | admin | Soft-delete (sets `status: 'archived'`)      |
| POST   | `/api/admin/cars/:id/images` | admin | Upload car images (future, multipart) |

The validation chain is `authenticate → authorize('admin') → carValidation.create → handleValidationErrors → asyncHandler`.

## UI Components

| File | Purpose |
|------|---------|
| [frontend/src/pages/admin/ManageInventory/ManageInventory.jsx](../frontend/src/pages/admin/ManageInventory/ManageInventory.jsx) | Page shell |
| [frontend/src/pages/admin/ManageInventory/ManageInventory.helper.js](../frontend/src/pages/admin/ManageInventory/ManageInventory.helper.js) | `fetchInventory`, `filterByTab`, `filterBySearch`, `TAB_ITEMS` |
| [frontend/src/pages/admin/ManageInventory/inventoryColumns.jsx](../frontend/src/pages/admin/ManageInventory/inventoryColumns.jsx) | Column definitions |
| [frontend/src/pages/_layouts/AdminLayout.jsx](../frontend/src/pages/_layouts/AdminLayout.jsx) | Dark sidebar shell |
| [frontend/src/components/StatusPill.jsx](../frontend/src/components/StatusPill.jsx) | Pill component |
| [frontend/src/components/SalesProgress.jsx](../frontend/src/components/SalesProgress.jsx) | Progress bar |

## States & Edge Cases

- **Loading**: `loading` prop on AntD `Table` shows spinner; columns retain their headers.
- **Empty (no cars)**: AntD `Table.locale.emptyText` → "No cars yet — click + New Listing to add one".
- **Search miss**: "No cars match `<query>` — try a different search."
- **Status transitions**: a car with `ticketsSold > 0` can't be moved back to `draft`. Backend returns `409` with details.
- **Concurrent edit**: PUT carries an `If-Match` header with `updatedAt` (future) — backend rejects stale writes.

## Future Enhancements

- Inline image upload (multi-file drag-and-drop, S3-backed).
- Bulk actions (archive, change ticket price, reschedule draw).
- CSV export of the current view.
- Per-row sparkline showing 7-day sales velocity.
- Audit trail of every admin edit (who/what/when).
