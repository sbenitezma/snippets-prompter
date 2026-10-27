# ADR 0003 — Scope pivot: frontend-only primary scope, backend deferred as optional phase 2

## Status
Accepted (2026-10-03). Amends ADR 0001 and ADR 0002 — see the amendment notes added to each.

## Context

The original plan (iterations 1-10, see git history of `docs/vision-and-roadmap.md`) paired this project with a NestJS + PostgreSQL + Prisma backend from the start, worked one small step at a time per session. After the first sessions (iteration 1 fully done; iteration 2 a bare NestJS scaffold), a review of the plan concluded that the step size was finer-grained than the project needed: resuming after a break between sessions was costly, and a usable, deployed app was still many sessions away. Getting a working tool shipped became the priority.

## Decision

Reduce the primary scope to a **frontend-only** React + TypeScript application: CRUD of prompts, categories, "create from", variables, search and copy, persisted in `localStorage`, deployed, tested and documented. No server, no database, no authentication in this scope.

Session granularity changes from "one tiny step per session" to **one named mission per session** (~90 minutes, 2-3 small steps inside it), with a cadence target of ~4 sessions/week and never more than 2-3 days without touching the project.

The backend work (NestJS, PostgreSQL, Prisma, user accounts, Claude API execution, multilingual prompts, adopting the shared design system) is **not cancelled** — it becomes an explicit **optional phase 2**, out of the primary scope.

**Trigger condition for phase 2**: to avoid "optional" quietly meaning "never", phase 2 is only considered once the primary scope (sessions 1-8) is shipped and deployed. If, within two weeks of deployment, there has been no concrete start on phase 2, it is formally closed as out of scope for this project, and the backend and relational-database skills this project originally meant to strengthen are built on some other way (a different project, or a scoped addition to the other portfolio project). This is a deliberate decision point, not a default — revisit it explicitly when session 6 ("Publish") is done.

## Consequences

- The original reason for choosing this stack (section 2 of `CLAUDE.md`, before this ADR) included demonstrating a modern Node/TypeScript backend and a relational data model. With this pivot, that goal is no longer guaranteed to be met by this project — it depends entirely on whether phase 2 happens. This is a real trade-off, made deliberately in exchange for shipping something deployed and presentable faster, with a much lower risk of the project stalling.
- The relational data model already designed in `docs/data-model.md`, and ADRs 0001 (NestJS) and 0002 (Zod/`nestjs-zod` validation), are not discarded — they remain the design to return to if phase 2 happens. They are amended, not rewritten, to note this status.
- The `backend/` folder (NestJS scaffold from the earlier attempt) is left untouched, neither deleted nor worked on, as a starting point if phase 2 happens.
- The data model used in the frontend-only scope is a flattened version of the relational one: `categories` becomes a plain string array on the prompt instead of a join table, and `sourceId` pointing at a deleted prompt is handled by the read logic ("treat a missing source as no source") instead of by a database `ON DELETE SET NULL` constraint. The underlying design intent (many-to-many categories, nullable reference to a source prompt) is unchanged — only the storage mechanism is simpler.
- Docker is kept in the primary scope but scoped down: a single multi-stage image (Node build stage + nginx serve stage) instead of a multi-service Docker Compose setup with a database. This is still a real, hands-on way to refresh Docker skills (multi-stage builds, serving static assets via nginx) without requiring the backend.
