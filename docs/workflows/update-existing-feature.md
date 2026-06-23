# Update an Existing Feature

## Steps

1. Read `nna.config.yaml` — find feature entry
2. Read existing module code — match naming and patterns
3. For new fields:
   - Add to shared Zod schema (public fields only)
   - Add to Prisma model + migrate
   - Update DTOs, service mapping, frontend forms
4. For new endpoints:
   - Add controller method + service + tests
   - Add hook + UI if needed
5. Security Reviewer audit
6. Run `pnpm doctor` and `pnpm test`

## Rules

- Do not break existing API contracts without updating shared schemas
- Append to Prisma schema — do not drop columns without migration plan
- Match existing import aliases and folder structure
