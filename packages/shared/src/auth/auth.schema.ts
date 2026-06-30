import { z } from 'zod';
import { paginatedResponseSchema } from '../common/index.js';

export const userRoleSchema = z.enum(['user', 'admin']);

export const userResponseSchema = z.object({
  id: z.string().min(1),
  email: z.string().email(),
  name: z.string().min(1),
  image: z.string().nullable(),
  role: userRoleSchema,
  hasPassword: z.boolean(),
  defaultMentorTypeId: z.string().nullable(),
  dailyAiReviewLimit: z.number().int().min(0),
});

export const loginInputSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
});

export const loginResponseSchema = z.object({
  accessToken: z.string().min(1),
  user: userResponseSchema,
});

export const googleLoginInputSchema = z.object({
  idToken: z.string().min(1),
});

export const setPasswordInputSchema = z
  .object({
    currentPassword: z.preprocess(
      (val) => (val === '' || val === null || val === undefined ? undefined : val),
      z.string().min(8).optional(),
    ),
    password: z.string().min(8),
    confirmPassword: z.string().min(8),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

export const updateUserSettingsInputSchema = z.object({
  name: z.string().min(1).max(200).optional(),
  defaultMentorTypeId: z.string().min(1).nullable().optional(),
});

export type UserRole = z.infer<typeof userRoleSchema>;
export type UserResponse = z.infer<typeof userResponseSchema>;
export type LoginInput = z.infer<typeof loginInputSchema>;
export type LoginResponse = z.infer<typeof loginResponseSchema>;
export type GoogleLoginInput = z.infer<typeof googleLoginInputSchema>;
export type SetPasswordInput = z.infer<typeof setPasswordInputSchema>;
export type UpdateUserSettingsInput = z.infer<typeof updateUserSettingsInputSchema>;

export const userListResponseSchema = paginatedResponseSchema(userResponseSchema);
export type UserListResponse = z.infer<typeof userListResponseSchema>;

export const adminUpdateUserInputSchema = z.object({
  dailyAiReviewLimit: z.number().int().min(0).max(1000),
});

export type AdminUpdateUserInput = z.infer<typeof adminUpdateUserInputSchema>;
