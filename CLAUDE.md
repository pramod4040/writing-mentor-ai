# CLAUDE.md — Claude Code Guide

Read [AGENTS.md](AGENTS.md) first for architecture and workflows.

## Claude Code Specifics

- Use `Read` and `Edit` tools across monorepo packages in dependency order: `packages/shared` → `apps/api` → `apps/web`
- For full-stack features, invoke expert agent instructions from `docs/agents/`
- Prefer copying from `docs/patterns/` over generating new structures
- Run `pnpm doctor` via Bash after completing a feature

## Subagent Delegation

When using subagents, assign by expertise:

| Task | Agent doc |
|------|-----------|
| NestJS module, Prisma | `docs/agents/backend-expert.md` |
| React UI, hooks | `docs/agents/frontend-expert.md` |
| Security audit | `docs/agents/security-reviewer.md` |
| Full-stack coordination | `docs/agents/integration-orchestrator.md` |

## Ask User Before Proceeding

If the request does not specify:
- Where to place the frontend page (route path)
- Whether to create API only or full-stack UI
- Admin vs public section

## Key Constraints

- Never put Prisma/Mongoose models in `packages/shared`
- Frontend imports only from `@writer-mentor-ai/shared`
- Map entities to public response types in services
