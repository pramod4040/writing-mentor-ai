# CRUD Feature Pattern

Copy this structure for new backend modules. See live implementation:

- `apps/api/src/modules/_example/`
- `packages/shared/src/_example/`

## Checklist

- [ ] Shared Zod schemas + types in packages/shared
- [ ] Prisma model in apps/api/prisma/schema.prisma
- [ ] Repository with Prisma queries
- [ ] Service maps entity → shared response (toXxxResponse helper)
- [ ] Controller with Swagger decorators
- [ ] Module registered in app.module.ts
- [ ] Unit tests for service
- [ ] Feature added to nna.config.yaml

## Entity → Response Mapping

```typescript
export function toUserResponse(entity: User): UserResponse {
  return {
    id: entity.id,
    email: entity.email,
    // NEVER include passwordHash
  };
}
```
