# Auth Pattern (JWT)

Reference implementation in `apps/api/src/auth/`.

## Backend

- `AuthModule` with JWT + Passport
- `AuthService.login()` — validates password, returns accessToken + public user
- `@UseGuards(JwtAuthGuard, RolesGuard)` + `@Roles('admin')` on protected routes
- User model with passwordHash — **never** expose in shared or responses

## Frontend (AI extends)

- Auth hook in `src/lib/hooks/use-auth.ts`
- Middleware in `src/middleware.ts` for protected routes
- Store token in httpOnly cookie (preferred) or memory

See `docs/agents/backend-expert.md` for extension guidance.
