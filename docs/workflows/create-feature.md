# Create a New Feature — End-to-End Workflow

## Prerequisites

- Project scaffolded via `nna init`
- `pnpm install` completed
- `.env` configured from `.env.example`
- Docker DB running: `docker compose -f docker-compose.dev.yml up -d`

## Steps

### 1. Integration Orchestrator

- Read user request
- Confirm scope: API-only vs full-stack
- **Ask user** for frontend route if not specified

### 2. Backend Expert

```text
packages/shared/src/<feature>/
  ├── <feature>.schema.ts   # Zod schemas
  ├── <feature>.types.ts    # type exports
  └── index.ts

apps/api/src/modules/<feature>/
  ├── <feature>.module.ts
  ├── <feature>.controller.ts
  ├── <feature>.service.ts
  ├── <feature>.repository.ts
  ├── dto/
  └── __tests__/
```

- Add Prisma model to `schema.prisma`
- Run `pnpm --filter api prisma migrate dev`

### 3. Security Reviewer (backend)

- Check shared boundary
- Verify no secrets in responses
- Confirm auth guards on protected routes

### 4. Frontend Expert (if UI needed)

```text
apps/web/src/lib/hooks/use-<feature>.ts
apps/web/src/components/<feature>/
apps/web/src/app/<route>/page.tsx
```

### 5. Security Reviewer (frontend)

- No backend imports
- Only NEXT_PUBLIC env on client

### 6. Finalize

- Update `nna.config.yaml` features list
- Run `pnpm doctor`
- Run `pnpm test`

## Example Reference

See live `_example` / `examples` feature in the scaffold.
