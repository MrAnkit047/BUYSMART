# BuySmart — Full-Stack E-Commerce (MERN)

BuySmart is a complete e-commerce web app: React (Vite + Tailwind) on the
frontend, Express + Node.js on the backend, and MongoDB (via Mongoose) as the
database. JWT auth is stored in an httpOnly cookie.

## Features

- Browse products with search, category filter, sorting, and pagination
- Product detail pages with ratings and customer reviews
- Cart (persisted in localStorage) and multi-step checkout
- User accounts: register / log in / log out, profile + address editing
- Order placement, order history, and order detail/tracking pages
- Admin dashboard: manage products (create/edit/delete) and orders (update
  status), protected by admin-only routes on both frontend and backend
- Stock is decremented and prices are re-validated server-side on checkout

## Project structure

```
BuySmart/
  backend/     Express API, MongoDB models, JWT auth, seed script
  frontend/    React app (Vite + Tailwind CSS)
```

## 1. Prerequisites

- Node.js 18+
- A MongoDB database — either a local `mongod` instance, or a free
  [MongoDB Atlas](https://www.mongodb.com/atlas) cluster

## 2. Backend setup

```bash
cd backend
npm install
cp .env.example .env
# edit .env and set MONGO_URI, JWT_SECRET, etc.
npm run seed      # loads sample products + a demo admin/user account
npm run dev        # starts the API on http://localhost:5000
```

## Running in VS Code

You can run and debug BuySmart directly within **VS Code**:

1. **One-Click Launch**: Press `F5` or select **"Full-Stack Dev & Debug (Backend + Frontend)"** from the Run & Debug panel in VS Code.
2. **VS Code Tasks**: Press `Ctrl+Shift+B` or open Task Runner to run tasks like:
   - `Run Backend API Server`
   - `Run Frontend Dev Server`
   - `Seed Database (Demo Catalog & Accounts)`
   - `Build Frontend Production Bundle`

---

## Quick Start Command

Run both frontend and backend concurrently from the root folder:

```bash
# Seed demo catalog & accounts into MongoDB
npm run seed

# Launch both Backend (http://localhost:5000) and Frontend (http://localhost:5173)
npm run dev
```

---

## Demo Accounts

Seeded by `npm run seed`:
- **Admin Console**: `admin@buysmart.com` / `admin123`
- **Customer Portal**: `jane.doe@gmail.com` / `password123` (Customer ID: `BS-CUST-882190`)

---

The Vite dev server proxies `/api` and `/uploads` requests to `http://localhost:5000`.

## 4. Building for production

```bash
cd frontend && npm run build
```

If you set `NODE_ENV=production` for the backend, `server.js` will serve the
built frontend (`frontend/dist`) directly, so you can run the whole app from
a single Node process.

## Environment variables (backend/.env)

| Variable | Description |
|---|---|
| `MONGO_URI` | MongoDB connection string |
| `JWT_SECRET` | Long random string used to sign auth tokens |
| `JWT_EXPIRES_IN` | Token lifetime, e.g. `30d` |
| `PORT` | API port (default 5000) |
| `CLIENT_URL` | Frontend origin, used for CORS (default `http://localhost:5173`) |

## API overview

| Method | Route | Description |
|---|---|---|
| POST | `/api/auth/register` | Create account |
| POST | `/api/auth/login` | Log in |
| POST | `/api/auth/logout` | Log out |
| GET | `/api/products` | List products (search/filter/sort/paginate) |
| GET | `/api/products/featured` | Featured products |
| GET | `/api/products/categories` | Distinct categories |
| GET | `/api/products/:id` | Product by id or slug |
| POST | `/api/products` | Create product (admin) |
| PUT | `/api/products/:id` | Update product (admin) |
| DELETE | `/api/products/:id` | Delete product (admin) |
| POST | `/api/products/:id/reviews` | Add a review (auth) |
| POST | `/api/orders` | Place an order (auth) |
| GET | `/api/orders/mine` | Your order history (auth) |
| GET | `/api/orders/:id` | Order detail (owner or admin) |
| PUT | `/api/orders/:id/pay` | Mark order paid |
| GET | `/api/orders` | All orders (admin) |
| PUT | `/api/orders/:id/status` | Update order status (admin) |
| GET/PUT | `/api/users/profile` | View/update your profile (auth) |
| GET | `/api/users` | List users (admin) |
| DELETE | `/api/users/:id` | Delete a user (admin) |

## Notes

- Checkout is a demo flow (Cash on Delivery / Card / PayPal are just labels
  on the order) — no real payment gateway is wired up. Swap in Stripe or
  another provider by extending `updateOrderToPaid` and the checkout page.
- Product images in the seed data are hotlinked from Unsplash for demo
  purposes; replace `image`/`images` fields with your own asset URLs (or the
  `/uploads` static folder) for production use.
