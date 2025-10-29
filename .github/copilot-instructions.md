<!-- .github/copilot-instructions.md -->

# Copilot / AI agent instructions — math-contest-platform

Purpose: short, actionable guidance to help an AI coding agent be productive in this repository.

Summary (big picture)

- This is a Next.js (App Router) frontend project (Next v16) using the app/ directory. It's primarily a React/TypeScript web UI.
- Styling uses Tailwind CSS and PostCSS (see `postcss.config.mjs` and `package.json` deps).
- The repo includes a Docker Compose service for a Postgres DB (`docker-compose.yml`) used for local development. There is no DB client or ORM committed yet — if adding persistence, wire it into the `db` service.

How to run (concrete commands)

- Local dev server (frontend):
  - `pnpm dev` or `npm run dev` (runs `next dev`, serves on http://localhost:3000)
- Build & start production:
  - `pnpm build` / `npm run build` then `pnpm start` / `npm run start` (uses `next build` / `next start`)
- Local Postgres for features needing DB:
  - `docker-compose up -d` (starts `mc-postgres` on host port 5432)
  - Verify: `docker ps` and `pg_isready -h localhost -p 5432 -U postgres` (or rely on the Compose healthcheck)

Key repository conventions & examples

- App Router & file locations:
  - UI entry: `app/page.tsx`. Edit there to change the landing page (example content already points contributors to edit `app/page.tsx`).
  - Shared layout & fonts: `app/layout.tsx` imports `app/globals.css` and sets Google fonts via `next/font/google` — follow that pattern for app-wide providers.
- TypeScript & paths:
  - `tsconfig.json` sets `strict: true` and a path alias `@/*` → `./*`. Use `@/` imports for top-level project imports when appropriate.
- Styling:
  - Tailwind is configured (see `postcss.config.mjs` and `tailwindcss` devDep). Global styles live in `app/globals.css`.
- Linting:
  - Run `npm run lint` (script maps to `eslint`). Follow the repo ESLint configuration (`eslint.config.mjs`).

Architecture notes & decisions (discoverable)

- The project is currently a frontend-only Next.js app in the app/ directory. There are no server-side API routes or backend code in this commit.
- The included `docker-compose.yml` defines a Postgres instance with DB name `mc_platform`, user `postgres` and password `devpassword`. If you add server code or migrate schema, update Compose and document migrations here.

Patterns for making changes (examples you can follow)

- Add a new top-level route: create `app/<route>/page.tsx` (server component by default). For client components, add `'use client'` at the top.
- Add shared UI: create a folder under `components/` and import in `app/layout.tsx` or route pages.
- Database-backed features: start by adding a DB client (e.g., Prisma) as a dev decision; place schema and client config under a `prisma/` or `server/` folder and reference `docker-compose.yml` credentials.

What to avoid / assumptions

- Don't assume there is existing server or ORM code — none is present. If you add server APIs, include clear README sections and update `docker-compose.yml` when needed.
- Keep changes small and scoped (this repo is minimal scaffolding). Large architectural changes should be explained in PR descriptions.

Files to reference when authoring changes

- `package.json` — scripts and dependency versions
- `app/layout.tsx`, `app/page.tsx`, `app/globals.css` — app entry and styling conventions
- `docker-compose.yml` — local Postgres service and credentials
- `tsconfig.json` — compilerOptions and path aliases
- `eslint.config.mjs` and `postcss.config.mjs` — linting and CSS toolchain

If you need more context

- Ask for the preferred package manager (pnpm / npm / yarn) and whether the team expects a backend (Prisma/TypeORM) or 3rd-party DB service.

Feedback request: If anything here is unclear or you want more examples (e.g., how to wire Prisma or add API routes), tell me which area to expand.
