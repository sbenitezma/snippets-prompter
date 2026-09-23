# Vision and roadmap — Snippets Prompter

## Why this project exists

Sonia regularly uses a set of recurring prompts and text snippets: prompts for the beauty advertising campaigns she works on, snippets for talking to Claude about other topics, etc. Today she manages them in a scattered way (notes, loose documents...). Snippets Prompter centralizes those prompts, lets her organize them by free-form categories, parametrize them with variables and reuse them quickly by copying the already filled-in result.

Besides solving a real problem for Sonia, the project is a portfolio piece designed to strengthen widely used technologies identified through a market study of her area (see `CLAUDE.md`, section 2), and to deepen skills she wants to refresh, Docker in particular.

## Who uses it

A single user in the MVP: Sonia herself. The design does not rule out multi-user support in the future (see iteration 6), but the MVP does not need it and must not be complicated up front to support it.

## What is in and what is out (MVP)

**In:**
- Full prompt CRUD (create, view, edit, delete).
- Free-form categories, created by the user, in a many-to-many relationship with prompts.
- "Create from": duplicate an existing prompt as the starting point for a new one, with a reference to the source (`sourceId`).
- Variables inside the prompt body (`{{variable}}`), with a form to fill them in.
- "Copy" button that copies the prompt to the clipboard with the variables already substituted.
- Separate Docker containers for frontend and backend, talking to each other, orchestrated with Docker Compose.
- Automated tests and CI from the walking skeleton onwards.

**Out (explicitly deferred):**
- Authentication / user accounts (iteration 6).
- Prompt version history (iteration 7).
- Prompt export / import (iteration 7).
- Draft autosave (phase 2, iteration 7b).
- Running the prompt against the Claude API (future/premium, iteration 8). In the MVP, execution is manual: the user copies the result and pastes it wherever they want to use it.
- Multilingual prompts: the same prompt in several languages, linked together (future, iteration 9). In the MVP, "create from" already covers the manual case: duplicate the prompt, translate it by hand, and `sourceId` keeps both versions linked.

## What a "snippet"/"prompt" is in this app

- **Title**: identifies the prompt in listings.
- **Body**: the prompt text; it can contain variables using the `{{variable_name}}` syntax.
- **Categories**: one or more, freely created (no closed, predefined list).
- **Source** (`sourceId`, optional): if the prompt was created with "create from" another one, a reference to that prompt. `null` if it is an original prompt or if the source was deleted.

See `docs/data-model.md` for the full data model.

## Iteration roadmap

Each iteration has a closed goal and an explicit "done" criterion. An iteration does not start until the previous one is closed (working code + up-to-date documentation).

### Iteration 1 — Vision and data model (this delivery)
**Goal**: write down what we are building and with which data model, before writing any code.
**Done when**: `CLAUDE.md`, `docs/vision-and-roadmap.md`, `docs/data-model.md` and at least the backend stack ADR exist.

### Iteration 2 — Walking skeleton
**Goal**: have all the infrastructure pieces connected, with no real functionality yet.
**Includes**: a health endpoint (`GET /health`) in NestJS; a minimal React page that consumes it and shows the result; `docker-compose.yml` with the three services (`frontend`, `backend`, `postgres`) talking to each other; one minimal test per layer; GitHub Actions running those tests on every push.
**Done when**: `docker compose up` starts the three services, the web page shows the backend status, and the CI pipeline is green.

### Iteration 3 — Prompt CRUD
**Goal**: be able to create, view, edit and delete prompts, with associated categories.
**Includes**: `Prompt`/`Category`/`PromptCategory` model in Prisma + migrations; REST endpoints for the CRUD; create/edit form in React with validation (Zod); prompt list; "Create from" (duplicate) button; "Copy" button (without variable substitution yet, that comes in iteration 5).
**Done when**: a prompt can be created, edited, deleted and duplicated end to end from the UI, with API tests (Supertest) and component tests covering the flow.

### Iteration 4 — Categories and search
**Goal**: manage categories independently and find prompts easily.
**Includes**: category screen/management (create, rename, delete); filter prompts by category; full-text search (PostgreSQL full-text search) over title and body.
**Done when**: the prompt list can be filtered by one or more categories and searched by free text.

### Iteration 5 — Variables and copy (MVP close)
**Goal**: a prompt with variables can be filled in and copied already resolved.
**Includes**: detection of `{{...}}` variables in the prompt body; dynamic form to fill them in; substitution and copy of the final result to the clipboard.
**Done when**: a prompt with variables can be filled in and the text copied to the clipboard already has them substituted. **This closes the MVP.**

### Iteration 6 — User accounts
**Goal**: move from single-user to real authentication.
**Includes**: sign-up/login; prompts and categories become associated with a user. The comparison of approaches with the other portfolio project (same problem, different context → possibly a different solution) is documented as an ADR.

### Iteration 7 — History, export/import, accessibility
**Goal**: polish the experience and add robustness.
**Includes**: prompt version history; JSON export/import; accessibility audit with axe-core (WCAG 2.1 AA).

### Iteration 7b — (Phase 2) Drafts / autosave
**Goal**: avoid losing work if the connection drops or an edit is abandoned halfway, inspired by Sonia's previous experience in different software apps.
**Includes**: ADR comparing "draft as a state of the same record" vs. "draft as a separate entity"; implementation of the chosen option.

### Iteration 8 — (Future/premium) Execution via the Claude API
**Goal**: run the prompt directly against the Claude API, with streaming, instead of copying and pasting.
**Includes**: API key management, per-user usage/cost limits, response streaming. Intended as a premium feature if the project is monetized.

### Iteration 9 — (Future) Multilingual prompts
**Goal**: keep the same prompt in several languages (e.g. Spanish for campaigns with Spanish companies, English for international work) and choose which version to use depending on the context. Language is not modelled as a category: it is a version of the same prompt.
**Includes**, in two phases:
1. **Manual language versions**: data model change from "a `Prompt` has a title and a body" to "a `Prompt` has one or more translations (language + title + body)"; UI to add a version in another language and pick which one to copy.
2. **Automatic translation**: generate a new language version from an existing one. Depends on the Claude API infrastructure from iteration 8.

**Initial direction (to be confirmed in an ADR when the iteration starts)**: variable names are always in English across every language version (e.g. `{{product}}` also inside the Spanish prompt), so a variable is recognized as the same one in all versions. Values that behave like proper nouns (product and brand names) are not translated.

### Iteration 10 — (Future) Adopt the shared design system
**Goal**: replace the app's local design tokens with Sonia's own design system, a separate project shared by all her projects.
**Depends on**: the design system having a first version published as an npm package (it lives in its own repository, never inside this one). In any case, this iteration starts after the MVP (iteration 5); its position relative to iterations 6–9 is flexible.
**Preparation from iteration 3 onwards**: UI styles never use raw values (colors, spacing, font sizes...) directly. They use semantic tokens defined as CSS custom properties in a single file (e.g. `frontend/src/styles/tokens.css`), so the migration is mostly a matter of changing where the values come from.
**Includes**: installing the design system package; mapping the local tokens to the design system tokens; replacing local components with design system components where they exist.
**Done when**: the app no longer defines its own style values; all of them come from the design system package.

## Risk to watch

Running two portfolio projects at the same time can dilute the effort. While Snippets Prompter lasts, the other portfolio project is on hold. Snippets Prompter is meant to be a shorter, more tightly scoped project than that one.
