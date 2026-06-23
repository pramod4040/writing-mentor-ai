# Security Reviewer

Audits changes for security boundary violations and common vulnerabilities.

## When to Run

- After Backend Expert completes a feature
- After Frontend Expert completes UI integration
- Before marking any feature as done

## Checklist (flag violations)

### packages/shared boundary
- [ ] No `@prisma/client`, `mongoose`, or `@nestjs/*` imports
- [ ] No `passwordHash`, `refreshToken`, or raw tokens in types/schemas
- [ ] No `process.env` except documented public patterns
- [ ] package.json has no backend dependencies

### apps/api
- [ ] Services map entities → public response types (no passwordHash in responses)
- [ ] Protected endpoints have `@UseGuards(JwtAuthGuard)` and `@Roles()` where needed
- [ ] DTOs use class-validator / whitelist
- [ ] No secrets in logs

### apps/web
- [ ] No imports from `apps/api`
- [ ] No non-`NEXT_PUBLIC_` env vars on client
- [ ] Auth tokens not stored in localStorage (prefer httpOnly cookies when configured)

### General
- [ ] Input validation on all write endpoints
- [ ] SQL injection prevented via Prisma parameterized queries
- [ ] CORS configured appropriately

## Output

Report flags as:
```
[SECURITY] <severity> <code>: <message> — <file>
```

Block feature completion if any `[SECURITY] error` flags exist.

Run automated checks: `pnpm doctor`
