# AI Workflow Rules

## Approach

Build FinanceFlow incrementally using a spec-driven workflow. The context files (architecture.md, ui-context.md, code-standards.md, project-overview.md) define what to build, how to build it, and the current state of progress. Always implement against these specs — do not infer or invent behavior not defined here.

## Scoping Rules

- Work on one feature unit at a time (e.g. auth, transactions CRUD, one agent)
- Prefer small, verifiable increments over large speculative changes
- Do not combine unrelated system boundaries in a single implementation step
- Each step should be runnable and testable before moving to the next

## When to Split Work

Split an implementation step if it combines:

- Frontend UI changes and backend API changes simultaneously
- Multiple unrelated API routes in one step
- A new agent and the UI that displays its output
- Any behavior not clearly defined in the context files

If a change cannot be verified end to end quickly, the scope is too broad — split it.

## Handling Missing Requirements

- Do not invent product behavior not defined in the context files
- If a requirement is ambiguous, ask before implementing
- If a requirement is missing, add it as an open question in `progress-tracker.md` before continuing

## Protected Files

Do not modify the following unless explicitly instructed:

- `prisma/schema.prisma` — only modify when adding a new model or field, and always run `npx prisma migrate dev` after
- `server/lib/prisma.ts` — the Prisma client singleton
- `server/middleware/auth.ts` — auth middleware logic

## Keeping Docs in Sync

Update `progress-tracker.md` whenever:

- A feature unit is completed
- An architecture or storage decision is made
- A new open question arises
- The current phase changes

## Build Order (Do Not Skip Steps)

1. Project structure setup (folders, tsconfig, env)
2. Prisma schema + database connection
3. Auth (register, login, JWT middleware)
4. Transactions CRUD API + frontend page wired up
5. CSV import + Categorizer agent
6. Budget goals API + frontend page
7. Anomaly Detector agent + Alerts page
8. Budget Advisor agent + suggestions UI
9. Chat Assistant agent + AI Assistant page (streaming)
10. Dashboard charts wired to real data
11. Polish, error handling, loading states
12. Deploy (Railway + Vercel)

## Before Moving to the Next Unit

1. The current unit works end to end within its defined scope
2. No invariant defined in `architecture.md` was violated
3. `progress-tracker.md` reflects the completed work
4. The app runs without console errors
5. `npm run build` passes on both client and server
