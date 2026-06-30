import { Injectable } from '@nestjs/common';
import { generateShortName } from '@writer-mentor-ai/shared/common';
import type { AiReviewResponse } from '@writer-mentor-ai/shared/ai-review';
import type { SaveAndReviewInput, SaveAndReviewResponse } from '@writer-mentor-ai/shared/content';
import { AiReviewRepository, toAiReviewResponse } from './ai-review.repository';
import { ContentService } from '../content/content.service';
import { MentorTypeService } from '../mentor-type/mentor-type.service';
import { AiService } from '../ai/ai.service';
import { AiReviewQuotaService } from './ai-review-quota.service';

type ContentUpdateBeforeReview = {
  question?: string;
  textContent?: string;
};

@Injectable()
export class AiReviewService {
  constructor(
    private readonly repository: AiReviewRepository,
    private readonly contentService: ContentService,
    private readonly mentorTypeService: MentorTypeService,
    private readonly aiService: AiService,
    private readonly quotaService: AiReviewQuotaService,
  ) {}

  async findByContentId(contentId: string, userId: string): Promise<AiReviewResponse[]> {
    await this.contentService.findOne(contentId, userId);
    const items = await this.repository.findByContentId(contentId);
    return items.map(toAiReviewResponse);
  }

  async generateReview(
    contentId: string,
    mentorTypeId: string,
    userId: string,
    contentUpdate?: ContentUpdateBeforeReview,
  ): Promise<AiReviewResponse> {
    await this.quotaService.assertWithinDailyLimit(userId);

    let content = await this.contentService.findOne(contentId, userId);

    if (contentUpdate?.question || contentUpdate?.textContent) {
      const shortName = generateShortName(
        contentUpdate.textContent ?? content.textContent,
      );
      content = await this.contentService.update(contentId, userId, {
        shortName,
        question: contentUpdate.question ?? content.question,
        textContent: contentUpdate.textContent ?? content.textContent,
      });
    }

    const mentorType = await this.mentorTypeService.findOne(mentorTypeId);

    const structured = await this.aiService.generateReview({
      systemPrompt: mentorType.systemPrompt,
      question: content.question,
      textContent: content.textContent,
    });

    const feedbackSummary = `Band ${structured.estimatedBand}`;

    const review = await this.repository.create({
      contentId,
      textContent: content.textContent,
      aiGeneratedReview: JSON.stringify(structured),
      mentorTypeId,
      mentorTypeName: mentorType.name,
      userId,
      structured,
    });

    await this.contentService.recordAiReview(contentId, userId, feedbackSummary);

    return toAiReviewResponse(review);
  }

  async saveAndReview(userId: string, input: SaveAndReviewInput): Promise<SaveAndReviewResponse> {
    const shortName = generateShortName(input.textContent);
    const content = input.contentId
      ? await this.contentService.update(input.contentId, userId, {
          shortName,
          question: input.question,
          textContent: input.textContent,
        })
      : await this.contentService.create(userId, {
          shortName,
          question: input.question,
          textContent: input.textContent,
        });

    const review = await this.generateReview(content.id, input.mentorTypeId, userId);
    return { content, review };
  }

  async countByUserId(userId: string): Promise<number> {
    return this.repository.countByUserId(userId);
  }

  getQuota(userId: string) {
    return this.quotaService.getQuota(userId);
  }
}
