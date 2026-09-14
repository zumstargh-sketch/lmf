# Backend (NestJS + Prisma)

This folder will contain the NestJS backend application, Prisma schema, migrations and seed scripts.

Setup:

1. Copy `.env.example` to `.env` and set `DATABASE_URL` to a running PostgreSQL database.
2. Run `npm install --legacy-peer-deps`.
3. Run `npx prisma migrate dev --name init`.
4. Run `npm run seed` to create development data and the optional admin account.
5. Run `npm run start:dev`.

The API is available at `http://localhost:3000/api`. The admin dashboard reads its overview from `GET /api/dashboard/summary`.

Key tasks:

- Implement authentication (JWT + refresh tokens)
- Define Prisma schema and migrations
- Implement modules for users, projects, news, events, scholarships, assistance, donations, AI knowledge
- Configure environment variables and seeding (SUPER_ADMIN_EMAIL / SUPER_ADMIN_PASSWORD)
