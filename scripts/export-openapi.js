import { writeFileSync, mkdirSync, existsSync } from 'node:fs';
import { join } from 'node:path';

/**
 * Placeholder OpenAPI export script.
 * After building api, AI agents or developers can replace this with
 * a Swagger JSON export from the running NestJS app.
 */
const outDir = join(process.cwd(), 'apps/api/openapi');
const outFile = join(outDir, 'openapi.json');

if (!existsSync(outDir)) mkdirSync(outDir, { recursive: true });

const placeholder = {
  openapi: '3.0.0',
  info: { title: 'API', version: '1.0.0' },
  paths: {
    '/api/health': { get: { summary: 'Health check' } },
    '/api/examples': { get: { summary: 'List examples' }, post: { summary: 'Create example' } },
  },
};

writeFileSync(outFile, JSON.stringify(placeholder, null, 2));
console.log(`Wrote placeholder OpenAPI spec to ${outFile}`);
