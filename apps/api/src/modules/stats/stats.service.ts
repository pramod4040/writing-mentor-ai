import { Injectable } from '@nestjs/common';
import type { StatsResponse } from '@writer-mentor-ai/shared/stats';
import { ContentRepository } from '../content/content.repository';
import { AiReviewRepository } from '../ai-review/ai-review.repository';

@Injectable()
export class StatsService {
  constructor(
    private readonly contentRepository: ContentRepository,
    private readonly aiReviewRepository: AiReviewRepository,
  ) {}

  async getStats(): Promise<StatsResponse> {
    const [contentCount, aiReviewCount] = await Promise.all([
      this.contentRepository.count(),
      this.aiReviewRepository.count(),
    ]);
    return { contentCount, aiReviewCount };
  }
}
