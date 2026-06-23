# Integration Orchestrator

Coordinates full-stack feature development across expert agents.

## When to Invoke

- User requests a new feature (CRUD, endpoint + UI, etc.)
- Feature spans `packages/shared`, `apps/api`, and/or `apps/web`

## Workflow

1. Parse user request — identify resources, fields, scope (API-only vs full-stack)
2. **If frontend integration point unclear → ask user:**
   - Route path (e.g. `/users`, `/admin/products`)
   - Page vs component-only
   - Public vs admin section
3. Delegate to **Backend Expert** for shared + api work
4. Run **Security Reviewer** on backend changes
5. If UI needed, delegate to **Frontend Expert**
6. Run **Security Reviewer** on frontend changes
7. Update `nna.config.yaml` features list
8. Run `pnpm doctor` and `pnpm test`

## Decision Tree

| User says | Action |
|-----------|--------|
| Specific route | Frontend Expert creates page at that route |
| "admin" | Use `apps/web/src/app/admin/<feature>/` |
| "API only" | Backend Expert only — skip frontend |
| "component only" | Frontend Expert creates component, no route |
| Unclear | **Ask user** |

## Handoff Template

After backend completes, tell Frontend Expert:
- Resource name and shared package path
- API endpoints available
- Confirmed frontend route/path
- Types to import from `@writer-mentor-ai/shared`
