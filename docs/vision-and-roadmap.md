# Vision and roadmap — Snippets Prompter

## Why this project exists

Sonia regularly uses a set of recurring prompts and text snippets: prompts for the beauty advertising campaigns she works on, snippets for talking to Claude about other topics, etc. Today she manages them in a scattered way (notes, loose documents...). Snippets Prompter centralizes those prompts, lets her organize them by free-form categories, parametrize them with variables and reuse them quickly by copying the already filled-in result.

Besides solving a real problem for Sonia, the project is a portfolio piece: a complete, deployed, tested and accessible React + TypeScript application, built in short, named sessions rather than in one large effort.

**Scope pivot (2026-10-03)**: the original plan paired this project with a NestJS/PostgreSQL backend, worked one tiny step at a time. A review of the plan favoured shipping a usable, deployed tool first, in larger session missions (see ADR 0003). The project is now frontend-only in its primary scope; the backend becomes an optional phase 2.

## Who uses it

A single user: Sonia herself. The data model does not need multi-user support, and none is planned in the primary scope.

## What is in and what is out

**In (primary scope, frontend-only):**
- Full prompt CRUD (create, view, edit, delete), persisted in the browser (`localStorage`).
- Free-form categories, created by the user, stored directly on each prompt (`categories: string[]`).
- "Create from": duplicate an existing prompt as the starting point for a new one, with a reference to the source (`sourceId`, the source prompt's `id`).
- Variables inside the prompt body (`{{variable}}`), with a form to fill them in.
- "Copy" button that copies the prompt to the clipboard with the variables already substituted.
- Free-text search over title and body.
- A single Docker image (multi-stage build: Node to build, nginx to serve).
- Automated tests (Vitest + Testing Library) and a manual accessibility pass.
- Deployed (Vercel or Netlify) with a README documenting what was built and why.

**Out (deferred — optional phase 2, see ADR 0003 for the trigger condition):**
- NestJS backend, PostgreSQL + Prisma, a relational data model.
- User accounts / authentication.
- Prompt version history, export/import.
- Draft autosave.
- Running the prompt against the Claude API.
- Multilingual prompts.
- Adopting Sonia's shared design system package.
- Multi-service Docker Compose orchestration, Supertest, Playwright, GitHub Actions running a full test suite (a simpler "build the Docker image on push" workflow is in the primary scope instead, as an optional session).

## What a "snippet"/"prompt" is in this app

- **id**: unique identifier, generated client-side.
- **title**: identifies the prompt in listings.
- **body**: the prompt text; it can contain variables using the `{{variable_name}}` syntax.
- **categories**: an array of free-form strings, created by the user (no closed, predefined list).
- **sourceId** (optional): if the prompt was created with "create from" another one, the source prompt's `id`. If that source no longer exists in the list (deleted), it is treated as if there were no source — no error, no broken reference shown.

This mirrors the relational model originally designed in `docs/data-model.md` (`Prompt`/`Category`/`PromptCategory`), flattened for client-only storage: no join table, no foreign-key constraints — just an array of strings and an optional id, with the "deleted source" case handled in the read logic instead of by the database. If the optional backend phase 2 happens, `docs/data-model.md` is the design to return to.

## Session plan

Each session has **one named mission** (not a general goal), sized for ~90 minutes with 2-3 small steps inside it. `NEXT-STEP.md` always has the exact mission for the next session — read it before starting. Cadence: aim for ~4 sessions a week, never more than 2-3 days without touching the project.

### Session 1 — Base
**Mission**: a working Vite + React + TypeScript project, with the core types and a static example list on screen.
**Includes**: Vite + React + TypeScript scaffold (clean, no example boilerplate); `Prompt` type (`id`, `title`, `body`, `categories: string[]`, `sourceId?: string`); a component rendering a static list of 4-5 example prompts.
**Done when**: the app runs locally and shows the example list, with everything type-checked.

### Session 2 — CRUD
**Mission**: create, edit and delete prompts, persisted across reloads.
**Includes**: a form to create/edit a prompt; delete action; state management; `localStorage` persistence (read on load, write on every change).
**Done when**: a prompt created, edited or deleted survives a page reload.

### Session 3 — Real use
**Mission**: the features that make the app actually useful day to day.
**Includes**: "Copy" button (clipboard, no variable substitution yet unless it fits naturally — otherwise that refinement can move to a later pass); free-text search over title/body; "create from" (duplicate) with `sourceId`; category input/filter on top of the existing `categories: string[]`.
**Done when**: a prompt can be found by search or category, duplicated as a new one, and copied to the clipboard.

### Session 4 — `ui/` and styling
**Mission**: extract whatever reusable pieces emerged and make the app presentable.
**Includes**: move repeated UI (button, input, card, etc.) into a `ui/` folder — only components the app actually needed by now, each with typed props; apply consistent styling using semantic CSS custom-property tokens (no raw values scattered across components).
**Done when**: the app looks coherent and the `ui/` components have no one-off duplicated styling left outside them. No variants, themes or component documentation yet — that's explicitly out of scope until after deployment.

### Session 5 — Quality
**Mission**: basic automated tests and an accessibility pass.
**Includes**: Vitest + Testing Library tests for the CRUD flow and search; a manual accessibility review (keyboard navigation, labels, contrast) using a tool such as the axe browser extension, fixing what it flags.
**Done when**: the core flows have test coverage and the accessibility review found no blocking issues (or they're fixed).

### Session 6 — Publish
**Mission**: ship it.
**Includes**: deploy to Vercel or Netlify; write the README (what the app does, screenshots, the decisions taken and why, link to the ADRs).
**Done when**: the app is reachable at a public URL and the README clearly explains what was built and why.

### Session 7 — Docker (~90 min)
**Mission**: refresh Docker skills with a real project, scoped down to one service.
**Includes**: multi-stage `Dockerfile` (a Node stage to build the static assets, an nginx stage to serve them); `.dockerignore`; a local test run of the built image; a minimal single-service `docker-compose.yml`.
**Done when**: `docker compose up` serves the app from the built image. If it stalls, split into two sessions: build stage first, then serving with nginx.

### Session 8 — Optional: CI (~60 min)
**Mission**: build the Docker image automatically.
**Includes**: a GitHub Actions workflow that builds the image on every push (build only — running the full test suite in CI can be added later if useful).
**Done when**: the workflow runs green on a push.

### Buffer
2 extra sessions, unallocated, for anything that ran over or wasn't planned. Target overall: ~2-2.5 weeks at the stated cadence.

### Deferred — optional phase 2 (not scheduled)
If undertaken (see ADR 0003 for the trigger condition): NestJS backend, PostgreSQL + Prisma relational model, user accounts, prompt version history, export/import, Claude API execution, multilingual prompts, adopting the shared design system package, multi-service Docker Compose, Supertest, Playwright. The original relational design for this work already exists in `docs/data-model.md` and ADRs 0001/0002.

## Risk to watch

Running two portfolio projects at the same time can dilute the effort. While Snippets Prompter lasts, the other portfolio project is on hold. The real risk to *this* project is a long break between sessions losing context — not session length or technical difficulty — which is why the cadence rule and `NEXT-STEP.md` exist.
