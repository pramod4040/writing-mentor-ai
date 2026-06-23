# AGENTS.md — Nest-Next AI Framework

Universal entry point for all AI coding agents (Cursor, Claude Code, Gemini).

## Architecture

- **Monorepo:** Turborepo with `apps/api` (NestJS), `apps/web` (Next.js), `packages/shared`
- **Code sharing:** Only `packages/shared` — types, Zod schemas, safe utils. **Never** DB models or auth internals.
- **Config:** Read `nna.config.yaml` before any work.

## Expert Agents

| Agent | When to use |
|-------|-------------|
| [Integration Orchestrator](docs/agents/integration-orchestrator.md) | New full-stack features — start here |
| [Backend Expert](docs/agents/backend-expert.md) | APIs, Prisma, DTOs, services |
| [Frontend Expert](docs/agents/frontend-expert.md) | UI, hooks, pages, forms |
| [Security Reviewer](docs/agents/security-reviewer.md) | After BE/FE changes, before completing |

## Create a New Feature (workflow)

1. Read `nna.config.yaml`
2. **Integration Orchestrator** parses request — if frontend route unclear, **ask the user**
3. **Backend Expert:** shared types/schemas → `apps/api` module → tests
4. **Security Reviewer:** audit shared boundary + API responses
5. **Frontend Expert:** hooks → components → pages → tests
6. **Security Reviewer:** audit frontend imports
7. Update `nna.config.yaml` feature registry
8. Run `pnpm doctor` and `pnpm test`

## Reference Patterns

Copy from `docs/patterns/` — do not invent new structures:

- `crud-feature/` — full backend module
- `frontend/` — hooks, forms, pages
- `shared/` — types + Zod schemas
- `auth/` — JWT skeleton
- `testing/` — unit and e2e tests

## Shared Package Boundary

**Allowed:** public types, Zod schemas, enums, pagination utils, error shapes  
**Forbidden:** Prisma, Mongoose, `@nestjs/*`, password hashes, env secrets

Services must map entities → shared response types (strip sensitive fields).

## Validation

```bash
pnpm doctor          # shared boundary, contracts, env
pnpm test            # all tests
pnpm lint            # lint all packages
```

## Platform-Specific Guides

- Cursor: [CURSOR.md](CURSOR.md)
- Claude Code: [CLAUDE.md](CLAUDE.md)
- Gemini: [GEMINI.md](GEMINI.md)
