# Code Standards

## General

- Keep modules small and single-purpose — one concern per file
- Fix root causes, do not layer workarounds
- Do not mix UI, business logic, and data fetching in the same component
- Prefer explicit over implicit — name things clearly

## TypeScript

- Strict mode enabled throughout the project
- Avoid `any` — use explicit interfaces or `unknown` with type narrowing
- Validate all external input (API requests, CSV data) at system boundaries using Zod
- Define shared types in `/client/src/types/` and `/server/types/`

## React (Frontend)

- One page component per route in `/pages/`
- Extract reusable UI into `/components/`
- All API calls go through `/lib/api.ts` — never use fetch directly in a component
- Use `useState` + `useEffect` for local state; no global state library needed yet
- Streaming AI responses handled via Vercel AI SDK `useChat` hook

## Express (Backend)

- Route files define paths only — delegate all logic to controllers
- Every protected route uses `authMiddleware` before the controller
- Validate request body with Zod at the top of every controller before any logic
- Return consistent response shapes: `{ data: ... }` for success, `{ error: string }` for errors
- Use `async/await` throughout — no `.then()` chains

## Agents (`/server/agents/`)

- Each agent is its own file: `categorizer.ts`, `csvMapper.ts`, `budgetAdvisor.ts`, `anomalyDetector.ts`, `chatAssistant.ts`
- All Claude API calls use `claude-sonnet-4-20250514` model
- Tool definitions are typed with Zod schemas
- Agents return typed, structured data — never raw Claude response strings to controllers
- Streaming agents use Vercel AI SDK on the backend

## Styling

- Tailwind utility classes only — no hardcoded hex values, no inline styles
- Follow the color tokens defined in `ui-context.md`
- Dark theme only — no light mode classes

## API Routes

- Validate and parse request input before any logic runs (Zod)
- Enforce auth before any mutation
- Return consistent, predictable response shapes
- All routes scoped under `/api/` prefix

## Data and Storage

- All DB queries go through Prisma — no raw SQL except for full-text search
- Every query must include `where: { userId }` to scope data to the authenticated user
- Never store sensitive data (passwords in plain text, tokens in DB without hashing)

## File Organization

- `client/src/pages/` — One file per route screen
- `client/src/components/` — Reusable UI components only
- `client/src/lib/` — API client, utilities, AI streaming helpers
- `server/routes/` — Route definitions only
- `server/controllers/` — Business logic
- `server/agents/` — All Claude AI agent files
- `server/middleware/` — Auth, validation, error handling
- `server/lib/` — Prisma client, shared utilities
- `prisma/` — schema.prisma and migrations
