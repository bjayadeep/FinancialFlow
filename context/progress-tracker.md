# Progress Tracker

Update this file after every meaningful implementation change.

## Current Phase

In Progress

## Current Goal

Build backend feature units in spec order.

## Completed

- Done: All 6 UI screens designed and generated in v0 (Dashboard, Transactions, Budgets, AI Assistant, Alerts, Auth)
- Done: Frontend exported from v0 as zip and opened in Cursor
- Done: Context files filled in (project-overview, architecture, ui-context, code-standards, ai-workflow-rules)
- Done: v0 frontend project moved into `/client`
- Done: Empty `/server` scaffold created with routes, controllers, middleware, agents, lib, and prisma folders
- Done: Verified `/client` with `npm run build`
- Done: Initialized `/server` Node/Express TypeScript project with requested dependencies and env placeholders
- Done: Verified `/server` with `npm run build` and `GET /health`
- Done: Prisma schema, database connection, initial migration, and Prisma client generation completed
- Done: Auth API completed in `/server` with register, login, refresh, logout, and JWT middleware
- Done: Verified auth routes end to end against PostgreSQL
- Done: Transactions CRUD API completed and mounted under `/api/transactions`
- Done: Frontend auth and transactions page wired to the backend API
- Done: CSV import API and Categorizer agent implemented with Multer, csv-parse, Claude tool use, and frontend import modal wiring

## In Progress

- Verify CSV import end to end with a real `ANTHROPIC_API_KEY`

## Next Up

1. Add a real `ANTHROPIC_API_KEY` to `server/.env`
2. Verify CSV import + Categorizer agent end to end
3. Budget goals API + frontend page
4. Continue through build order in `ai-workflow-rules.md`

## Open Questions

- Use httpOnly cookies or localStorage for JWT? (Recommendation: httpOnly cookies)
- `ANTHROPIC_API_KEY` is present in `server/.env` but currently blank; CSV import requires a real key at runtime.

## Architecture Decisions

- Claude API model: `claude-sonnet-4-20250514` for all agents
- No shadcn/ui - components built from scratch matching v0 output
- Vercel AI SDK for streaming chat responses
- Multer for CSV file upload handling
- Zod for all API input validation
- Supabase PostgreSQL is configured for development
- JWT access tokens expire in 15 minutes and refresh tokens expire in 7 days

## Session Notes

- Project name: FinanceFlow
- v0 generated all screens with zinc-900/950 dark theme and emerald-500 accents
- Sidebar fix needed: set to `fixed h-screen` so it does not scroll with content
- App is currently frontend-only - no backend connected yet
- Frontend remains in its exported Next.js layout inside `/client`; no component code changed during restructure
- `/client` production build completed successfully after the move
- `/server` has `src/index.ts`, `tsconfig.json`, `.env`, package scripts, and installed Express/Prisma/TypeScript dependencies
- Server health smoke test returned `{ "status": "ok" }`
- Prisma migration `20260508054000_init` created the initial auth and finance tables
- Auth route smoke test confirmed register, login, refresh, and logout return expected success responses
