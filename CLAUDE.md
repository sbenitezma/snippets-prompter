# Snippets Prompter — CLAUDE.md

> Context guide for Claude Code (and for any human) working in this repository.
> Read it in full before generating code. If anything here contradicts what a specific prompt asks for, this document wins unless the prompt explicitly overrides it.

## 1. What this project is

**Snippets Prompter** is an app to store, organize and reuse the prompts and text snippets Sonia uses regularly (prompts for beauty advertising campaigns, snippets for talking to Claude about other topics, etc.), organized by free-form categories and with support for reusable variables (`{{product}}`, `{{tone}}`, ...).

It started as a **portfolio project** for Sonia, an independent Senior Frontend Engineer (~15 years of experience, specialized in Design Systems and accessibility) who builds products from ideas shaped by her previous experience in different software apps.

**Very important — a learning goal, not just a delivery goal**: this project is not only a portfolio piece, it is where Sonia wants to strengthen her skills in depth. As a collaborator on this project (human or Claude Code):

- Explain new concepts (Docker, accessibility testing, etc.) before or while they are used; do not take the code for granted.
- Sonia leads the design and reviews every change; nothing lands without her understanding it. Keep explaining decisions (README, ADRs, code comments) so she can explain and defend every part of it.
- Move forward one named **mission per session** (see section 6), never by generating the whole app at once.
- Prioritize Sonia understanding the "why" behind each decision over delivery speed.

## 2. Portfolio goal (do not lose sight of it)

**Scope pivot (2026-10-03, see ADR 0003)**: the original plan paired this project with a NestJS/PostgreSQL backend. A review of the plan favoured shipping a usable, deployed tool first, worked in larger session missions. The project is now **frontend-only for its primary scope**: a deployed, testable, accessible React + TypeScript app with local persistence. The backend work is not cancelled — it becomes an **optional phase 2**, explicitly out of the primary scope (see section 3 and ADR 0003 for the trigger condition that decides whether it happens).

Together with the rest of the portfolio (including another, currently private portfolio project, on hold while this one lasts), this project now exists to demonstrate:

1. **A complete, deployed React + TypeScript application**, built and shipped end to end — not just a code sample.
2. **Testing discipline**: component/unit tests with Vitest + Testing Library.
3. **Accessibility as practice, not afterthought** — Sonia's existing specialty, demonstrated concretely in this app.
4. **Containerization with Docker**: a multi-stage build (Node to build, nginx to serve) — refreshing Sonia's Docker skills with a real, scoped-down project.
5. **Product thinking and disciplined iteration**: decisions recorded as ADRs, a clear README explaining what was built and why.

If the optional phase 2 (NestJS + PostgreSQL + Prisma backend) is undertaken later, it would additionally demonstrate a modern Node/TypeScript backend and a relational data model — see the deferred-scope ADRs (0001, 0002) for that reasoning, still valid if phase 2 happens.

**How it differs from the other portfolio project**: that project already covers React, Node/TypeScript, offline-first and auth. If the optional backend phase 2 here ever happens, it must still add Docker-based multi-service orchestration, PostgreSQL/a relational ORM and a fuller CI/testing pipeline — not repeat the other project.

**Confidentiality note**: real prompts from beauty campaigns may be client material. The public repository (and any sample/seed data) always uses made-up data, never real campaign content.

## 3. Scope — what we build first

**Primary scope (frontend-only)**: a CRUD of prompts with free-form categories, "create from" with a link to the source, substitutable variables, copy to clipboard, search — all persisted in the browser (`localStorage`), deployed, tested, accessible, and documented with a README.

- Create, edit, delete and list prompts (title, body, variables).
- Each prompt can have **one or more categories**, freely created by the user (no predefined list), stored as `categories: string[]` on the prompt itself (no relational tables — this is a client-only data model, see `docs/data-model.md` for how it maps to the original relational design).
- **"Create from"**: duplicates an existing prompt as the basis for a new one, storing a reference (`sourceId`) to the source prompt's `id`. If the source prompt is deleted, the reference is simply left pointing at an id that no longer exists in the list — reads must treat a missing source as "no source" (equivalent in effect to `ON DELETE SET NULL`, just handled in the UI/read logic instead of by a database).
- Prompts with `{{variable}}`-style variables; a form lets the user fill them in and copy the final result to the clipboard.
- Free-text search over title and body.
- CSV import/export for backups and spreadsheet editing (brought forward from phase 2, see ADR 0004).
- No authentication, no server, no Claude API call in this scope.

**Deferred — optional phase 2 (see ADR 0003 for the trigger condition)**: NestJS backend, PostgreSQL + Prisma, user accounts, prompt version history, running the prompt via the Claude API, multilingual prompts, adopting a shared design system package. These are not cancelled, just explicitly out of the primary scope. Reference ADRs: 0001 (NestJS), 0002 (Zod/nestjs-zod validation) — still valid reasoning if phase 2 happens.

## 4. Session plan

Each session has **one named mission** (not a general goal), sized for ~90 minutes with 2-3 small steps inside it. See `docs/vision-and-roadmap.md` for the full session-by-session plan and "done" criteria. `NEXT-STEP.md` always has the exact mission for the next session.

1. **Base**: Vite + React + TypeScript project, structure, types, static list of example prompts.
2. **CRUD**: create/edit/delete form, state, `localStorage` persistence.
3. **Real use**: copy to clipboard, search, simple categories.
4. **`ui/` and styling**: extract whatever reusable components emerged (button, input, card), make it presentable.
5. **Quality**: basic tests (Vitest + Testing Library), accessibility pass.
6. **Publish**: deploy (Vercel or Netlify), README with screenshots and the decisions made.
7. **Docker (~90 min)**: multi-stage Dockerfile (Node to build, nginx to serve), `.dockerignore`, local test run, minimal single-service `docker-compose.yml`. If it stalls, split into two halves: build first, then serve with nginx.
8. **Optional (~60 min)**: GitHub Actions workflow that builds the image on every push.

Plus 2 buffer sessions for anything unplanned. Target: ~2-2.5 weeks at the cadence in section 6.

## 5. Tech stack

- **Frontend**: React + TypeScript + Vite. React Hook Form + Zod for form validation (still a good fit with no backend — one schema, one source of truth for validation and inferred types). Vitest + Testing Library for unit/component tests. Styles use semantic design tokens (CSS custom properties in a single file, never raw values in components), ready to be replaced by Sonia's shared design system package if that's ever adopted.
- **Persistence**: browser `localStorage` — no server, no database, in the primary scope.
- **Infrastructure**: a single Docker image, multi-stage build — a Node stage to build the static assets, an nginx stage to serve them. No multi-service orchestration in the primary scope (that would return if the optional backend phase 2 happens).
- **Quality**: Vitest + Testing Library (unit/component), manual accessibility review (axe browser extension or similar), optional GitHub Actions to build the Docker image on push.
- **Deferred (phase 2 only)**: NestJS, PostgreSQL, Prisma, TanStack Query, Supertest, Playwright, Docker Compose with multiple services — all still documented in ADRs 0001/0002 for when/if that phase happens.

Every stack decision, with the alternatives considered, is documented as an ADR in `docs/adr/`.

## 6. How to work in this repo with Claude

- **One mission per session** (~90 minutes, 2-3 small steps inside it) — not one tiny step per session, and not an open-ended iteration.
- **Name the exact mission before starting a session** — not the general project goal. `NEXT-STEP.md` should already have it from the end of the previous session.
- **Cadence**: aim for ~4 sessions per week, never more than 2-3 days without touching the project — the real risk to this project is a long break losing context, not session length.
- Sonia sets the scope of each session and reviews every change; anything Claude proposes comes with an explanation she can follow.
- Results live in files in the repo, not only in the chat history.
- Relevant architecture decisions are documented as ADRs before being considered closed; an ADR is amended with a short status note rather than rewritten when a later decision changes its scope (see ADRs 0001/0002, amended by ADR 0003).
- All repository content (docs, ADRs, README, code comments, config files) is written in English, since this is an international portfolio project. Conversations with Sonia happen in Spanish (Spain).

## 7. Session continuity (`NEXT-STEP.md`)

Sonia works in sessions with sometimes long breaks between them, and each Claude Code session starts with no memory of previous ones. To avoid losing track of where the project stands:

- `NEXT-STEP.md` (repo root) always states, in a few lines: which session number/mission is next, what was last completed, and the exact mission for the next session (not a general goal).
- At the end of every session that changes code or docs, update `NEXT-STEP.md` before finishing — this is not optional, it is the last step of the session itself.
- At the start of a session, read `NEXT-STEP.md` first (even before `docs/vision-and-roadmap.md`) to know exactly where to resume and what the named mission is.
