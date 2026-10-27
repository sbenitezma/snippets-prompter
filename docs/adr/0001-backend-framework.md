# ADR 0001 — Backend framework: NestJS

## Status
Accepted (2026-09-22). **Amended 2026-10-03 (see ADR 0003)**: the project's primary scope is now frontend-only; this decision is deferred and applies only if the optional backend phase 2 is undertaken.

## Context

Snippets Prompter needs a backend. A market study of the most widely used technologies in Sonia's area today identified Node.js + TypeScript as the most common backend stack, and one Sonia wants to strengthen, building on her previous backend work with PHP/Flask/Java.

Sonia chose to go with the most widely used option in the market, while also prioritizing a framework that works as a real learning bridge: understanding the concepts behind it, not just adopting new syntax.

## Options considered

1. **Express**: minimalist, no imposed structure. Very widely used, but it leaves every architecture decision (module organization, dependency injection, validation) to the developer. When ramping up on a new backend ecosystem, it can drift into a non-idiomatic structure without external guidance.
2. **Fastify**: similar to Express in philosophy (minimalist), faster in benchmarks, but with the same lack of structure when ramping up on a new backend ecosystem.
3. **NestJS**: an opinionated framework (modules, controllers, services, decorators, dependency injection), explicitly inspired by Angular. It requires more initial boilerplate than Express, but gives a clear architecture from day one.

## Decision

**NestJS** is chosen.

Reasons:

- **Learning bridge**: its structure (modules, injectable services, `@Controller`/`@Injectable` decorators) is conceptually very similar to Angular, which Sonia already masters. This lets her build on solid existing knowledge while ramping up on a new framework.
- **Market adoption**: according to the market study, it is the most widely used structured Node backend framework.
- **Structure from the start**: an opinionated framework makes it easier to show architectural thinking and clear code organization decisions instead of an ad-hoc structure.

## Consequences

- NestJS-specific concepts (modules, decorators, validation pipes, dependency injection in the Nest context) will have to be learned on top of TypeScript/Node in general. The learning will be documented progressively as they are used, given the project's explicit learning goal (see `CLAUDE.md`).
- More initial boilerplate than with Express, especially in the walking skeleton (iteration 2). This cost is accepted in exchange for the structure and the learning value.
- If in the future an explicit comparison with a different backend approach were wanted (for example, in another project of the same portfolio), this decision can be cited as a deliberate architectural contrast between two projects of the same portfolio.
