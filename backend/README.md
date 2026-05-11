# UK Restaurant Backend

Node.js + Express + TypeScript backend for the restaurant app.

## Stack

- Express
- Prisma + PostgreSQL
- JWT auth
- bcrypt password hashing
- AWS S3 uploads with multer
- Zod validation

## Setup

1. Copy [.env.example](.env.example) to [.env](.env) and fill in the values.
2. Install dependencies:

```bash
cd backend
npm install
```

3. Generate Prisma client and run migrations:

```bash
npm run prisma:generate
npm run prisma:migrate
```

4. Seed default data:

```bash
npm run db:seed
```

5. Start the server:

```bash
npm run dev
```

## API Overview

- `POST /api/auth/register`
- `POST /api/auth/login`
- `GET /api/auth/me`
- `GET /api/restaurants/settings`
- `PUT /api/restaurants/settings`
- `GET /api/restaurants/tables`
- `POST /api/restaurants/tables`
- `PATCH /api/restaurants/tables/:id/status`
- `DELETE /api/restaurants/tables/:id`
- `GET /api/menu?page=1&limit=10&search=...`
- `POST /api/menu`
- `PUT /api/menu/:id`
- `DELETE /api/menu/:id`
- `POST /api/bookings`
- `GET /api/bookings/availability?date=2026-05-04&guests=2`
- `GET /api/bookings/occupied-tables?date=2026-05-04&time=19:00`
- `GET /api/orders`
- `POST /api/orders`
- `POST /api/upload`

## Notes

- Register creates customer accounts by default.
- Use the seed script to create a starter admin account for staff access.
- `POST /api/upload` stores the file in S3 and persists the public URL in PostgreSQL.
