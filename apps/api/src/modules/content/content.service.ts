import { Injectable, ForbiddenException, NotFoundException } from '@nestjs/common';
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
  constructor(private readonly repository: ContentRepository) {}

  async findAll(userId: string, query: PaginationQuery) {
    const skip = (query.page - 1) * query.limit;
    const [items, total] = await Promise.all([
      this.repository.findAllByUserId(userId, skip, query.limit),
      this.repository.countByUserId(userId),
    ]);
    return {
      data: items.map(toContentResponse),
      total,
      page: query.page,
      limit: query.limit,
      totalPages: Math.ceil(total / query.limit),
    };
  }

  async findOne(id: string, userId: string): Promise<ContentResponse> {
    const item = await this.repository.findById(id);
    if (!item) throw new NotFoundException(`Content ${id} not found`);
    if (item.userId !== userId) throw new ForbiddenException();
    return toContentResponse(item);
  }

  async create(userId: string, input: CreateContentInput): Promise<ContentResponse> {
    const item = await this.repository.create({
      shortName: input.shortName,
      question: input.question,
      feedback: input.feedback ?? undefined,
      textContent: input.textContent,
      userId,
      aiReviewedTimes: 0,
      wordCount: countWords(input.textContent),
    });
    return toContentResponse(item);
  }

  async update(
    id: string,
    userId: string,
    input: UpdateContentInput,
  ): Promise<ContentResponse> {
    await this.findOne(id, userId);
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

  async remove(id: string, userId: string): Promise<void> {
    await this.findOne(id, userId);
    await this.repository.delete(id);
  }

  async recordAiReview(
    id: string,
    userId: string,
    feedback: string,
  ): Promise<ContentResponse> {
    await this.findOne(id, userId);
    const item = await this.repository.incrementAiReviewedTimes(id, feedback);
    if (!item) throw new NotFoundException(`Content ${id} not found`);
    return toContentResponse(item);
  }
}
