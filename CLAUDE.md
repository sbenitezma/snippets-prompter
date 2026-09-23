# Snippets Prompter — CLAUDE.md

> Context guide for Claude Code (and for any human) working in this repository.
> Read it in full before generating code. If anything here contradicts what a specific prompt asks for, this document wins unless the prompt explicitly overrides it.

## 1. What this project is

**Snippets Prompter** is an app to store, organize and reuse the prompts and text snippets Sonia uses regularly (prompts for beauty advertising campaigns, snippets for talking to Claude about other topics, etc.), organized by free-form categories and with support for reusable variables (`{{product}}`, `{{tone}}`, ...).

It started as a **portfolio project** for Sonia, an independent Senior Frontend Engineer (~15 years of experience, specialized in Design Systems and accessibility) who builds products from ideas shaped by her previous experience in different software apps.

**Very important — a learning goal, not just a delivery goal**: this project is not only a portfolio piece, it is where Sonia wants to strengthen her skills in depth. She is refreshing her Docker skills and wants to understand in detail what each piece does. As a collaborator on this project (human or Claude Code):

- Explain new concepts (Docker, NestJS, Prisma, etc.) before or while they are used; do not take the code for granted.
- Sonia writes/reviews the code with guidance; it is not generated all at once without her understanding it.
- Move forward in small, closed iterations (see `docs/vision-and-roadmap.md`), never in a single big leap.
- Prioritize Sonia understanding the "why" behind each decision over delivery speed.

## 2. Portfolio goal (do not lose sight of it)

The technologies in this project were chosen after a market study of the most widely used technologies in Sonia's area today, focusing on those she wants to strengthen. Together with the rest of the portfolio (including another, currently private portfolio project, on hold while this one lasts), this project exists to demonstrate:

1. **Modern Node.js/TypeScript backend with NestJS** — building on her previous backend experience with PHP/Flask/Java; NestJS offers a conceptual bridge from Angular (modules, dependency injection, decorators).
2. **A real relational database** (PostgreSQL + Prisma), with a data model that includes many-to-many relationships.
3. **Containerization with Docker**: frontend and backend in separate containers that talk to each other, refreshing and deepening Sonia's Docker skills.
4. **Multi-layer testing and CI** (unit, API with Supertest, e2e with Playwright, GitHub Actions).
5. **Product thinking and disciplined iteration**: decisions recorded as ADRs, each iteration's scope closed before starting the next one — showing product and technical leadership, not only implementation.

**How it differs from the other portfolio project**: that project already covers React, Node/TypeScript, offline-first and auth. This project must not repeat that — its added value is Docker, PostgreSQL / a relational ORM, NestJS as a structured backend framework, and a more complete CI/testing pipeline.

**Confidentiality note**: real prompts from beauty campaigns may be client material. The public repository (and any sample/seed data) always uses made-up data, never real campaign content.

## 3. MVP scope — what we build first

The **MVP is a CRUD of prompts with free-form categories (many-to-many), "create from" with a link to the source, substitutable variables and copy to clipboard — no user accounts, no calls to the Claude API.**

- Create, edit, delete and list prompts (title, body, variables).
- Each prompt can have **one or more categories**, freely created by the user (no predefined list).
- **"Create from"**: duplicates an existing prompt as the basis for a new one, storing a reference (`sourceId`) to the source prompt. If the source prompt is deleted, the reference becomes `null` (`ON DELETE SET NULL`) — deletion is not blocked and no record of the source's name is kept.
- Prompts with `{{variable}}`-style variables; a form lets the user fill them in and copy the final result to the clipboard.
- No authentication in the MVP (implicitly single-user). User accounts are added in a later iteration.
- No Claude API call in the MVP: running the prompt is the user's responsibility (copy and paste into whichever AI they use). Automatic execution via the API is left for a future/premium phase.

## 4. Iteration roadmap

Each iteration is small, closed, and ends in something that works end to end (even if minimal). See `docs/vision-and-roadmap.md` for the details and the "done" criteria of each one.

1. Vision and data model (this document + `docs/vision-and-roadmap.md` + `docs/data-model.md`)
2. Walking skeleton (health endpoint + React page that calls it + Docker Compose + green CI)
3. Prompt CRUD with associated categories, validation, copy button and "create from"
4. Category management and search (filters, full-text search)
5. Prompt variables + "Copy" button with substitution — **reasonable close of the MVP**
6. User accounts (single-user first, multi-user as a design contrast with the other portfolio project)
7. Version history, export/import, accessibility with axe
7b. (Phase 2) Draft autosave, inspired by Sonia's previous experience in different software apps
8. (Future/premium) Running the prompt through the Claude API with streaming
9. (Future) Multilingual prompts: manual language versions first, automatic translation later (depends on iteration 8)
10. (Future) Adopt Sonia's shared design system (separate repository, published as an npm package), once it has a first published version

## 5. Tech stack

- **Frontend**: React + TypeScript + Vite. TanStack Query for server data. React Hook Form + Zod for forms. Vitest + Testing Library for unit/component tests. Styles use semantic design tokens (CSS custom properties in a single file, never raw values in components), ready to be replaced by Sonia's shared design system package in iteration 10.
- **Backend**: NestJS (Node.js + TypeScript). Chosen because it is the most widely used Node backend framework according to the market study (see section 2), and because of its conceptual similarity to Angular (modules, injectable services, decorators), which makes it a good learning bridge.
- **Database**: PostgreSQL + Prisma as the ORM.
- **Infrastructure**: Docker Compose with three services — `frontend`, `backend`, `postgres` — in separate containers connected through Docker's internal network (the frontend calls the backend by its service name, e.g. `http://backend:3000`).
- **Quality**: Playwright (e2e), Supertest (API tests), GitHub Actions (CI) from iteration 2 onwards.

Every stack decision, with the alternatives considered, is documented as an ADR in `docs/adr/`.

## 6. How to work in this repo with Claude

- One session per closed goal (an iteration, or a small part of one).
- Results live in files in the repo, not only in the chat history.
- Code is implemented by explaining new concepts as they appear (see section 1).
- Relevant architecture decisions are documented as ADRs before being considered closed.
- Before generating code for an iteration, confirm that its scope and data model are closed in the corresponding documentation.
- All repository content (docs, ADRs, README, code comments, config files) is written in English, since this is an international portfolio project. Conversations with Sonia happen in Spanish (Spain).
