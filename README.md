# Nonik API

Express/TypeScript backend for a Korean cosmetics e-commerce platform.

## About

Nonik API powers two things from a single Express application:

- A **public JSON REST API** for the storefront — products, member accounts, orders, favorites, and contact messages. It is consumed by the sibling React frontend ([nonik-react](https://github.com/Sherzod-1998/nonik-react)).
- A **server-rendered admin panel** at `/admin`, built with EJS, used by SELLER/ADMIN members to manage inventory, review orders, and manage users.

Both surfaces share the same Express app, database, and business-logic layer, but use different auth mechanisms (see below).

## Tech Stack

- **Runtime**: Node.js
- **Framework**: Express 4
- **Language**: TypeScript 5
- **Database / ODM**: MongoDB Atlas + Mongoose 6
- **Admin views**: EJS 3, server-rendered
- **Auth**: JSON Web Tokens (`jsonwebtoken`) for the public API, `express-session` (Mongo-backed via `connect-mongodb-session`) for the admin panel
- **Real-time**: Socket.IO (connection tracking)
- **Uploads**: Multer
- **Scheduling**: node-cron (cleanup jobs)
- **Other**: bcryptjs (password hashing), cors, cookie-parser, morgan (request logging), dotenv

## Architecture

The codebase is layered for a clear separation of concerns:

- `src/controllers` — Express route handlers. Parse/validate request input, call into the service layer, and shape HTTP responses.
- `src/models/*.service.ts` — business-logic/service classes (despite the folder name "models," these are service classes, not Mongoose models — that's this project's naming convention).
- `src/schema` — Mongoose schemas and models (the actual database layer).
- `src/libs/types` — shared TypeScript types/interfaces used across controllers and services.
- `src/libs/enums` — domain enums (member types, order statuses, product/brand collections, view types).
- `src/libs/utils` — cross-cutting utilities (file upload configuration, the in-memory rate limiter).
- `src/libs/Errors.ts` — the shared `Errors`/`HttpCode`/`Message` error convention used throughout the controllers and services.
- `src/views` — EJS templates rendered by the `/admin` panel.
- `src/router.ts` / `src/router-admin.ts` — route definitions for the public API and the admin panel, respectively.

**Dual-auth model**: the public API authenticates requests with a JWT stored in an httpOnly cookie (`accessToken`); the admin panel authenticates sellers with a traditional Mongo-backed Express session. These are independent auth flows that never mix.

## Security

A few notable engineering decisions worth calling out:

- **CSRF protection on the admin panel** — a per-session CSRF token is generated and injected into every admin form; state-changing admin routes (login, signup, product create/update, user edit, order status update) reject requests whose token doesn't match the session's.
- **Rate limiting on login/signup** — a custom in-memory rate limiter (`src/libs/utils/rateLimiter.ts`) throttles both the public API's and the admin panel's login/signup endpoints to slow down brute-force attempts.
- **Mass-assignment protection** — member signup/update endpoints only copy an explicit allow-list of fields (nick, phone, address, description, image) onto the update payload instead of trusting the raw request body.
- **Server-side price/stock validation on orders** — when an order is created, the server re-fetches each product by ID and computes the price and stock check from the database record; client-supplied prices are never trusted.
- **Regex-escaping on search input** — member search queries escape user input before it's interpolated into a MongoDB `$regex` filter, avoiding regex-injection/DoS via crafted search strings.
- **Admin self-registration gated by a bootstrap token** — a seller can only sign up for the admin panel by supplying a secret `ADMIN_SIGNUP_TOKEN`, preventing anyone from registering themselves as a seller.

## API Overview

All public routes are mounted at the app root; all admin routes are mounted under `/admin`.

### Public API (`src/router.ts`)

| Resource | Routes | Auth |
|---|---|---|
| Member | `GET /member/seller`, `POST /member/login`, `POST /member/signup`, `POST /member/logout`, `GET /member/detail`, `POST /member/update`, `GET /member/top-users`, `POST /member/change-password` | Most require a valid JWT cookie (except login/signup/seller/top-users) |
| Product | `GET /product/all`, `GET /product/:id`, `GET /product/recommend/:productId` | Public (optional auth on `:id` for favorite/view state) |
| Order | `POST /order/create`, `GET /order/all`, `POST /order/update` | Requires authenticated member |
| Favorite | `POST /favorite/toggle`, `GET /favorite/my` | Requires authenticated member |
| Contact | `POST /contact/submit` | Public |

### Admin panel (`src/router-admin.ts`, mounted at `/admin`)

| Resource | Routes | Auth |
|---|---|---|
| Dashboard | `GET /admin` | Session (rendered with stats if authenticated) |
| Auth | `GET/POST /admin/login`, `GET/POST /admin/signup`, `GET /admin/logout` | Session, CSRF-protected on POST |
| Product | `GET /admin/product/all`, `POST /admin/product/create`, `POST /admin/product/:id` | Seller session required, CSRF-protected |
| Users | `GET /admin/user/all`, `POST /admin/user/edit` | Seller session required, CSRF-protected on edit |
| Orders | `GET /admin/orders`, `POST /admin/order/status` | Seller session required, CSRF-protected on status update |

## Getting Started

### Prerequisites

- Node.js (developed against Node 20)
- A MongoDB instance (MongoDB Atlas or local)

### Install

```bash
npm install
```

### Environment variables

Create a `.env` file (and optionally a `.env.production` for production, loaded automatically when `NODE_ENV=production`) with:

| Variable | Description |
|---|---|
| `MONGO_URL` | MongoDB connection string (used both for Mongoose and the session store) |
| `SECRET_TOKEN` | Secret used to sign/verify JWTs for the public API |
| `SESSION_SECRET` | Secret used to sign the admin panel's Express session cookie |
| `CLIENT_ORIGIN` | Comma-separated list of allowed CORS origins for the public API (defaults to `http://localhost:3000`) |
| `ADMIN_SIGNUP_TOKEN` | Bootstrap token required to self-register as a seller via `/admin/signup` |
| `PORT` | Port the server listens on (defaults to `3003`) |
| `NODE_ENV` | `development` or `production` — toggles secure cookies, `.env` vs `.env.production`, log verbosity, and file upload storage backend (see below) |
| `S3_BUCKET_NAME` | **Production only.** S3 bucket file uploads are written to (e.g. `nonik-uploads-205930613434`) |
| `AWS_REGION` | **Production only.** Region of the S3 bucket above (e.g. `ap-northeast-2`) |

File uploads (`src/libs/utils/uploader.ts`) write to local disk (`./uploads/{category}/`) in development, and directly to S3 (under the `uploads/{category}/` key prefix) in production. In production, the AWS SDK authenticates via the host's IAM role — no AWS access keys are needed or should be added here.

### Run in development

```bash
npm run start:dev
```

### Build for production

```bash
npm run build
npm run start:prod
```

## Admin Panel

The admin panel lives at `/admin`, is session-based (not JWT), and is intended for SELLER/ADMIN members. Since there's no public seller directory, self-registration via `/admin/signup` requires the `ADMIN_SIGNUP_TOKEN` environment variable to be supplied in the signup form — without it, signup is rejected.

## Deployment

Live at [api.nonik.uz](https://api.nonik.uz) (admin panel: [api.nonik.uz/admin](https://api.nonik.uz/admin)) — an EC2 instance running the app under PM2 (`process.config.js`) behind nginx, with file uploads served from S3 and HTTPS via Let's Encrypt. Deploys to `master` run automatically through GitHub Actions (`.github/workflows/ci-cd.yml`), using GitHub OIDC to authenticate to AWS without static credentials.

## Screenshots

![Admin panel](docs/screenshots/admin-login.png)

## License / Author

MIT — see [LICENSE](./LICENSE). Built by [Sherzod-1998](https://github.com/Sherzod-1998).

Frontend companion repo: [nonik-react](https://github.com/Sherzod-1998/nonik-react)
