import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { generateShortName } from '@writer-mentor-ai/shared/common';
import type { AiReviewResponse } from '@writer-mentor-ai/shared/ai-review';
import type { SaveAndReviewInput, SaveAndReviewResponse } from '@writer-mentor-ai/shared/content';
import { AiReviewRepository, toAiReviewResponse } from './ai-review.repository';
import { ContentService } from '../content/content.service';
import { MentorTypeService } from '../mentor-type/mentor-type.service';
import { AiService } from '../ai/ai.service';

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
    private readonly config: ConfigService,
  ) {}

  async findByContentId(contentId: string): Promise<AiReviewResponse[]> {
    await this.contentService.findOne(contentId);
    const items = await this.repository.findByContentId(contentId);
    return items.map(toAiReviewResponse);
  }

  async generateReview(
    contentId: string,
    mentorTypeId: string,
    contentUpdate?: ContentUpdateBeforeReview,
  ): Promise<AiReviewResponse> {
    let content = await this.contentService.findOne(contentId);

    if (contentUpdate?.question || contentUpdate?.textContent) {
      const shortName = generateShortName(
        contentUpdate.textContent ?? content.textContent,
      );
      content = await this.contentService.update(contentId, {
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

    const userId = this.config.getOrThrow<string>('DEFAULT_USER_ID');
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

    await this.contentService.recordAiReview(contentId, feedbackSummary);

    return toAiReviewResponse(review);
  }

  async saveAndReview(input: SaveAndReviewInput): Promise<SaveAndReviewResponse> {
    const shortName = generateShortName(input.textContent);
    const content = input.contentId
      ? await this.contentService.update(input.contentId, {
          shortName,
          question: input.question,
          textContent: input.textContent,
        })
      : await this.contentService.create({
          shortName,
          question: input.question,
          textContent: input.textContent,
        });

    const review = await this.generateReview(content.id, input.mentorTypeId);
    return { content, review };
  }

  async count(): Promise<number> {
    return this.repository.count();
  }
}
