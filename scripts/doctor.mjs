#!/usr/bin/env node
/**
 * Standalone doctor script for scaffolded projects.
 * No external dependencies — runs before pnpm install.
 */
import { readFileSync, readdirSync, statSync, existsSync } from 'node:fs';
import { join, extname } from 'node:path';

const root = process.cwd();
let errors = 0;
let warnings = 0;

function error(code, message, file) {
  console.error(`✗ [${code}] ${message}${file ? ` (${file})` : ''}`);
  errors++;
}

function warn(code, message, file) {
  console.warn(`⚠ [${code}] ${message}${file ? ` (${file})` : ''}`);
  warnings++;
}

function walk(dir, files = []) {
  if (!existsSync(dir)) return files;
  for (const e of readdirSync(dir)) {
    const f = join(dir, e);
    if (statSync(f).isDirectory() && !['node_modules', 'dist', '.next'].includes(e)) walk(f, files);
    else if (statSync(f).isFile() && ['.ts', '.tsx'].includes(extname(e))) files.push(f);
  }
  return files;
}

function parseSimpleYaml(content) {
  const sharedMatch = content.match(/shared:\s*\n\s*path:\s*(.+)/);
  const sharedPath = sharedMatch?.[1]?.trim() ?? './packages/shared';
  const frontendMatch = content.match(/frontend:\s*\n\s*path:\s*(.+)/);
  const frontendPath = frontendMatch?.[1]?.trim() ?? './apps/web';
  const dbMatch = content.match(/backend:\s*\n[\s\S]*?\n\s*db:\s*(\S+)/);
  const db = dbMatch?.[1]?.trim() ?? 'mongo';
  const features = [];
  const featuresSection = content.match(/features:\s*\n([\s\S]*?)(?=\n[a-z]|$)/);
  if (featuresSection) {
    const blocks = featuresSection[1].matchAll(/-\s*name:\s*(\S+)/g);
    for (const m of blocks) {
      const start = m.index ?? 0;
      const chunk = featuresSection[1].slice(start, start + 400);
      features.push({
        name: m[1],
        shared: chunk.match(/shared:\s*(.+)/)?.[1]?.trim(),
        backend: chunk.match(/backend:\s*(.+)/)?.[1]?.trim(),
      });
    }
  }
  return { sharedPath, frontendPath, db, features };
}

const configPath = join(root, 'nna.config.yaml');
if (!existsSync(configPath)) {
  error('CONFIG_MISSING', 'nna.config.yaml not found');
  process.exit(1);
}

const config = parseSimpleYaml(readFileSync(configPath, 'utf-8'));

const sharedPath = join(root, config.sharedPath);
const forbidden = ['@prisma/client', 'mongoose', '@nestjs/common'];
for (const file of walk(join(sharedPath, 'src'))) {
  const content = readFileSync(file, 'utf-8');
  for (const imp of forbidden) {
    if (content.includes(`'${imp}'`) || content.includes(`"${imp}"`)) {
      error('SHARED_FORBIDDEN_IMPORT', `Forbidden import "${imp}"`, file);
    }
  }
}

const envExample = join(root, '.env.example');
if (!existsSync(envExample)) {
  warn('ENV_EXAMPLE_MISSING', 'Missing .env.example');
} else {
  const env = readFileSync(envExample, 'utf-8');
  const dbKey = config.db === 'mongo' ? 'MONGODB_URI' : 'DATABASE_URL';
  for (const key of [dbKey, 'REDIS_URL', 'JWT_SECRET', 'NEXT_PUBLIC_API_URL']) {
    if (!env.includes(key)) warn('ENV_KEY_MISSING', `.env.example should document ${key}`);
  }
}

for (const feature of config.features) {
  if (feature.shared && !existsSync(join(root, feature.shared))) {
    error('FEATURE_SHARED_MISSING', `Feature "${feature.name}" shared path missing: ${feature.shared}`);
  }
  if (feature.backend && !existsSync(join(root, feature.backend))) {
    error('FEATURE_BACKEND_MISSING', `Feature "${feature.name}" backend path missing: ${feature.backend}`);
  }
}

const webPath = join(root, config.frontendPath, 'src');
for (const file of walk(webPath)) {
  const content = readFileSync(file, 'utf-8');
  if (/from\s+['"].*apps\/api/.test(content)) {
    error('FE_BACKEND_IMPORT', 'Frontend must not import backend code', file);
  }
}

if (errors > 0) {
  console.error(`\n${errors} error(s), ${warnings} warning(s)`);
  process.exit(1);
}
console.log(`✓ All checks passed.${warnings ? ` (${warnings} warning(s))` : ''}`);
