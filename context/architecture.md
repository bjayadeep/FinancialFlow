# Architecture Context

## Stack

| Layer      | Technology                        | Role                                      |
| ---------- | --------------------------------- | ----------------------------------------- |
| Frontend   | React + Vite + TypeScript         | UI, routing, state management             |
| Styling    | Tailwind CSS                      | All styling — no hardcoded hex values     |
| Backend    | Node.js + Express + TypeScript    | REST API, auth, agent orchestration       |
| AI         | | All 5 AI agents, tool use, streaming   |
| AI SDK     | Vercel AI SDK                     | Streaming Claude responses to frontend    |
| Database   | PostgreSQL + Prisma ORM           | All persistent data                       |
| Auth       | JWT + refresh tokens              | Stateless auth, stored in httpOnly cookie |
| File Upload| Multer                            | CSV import handling                       |
| Deployment | Railway (backend) + Vercel (frontend) | Production hosting                    |

## Folder Structure

```
financeflow/
  /client                  ← React frontend (Vite)
    /src
      /components          ← Reusable UI components
      /pages               ← One file per route/screen
      /hooks               ← Custom React hooks
      /lib                 ← API client, AI streaming utils
      /types               ← Shared TypeScript types
  /server                  ← Express backend
    /routes                ← Express route definitions
    /controllers           ← Business logic per route
    /middleware            ← Auth, error handling, validation
    /agents                ← All Claude agent logic
    /lib                   ← Prisma client, helpers, utils
    prisma/
      schema.prisma        ← Database schema
  .env                     ← Environment variables
  README.md
```

## System Boundaries

- `client/src/pages/` — One component per screen. No business logic here, only UI and API calls
- `client/src/lib/` — All fetch calls to the backend API. No direct DB access from frontend ever
- `server/routes/` — Route definitions only. Delegate all logic to controllers
- `server/controllers/` — Business logic. Calls agents and DB. Returns shaped responses
- `server/agents/` — All Claude API calls live here. Each agent is its own file
- `server/middleware/` — Auth verification, Zod validation, error handling

## Storage Model

- **PostgreSQL (via Prisma)**: All user data — users, transactions, budgets, alerts, categories
- **Memory (per request)**: CSV parsing, agent intermediate state
- **No file storage needed**: CSVs are parsed and discarded after import

## Auth and Access Model

- Every user registers with email + password (bcrypt hashed)
- JWT access token (15min expiry) + refresh token (7 days) stored in httpOnly cookies
- Every protected route runs the `authMiddleware` before the controller
- Users can only read/write their own data — all queries are scoped by `userId`

## Invariants

1. No controller directly calls the Claude API — all AI calls go through `/server/agents/`
2. No frontend component directly queries the database
3. All API route inputs are validated with Zod before any logic runs
4. All DB queries are scoped by authenticated `userId` — no cross-user data access
5. Streaming responses use Vercel AI SDK on the frontend — no manual SSE handling
