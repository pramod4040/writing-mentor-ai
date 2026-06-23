import { Injectable, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { countWords } from '@writer-mentor-ai/shared/common';
import type {
  CreateContentInput,
  UpdateContentInput,
  ContentResponse,
} from '@writer-mentor-ai/shared/content';
import type { PaginationQuery } from '@writer-mentor-ai/shared/common';
import { ContentRepository, toContentResponse } from './content.repository';

@Injectable()
export class ContentService {
  constructor(
    private readonly repository: ContentRepository,
    private readonly config: ConfigService,
  ) {}

  private getDefaultUserId(): string {
    return this.config.getOrThrow<string>('DEFAULT_USER_ID');
  }

  async findAll(query: PaginationQuery) {
    const skip = (query.page - 1) * query.limit;
    const [items, total] = await Promise.all([
      this.repository.findAll(skip, query.limit),
      this.repository.count(),
    ]);
    return {
      data: items.map(toContentResponse),
      total,
      page: query.page,
      limit: query.limit,
      totalPages: Math.ceil(total / query.limit),
    };
  }

  async findOne(id: string): Promise<ContentResponse> {
    const item = await this.repository.findById(id);
    if (!item) throw new NotFoundException(`Content ${id} not found`);
    return toContentResponse(item);
  }

  async create(input: CreateContentInput): Promise<ContentResponse> {
    const item = await this.repository.create({
      shortName: input.shortName,
      question: input.question,
      feedback: input.feedback ?? undefined,
      textContent: input.textContent,
      userId: this.getDefaultUserId(),
      aiReviewedTimes: 0,
      wordCount: countWords(input.textContent),
    });
    return toContentResponse(item);
  }

  async update(id: string, input: UpdateContentInput): Promise<ContentResponse> {
    await this.findOne(id);
    const updateData: Record<string, unknown> = { ...input };
    if (input.feedback === null) {
      updateData.feedback = undefined;
    }
    if (input.textContent !== undefined) {
      updateData.wordCount = countWords(input.textContent);
    }
    const item = await this.repository.update(id, updateData);
    if (!item) throw new NotFoundException(`Content ${id} not found`);
    return toContentResponse(item);
  }

  async remove(id: string): Promise<void> {
    await this.findOne(id);
    await this.repository.delete(id);
  }

  async recordAiReview(id: string, feedback: string): Promise<ContentResponse> {
    const item = await this.repository.incrementAiReviewedTimes(id, feedback);
    if (!item) throw new NotFoundException(`Content ${id} not found`);
    return toContentResponse(item);
  }
}
