# ADR 0002 — Data validation: Zod (via `nestjs-zod`), without a separate OpenAPI specification

## Status
Accepted (2026-09-22). **Amended 2026-10-03 (see ADR 0003)**: the project's primary scope is now frontend-only, with no backend API to validate. The backend-side reasoning here (`nestjs-zod`) is deferred and applies only if the optional backend phase 2 is undertaken. Zod itself stays in active use regardless, for client-side form validation with React Hook Form (see `CLAUDE.md`) — only the backend-sharing rationale is on hold.

## Context

Snippets Prompter needs to validate the data that reaches the API (for example, when creating or editing a prompt) and to share the shape of that data between frontend and backend, both written in TypeScript. In another project of the same portfolio, a hand-written OpenAPI contract was chosen as the source of truth, because there are two consumers in different languages there (a TypeScript web app and a native mobile app).

In NestJS, the "default" option recommended in the official documentation is `class-validator` + `class-transformer` (DTOs as classes with decorators). The alternative evaluated is Zod, already used in the frontend (React Hook Form + Zod) for form validation, integrated into NestJS through the community package `nestjs-zod`.

## Options considered

1. **`class-validator` (NestJS native)**: DTOs as classes with decorators (`@IsString()`, `@MaxLength()`, etc.). It is the option with the most examples and official support in the NestJS documentation. The TypeScript type and the validation rules are two separate artifacts written twice (they can drift apart without the compiler noticing).
2. **Hand-written OpenAPI contract + separate validation**: replicate the approach of the other portfolio project. It is a language-neutral contract, but OpenAPI on its own does not validate anything at runtime — `class-validator` or another library would still be needed to enforce that contract, meaning two artifacts (specification + validator) to keep in sync.
3. **Zod via `nestjs-zod`**: the Zod schema is the only definition; the TypeScript type is inferred automatically (`z.infer<...>`) and runtime validation uses the same schema. Since frontend and backend share the same language (TypeScript), the schema can potentially be reused by both without generating anything.

## Decision

**Zod via `nestjs-zod`** is chosen.

Reasons:

- **Single consumer, same language**: unlike the other portfolio project, Snippets Prompter has only one API consumer (its own web frontend), and both ends are TypeScript. The advantage of a language-neutral contract (OpenAPI) does not apply here in the same way.
- **A single source of truth**: the Zod schema defines both the static type (for the editor/compiler) and the actual runtime validation, avoiding the duplication and possible drift of `class-validator` (type vs. decorators) or of a hand-maintained OpenAPI (specification vs. actual validator).
- **Consistency with the frontend**: React Hook Form already uses Zod for forms (see the stack decision in `CLAUDE.md`); using the same library in the backend opens the door to sharing schemas without maintaining two different validation systems.
- **Portfolio value**: it provides a second data architecture decision, different from and comparable to the one in the other portfolio project (OpenAPI), reasoned according to each project's context instead of applying the same solution everywhere.

## Consequences

- `nestjs-zod` is a community package, not officially maintained by the NestJS team. This maintenance risk is accepted in exchange for the advantage of sharing schemas; if the package ever became unmaintained, migrating to `class-validator` is feasible because the business logic does not depend on the internals of `nestjs-zod`.
- Part of the documentation/examples available for NestJS, most of which assume `class-validator`, is lost.
- If Snippets Prompter ever needed a second consumer in another language (for example, a native mobile app), this decision should be revisited — Zod cannot be used outside JavaScript/TypeScript, unlike OpenAPI.
- To keep browsable API documentation (Swagger UI style) without duplicating the definition, iteration 3 will evaluate a tool that generates OpenAPI from the Zod schemas (for example `zod-to-openapi`), instead of writing a separate OpenAPI document.
