# CURSOR.md — Cursor Agent Guide

Read [AGENTS.md](AGENTS.md) first for architecture and workflows.

## Cursor-Specific Setup

- **Rules:** `.cursor/rules/*.mdc` apply automatically by file scope
- **Expert agents:** `.cursor/agents/*.md` — reference when delegating work
- **Plan mode:** Use for large features; execute after plan approval

## Recommended Workflow in Cursor

1. Open `nna.config.yaml` for project context
2. For full-stack features, follow `.cursor/agents/integration-orchestrator.md`
3. Use `@docs/patterns` when implementing new modules
4. Run terminal: `pnpm doctor` after changes
5. Use Agent mode for multi-file edits across `apps/api`, `apps/web`, `packages/shared`

## When to Ask the User

- Frontend route/path not specified
- Admin vs public placement unclear
- API-only vs full-stack not stated
- Auth requirements ambiguous

## File Scope Rules

| Rule | Applies to |
|------|-----------|
| `nestjs-backend.mdc` | `apps/api/**` |
| `nextjs-frontend.mdc` | `apps/web/**` |
| `shared-package-boundary.mdc` | `packages/shared/**` |
| `fullstack-workflow.mdc` | always |
| `security-flags.mdc` | always |

## Commands

```bash
pnpm dev             # start api + web
pnpm doctor          # validate project
docker compose -f docker-compose.dev.yml up -d
```
