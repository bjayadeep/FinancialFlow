# FinanceFlow

FinanceFlow is a personal finance dashboard for tracking transactions, budgets, alerts, and AI-assisted financial insights.

## Stack

- React / Next.js
- Node.js / Express
- PostgreSQL
- Prisma
- Groq AI (`llama-3.3-70b`)

## Project Structure

- `client/` - frontend app
- `server/` - Express API and Prisma backend

## Local Development

### 1. Install dependencies

```bash
cd server
npm install

cd ../client
npm install
```

### 2. Configure environment variables

Create `server/.env` and `client/.env` from the lists below.

### 3. Prepare the database

```bash
cd server
npx prisma generate
npx prisma migrate dev
```

### 4. Run the apps

In one terminal:

```bash
cd server
npm run dev
```

In another terminal:

```bash
cd client
npm run dev
```

By default, the API runs on `http://localhost:5000` and the client runs on the port selected by Next.js.

## Build And Start

Build the server:

```bash
cd server
npm run build
npm start
```

Build the client:

```bash
cd client
npm run build
npm start
```

## Environment Variables

### Server

- `PORT` - API server port. Defaults to `5000`.
- `DATABASE_URL` - PostgreSQL connection string used by Prisma.
- `DIRECT_URL` - direct PostgreSQL connection string for migrations, if your provider requires one.
- `JWT_SECRET` - secret used to sign access tokens.
- `JWT_REFRESH_SECRET` - secret used to sign refresh tokens.
- `GROQ_API_KEY` - Groq API key for AI categorization, alerts, chat, and budget suggestions.

### Client

- `VITE_API_URL` - API base URL, for example `http://localhost:5000` in local development or your deployed API URL in production.

Note: this client is currently a Next.js app, so `VITE_API_URL` is exposed through `client/next.config.mjs` and consumed in `client/lib/api.ts`.
