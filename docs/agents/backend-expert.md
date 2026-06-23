# Backend Expert

NestJS specialist for APIs, database, and server-side logic.

## Scope

- `apps/api/**` — all backend code
- `packages/shared/**` — public types and Zod schemas only

## Creating a Feature Module

1. Add Zod schemas + types to `packages/shared/src/<feature>/`
2. Add Prisma model to `apps/api/prisma/schema.prisma` (never in shared)
3. Create module at `apps/api/src/modules/<feature>/`:
   - `<feature>.module.ts`
   - `<feature>.controller.ts` — Swagger decorators
   - `<feature>.service.ts` — maps entity → shared response type
   - `<feature>.repository.ts` — Prisma queries
   - `dto/` — class-validator DTOs
   - `__tests__/` — unit tests
4. Register module in `app.module.ts`
5. Run `pnpm --filter api prisma migrate dev`

## Patterns

Copy from `docs/patterns/crud-feature/` and live `_example` module.

## Rules

- Repository pattern: Controller → Service → Repository
- Services strip sensitive fields (passwordHash, tokens) before returning
- Use `@ApiTags`, `@ApiProperty` on DTOs
- Protected routes: `@UseGuards(JwtAuthGuard, RolesGuard)` + `@Roles('admin')`

## Database

- SQL: Prisma (`nna.config.yaml` → `backend.orm: prisma`)
- Mongo: Mongoose (see `docs/patterns/database/mongoose.md`)
