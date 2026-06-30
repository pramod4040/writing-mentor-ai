import {
  HttpException,
  HttpStatus,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { ConfigService } from '@nestjs/config';
import { Model } from 'mongoose';
import {
  AI_REVIEW_WINDOW_MS,
  DEFAULT_DAILY_AI_REVIEW_LIMIT,
  type AiReviewQuotaResponse,
} from '@writer-mentor-ai/shared/ai-review';
import { UserModel, UserDocument } from '@/auth/schemas/user.schema';
import { AiReviewRepository } from './ai-review.repository';

@Injectable()
export class AiReviewQuotaService {
  constructor(
    @InjectModel(UserModel.name) private readonly userModel: Model<UserDocument>,
    private readonly repository: AiReviewRepository,
    private readonly config: ConfigService,
  ) {}

  async getQuota(userId: string): Promise<AiReviewQuotaResponse> {
    const user = await this.userModel.findById(userId).exec();
    if (!user) throw new NotFoundException('User not found');

    const limit = this.resolveLimit(user);
    const since = new Date(Date.now() - AI_REVIEW_WINDOW_MS);
    const used = await this.repository.countByUserIdSince(userId, since);
    const remaining = Math.max(0, limit - used);
    const resetsAt =
      used >= limit ? await this.computeResetsAt(userId, since) : null;

    return { used, limit, remaining, resetsAt };
  }

  async assertWithinDailyLimit(userId: string): Promise<void> {
    const quota = await this.getQuota(userId);
    if (quota.used >= quota.limit) {
      throw new HttpException(
        {
          statusCode: HttpStatus.TOO_MANY_REQUESTS,
          message: 'Daily AI review limit reached',
          used: quota.used,
          limit: quota.limit,
          resetsAt: quota.resetsAt,
        },
        HttpStatus.TOO_MANY_REQUESTS,
      );
    }
  }

  private resolveLimit(user: UserDocument): number {
    if (user.dailyAiReviewLimit != null) {
      return user.dailyAiReviewLimit;
    }
    return (
      this.config.get<number>('DEFAULT_DAILY_AI_REVIEW_LIMIT') ??
      DEFAULT_DAILY_AI_REVIEW_LIMIT
    );
  }

  private async computeResetsAt(
    userId: string,
    since: Date,
  ): Promise<string | null> {
    const oldest = await this.repository.findOldestSince(userId, since);
    if (!oldest?.createdAt) return null;
    return new Date(
      oldest.createdAt.getTime() + AI_REVIEW_WINDOW_MS,
    ).toISOString();
  }
}
