import { describe, it, expect } from 'vitest';
import { setPasswordInputSchema } from './auth.schema.js';

describe('setPasswordInputSchema', () => {
  it('accepts password without currentPassword when empty string is provided', () => {
    const result = setPasswordInputSchema.safeParse({
      currentPassword: '',
      password: 'password123',
      confirmPassword: 'password123',
    });
    expect(result.success).toBe(true);
  });

  it('rejects mismatched passwords', () => {
    const result = setPasswordInputSchema.safeParse({
      password: 'password123',
      confirmPassword: 'password456',
    });
    expect(result.success).toBe(false);
  });
});
