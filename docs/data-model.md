# Data model — Snippets Prompter

Status: closed for the MVP (iterations 1–5). It does not yet include user accounts (iteration 6) or drafts (iteration 7b): when those iterations arrive, this document is updated and an ADR is opened if the change affects existing relationships.

## Entities

### `Prompt`

| Field        | Type                | Notes |
|--------------|---------------------|-------|
| `id`         | UUID / autoincrement | primary key |
| `title`      | string              | required |
| `body`       | text                | required; may contain `{{name}}` variables |
| `sourceId`   | FK to `Prompt.id`, **nullable** | set only if the prompt was created with "create from"; `ON DELETE SET NULL` |
| `createdAt`  | timestamp           | |
| `updatedAt`  | timestamp           | |

### `Category`

| Field   | Type   | Notes |
|---------|--------|-------|
| `id`    | UUID / autoincrement | primary key |
| `name`  | string, unique | freely created by the user, no predefined list |

### `PromptCategory` (join table, many-to-many relationship)

| Field        | Type | Notes |
|--------------|------|-------|
| `promptId`   | FK to `Prompt.id` | |
| `categoryId` | FK to `Category.id` | |

Composite primary key (`promptId`, `categoryId`).

## Relationships

- A `Prompt` can have **one or more** `Category` (many-to-many via `PromptCategory`). This was decided explicitly from the MVP because it is not known in advance how many categories will be applied to each prompt in practice; switching from "one" to "many" later would have required migrating data and changing forms/filters.
- A `Prompt` can have **at most one** source `Prompt` (`sourceId`), and can be the source of **many** child `Prompt`s (self-referencing one-to-many relationship).

## Relevant business rules

1. **Deleting a category**: when a `Category` is deleted, only the `PromptCategory` rows that reference it are removed (the prompts are not deleted, they simply lose that category). A prompt left with no categories is valid — having at least one is not required.
2. **Deleting the source prompt**: if a `Prompt` that is the source of others (it has children via `sourceId`) is deleted, the children are not deleted and the deletion of the parent is not blocked. The children's `sourceId` field automatically becomes `null` (`ON DELETE SET NULL` at database level, with no additional application logic). No textual trace of the deleted parent (for example, its title) is kept — that would be for a future phase if it is decided to keep history even when the source disappears.
3. **"Create from"**: it duplicates the `title`, `body` and associated `Category` rows of the source prompt, plus the `sourceId` field pointing to it. The `id` and any history are not copied. The new prompt is completely independent and editable from the start.
4. **Variables**: they are detected by convention in the `body` using the `{{variable_name}}` syntax. There is no separate variables table in the MVP — they are extracted from the text at the time of use (frontend or backend, to be decided in iteration 5).

## Diagram (text)

```
Prompt
  id PK
  title
  body
  sourceId FK -> Prompt.id (nullable, ON DELETE SET NULL)
  createdAt
  updatedAt

Category
  id PK
  name (unique)

PromptCategory
  promptId FK -> Prompt.id
  categoryId FK -> Category.id
  PK (promptId, categoryId)
```

## Pending for future iterations (outside the MVP, does not block the start)

- Add `userId` to `Prompt` and `Category` when iteration 6 (user accounts) arrives.
- Decide the `Draft` model in iteration 7b (pending ADR: state in the same record vs. separate entity).
- Possible `PromptVersion` table for version history (iteration 7) — not designed yet.
- Multilingual prompts (iteration 9): `Prompt` would move to having one or more translations (language + title + body). Not designed yet.
