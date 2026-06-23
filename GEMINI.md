# GEMINI.md — Gemini Agent Guide

Read [AGENTS.md](AGENTS.md) first for architecture and workflows.

## Gemini Specifics

- Load `nna.config.yaml` and relevant `docs/patterns/` files into context before coding
- Edit files in order: shared types → backend module → frontend integration
- Use multi-file edits for consistent cross-package changes
- Validate with `pnpm doctor` after implementation

## Expert Agent References

See `docs/agents/` for role-specific instructions:

- `backend-expert.md` — NestJS, Prisma, Swagger
- `frontend-expert.md` — Next.js, TanStack Query, shadcn/ui
- `security-reviewer.md` — boundary and secret checks
- `integration-orchestrator.md` — full-stack coordination

## Ask User When Unclear

- Frontend route or page location
- Component-only vs full page
- API-only vs full-stack scope

## Security Rules

- `packages/shared`: types and Zod only — no DB or NestJS imports
- Strip `passwordHash` and internal fields before API responses
- No backend imports in `apps/web`
