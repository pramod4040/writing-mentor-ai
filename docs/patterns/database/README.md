# Database Adapters

## MongoDB (default)

Default for new projects. Config in `nna.config.yaml`:

```yaml
backend:
  db: mongo
  orm: mongoose
```

- Connection: `MONGODB_URI` env var (required)
- Module: `apps/api/src/database/mongoose/database.module.ts`
- Schemas live in `apps/api` only — never in `packages/shared`

## Prisma (PostgreSQL / MySQL)

Scaffold with `--db postgres` or `--db mysql`:

```yaml
backend:
  db: postgres  # or mysql
  orm: prisma
```

- Connection: `DATABASE_URL` env var (required)
- Schema: `apps/api/prisma/schema.prisma`
- Module: `apps/api/src/database/prisma/prisma.module.ts`

## Redis (always required)

All projects require Redis for caching/sessions:

```env
REDIS_URL=redis://localhost:6379
```

Docker Compose always includes a `redis` service alongside the selected database.
