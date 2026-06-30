import type { UserResponse } from '@writer-mentor-ai/shared/auth';
import { DEFAULT_DAILY_AI_REVIEW_LIMIT } from '@writer-mentor-ai/shared/ai-review';
import type { UserDocument } from './schemas/user.schema';

export function toUserResponse(user: UserDocument): UserResponse {
  return {
    id: user._id.toString(),
    email: user.email,
    name: user.name,
    image: user.image ?? null,
    role: user.role as UserResponse['role'],
    hasPassword: !!user.passwordHash,
    defaultMentorTypeId: user.defaultMentorTypeId ?? null,
    dailyAiReviewLimit: user.dailyAiReviewLimit ?? DEFAULT_DAILY_AI_REVIEW_LIMIT,
  };
}

export type AuthUser = {
  id: string;
  email: string;
  role: string;
};

export function toAuthUser(user: UserDocument): AuthUser {
  return {
    id: user._id.toString(),
    email: user.email,
    role: user.role,
  };
}
