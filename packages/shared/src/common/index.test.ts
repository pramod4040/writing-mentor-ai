import { describe, it, expect } from 'vitest';
import { createExampleSchema, exampleResponseSchema } from '../_example/example.schema.js';

describe('example schemas', () => {
  it('validates create input', () => {
    const result = createExampleSchema.safeParse({ title: 'Test' });
    expect(result.success).toBe(true);
  });

  it('validates response shape', () => {
    const result = exampleResponseSchema.safeParse({
      id: '507f1f77bcf86cd799439011',
      title: 'Test',
      description: null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });
    expect(result.success).toBe(true);
  });
});
