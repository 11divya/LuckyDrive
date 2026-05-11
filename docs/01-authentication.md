# 01 — Authentication

## Overview

Email + password authentication for both `customer` and `admin` roles. Same login surface; the server's response carries the role and the SPA routes accordingly. Tokens are stateless JWTs, stored in `localStorage` under `ld_token` and sent on every request as `Authorization: Bearer <token>`.

## User Story

> As a visitor, I want to create an account with my email and password so I can buy lottery tickets and see my dashboard. As an admin, I want to log in to the admin panel to manage the inventory.

## UX Flow

1. Visitor navigates to `/login` (or is sent there by `<ProtectedRoute>`).
2. Centered card on dark canvas with **LOG IN / SIGN UP** tabs.
3. **Log In** tab → email + password + "Forgot?" link → `Continue` (gold).
4. **Sign Up** tab → name + email + password → `Create Account`.
5. On success the SPA routes by role:
   - `admin` → `/admin`
   - `customer` → `/` (or back to the protected page they came from).
6. An **Admin Login** anchor sits beneath the card for clarity, but the same `/login` form handles both roles — the server decides via the user record.

## Data Model — `User`

Backend file: [backend/models/User.js](../backend/models/User.js)

| Field          | Type     | Notes                                       |
|----------------|----------|---------------------------------------------|
| `name`         | String   | required                                    |
| `email`        | String   | required, unique, lowercased, indexed       |
| `password`     | String   | required, min 8, hashed with bcrypt, `select: false` |
| `role`         | String   | enum `['customer','admin']`, default `customer`, indexed |
| `phone`        | String   | optional                                    |
| `rewardPoints` | Number   | default 0                                    |
| `lastLoginAt`  | Date     | updated on login                            |
| `createdAt` / `updatedAt` | Date | from `timestamps: true`            |

The `toJSON` transform strips `password` and `__v`. A pre-save hook hashes the password (10 rounds).

## API Endpoints

Base: `/api/auth`

| Method | Path        | Body                         | Success Response                                     |
|--------|-------------|------------------------------|------------------------------------------------------|
| POST   | `/signup`   | `{ name, email, password }`  | `{ success: true, data: { user, token } }`          |
| POST   | `/login`    | `{ email, password }`        | `{ success: true, data: { user, token } }`          |
| GET    | `/me`       | —                            | `{ success: true, data: { user } }` (auth required)  |
| POST   | `/logout`   | —                            | `{ success: true, data: { message } }` (auth required) |

Tokens are signed with `JWT_SECRET`, expire in `JWT_EXPIRES_IN` (default 7 days), and carry `{ userId, email, role }`.

## UI Components

| File | Purpose |
|------|---------|
| [frontend/src/pages/public/Login/Login.jsx](../frontend/src/pages/public/Login/Login.jsx) | Page shell with tabs |
| [frontend/src/pages/public/Login/Login.helper.js](../frontend/src/pages/public/Login/Login.helper.js) | Submit handlers |
| [frontend/src/context/AuthContext.jsx](../frontend/src/context/AuthContext.jsx) | `useAuth()` hook + token management |
| [frontend/src/services/api.js](../frontend/src/services/api.js) | `ApiService.login` / `signup` / `me` / `logout` |
| [frontend/src/routes/ProtectedRoute.jsx](../frontend/src/routes/ProtectedRoute.jsx) | Role-gated route wrapper |

## States & Edge Cases

- **Loading**: AntD form button shows `loading` spinner.
- **Validation errors**: AntD `Form.Item` `rules`. Server-side validation returns `400` with `details: [{ field, message }]` — surfaced via `message.error`.
- **Wrong credentials**: server returns `401` with `error: 'Invalid credentials'`. UI shows toast.
- **Token expired**: any `401` response in `ApiService` clears the token and redirects to `/login`.
- **501 stubs**: while routes return 501, the toast says *"Login API is not yet wired up — backend returns 501."* so testers know.

## Future Enhancements

- Password reset flow (`/forgot-password`, `/reset-password/:token`).
- OTP / phone verification (common in SA — useful for KYC on big prizes).
- Social login (Google) for friction reduction.
- Two-factor for admins (TOTP).
- Refresh tokens with rotation, instead of long-lived access tokens.
