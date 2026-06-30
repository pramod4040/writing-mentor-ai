import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import type { AiReviewResponse } from '@writer-mentor-ai/shared/ai-review';
import type { StructuredAiReview } from '@writer-mentor-ai/shared/ai-review';
import { AiReviewModel, AiReviewDocument } from './schemas/ai-review.schema';

type CreateAiReviewData = {
  contentId: string;
  textContent: string;
  aiGeneratedReview: string;
  mentorTypeId: string;
  mentorTypeName?: string;
  userId?: string;
  structured: StructuredAiReview;
};

@Injectable()
export class AiReviewRepository {
  constructor(
    @InjectModel(AiReviewModel.name) private readonly aiReviewModel: Model<AiReviewDocument>,
  ) {}

  findByContentId(contentId: string) {
    return this.aiReviewModel
      .find({ contentId: new Types.ObjectId(contentId) })
      .sort({ createdAt: -1 })
      .exec();
  }

  findById(id: string) {
    return this.aiReviewModel.findById(id).exec();
  }

  count() {
    return this.aiReviewModel.countDocuments().exec();
  }

  countByUserId(userId: string) {
    return this.aiReviewModel.countDocuments({ userId }).exec();
  }

  countByUserIdSince(userId: string, since: Date) {
    return this.aiReviewModel
      .countDocuments({ userId, createdAt: { $gte: since } })
      .exec();
  }

  findOldestSince(userId: string, since: Date) {
    return this.aiReviewModel
      .findOne({ userId, createdAt: { $gte: since } })
      .sort({ createdAt: 1 })
      .select('createdAt')
      .exec();
  }

  create(data: CreateAiReviewData) {
    return this.aiReviewModel.create({
      contentId: new Types.ObjectId(data.contentId),
      textContent: data.textContent,
      aiGeneratedReview: data.aiGeneratedReview,
      mentorTypeId: new Types.ObjectId(data.mentorTypeId),
      mentorTypeName: data.mentorTypeName,
      userId: data.userId,
      overallScore: data.structured.overallScore,
      estimatedBand: data.structured.estimatedBand,
      scores: data.structured.scores,
      summary: data.structured.summary,
      priorityImprovements: data.structured.priorityImprovements,
      mistakes: data.structured.mistakes,
      feedback: data.structured.feedback,
      learningPlan: data.structured.learningPlan,
    });
  }
}

export function toAiReviewResponse(entity: AiReviewDocument): AiReviewResponse {
  return {
    id: entity._id.toString(),
    contentId: entity.contentId.toString(),
    textContent: entity.textContent,
    aiGeneratedReview: entity.aiGeneratedReview,
    mentorTypeId: entity.mentorTypeId.toString(),
    mentorTypeName: entity.mentorTypeName ?? null,
    userId: entity.userId ?? null,
    overallScore: entity.overallScore ?? null,
    estimatedBand: entity.estimatedBand ?? null,
    scores: entity.scores ?? null,
    summary: entity.summary ?? null,
    priorityImprovements: entity.priorityImprovements ?? null,
    mistakes: entity.mistakes ?? null,
    feedback: entity.feedback ?? null,
    learningPlan: entity.learningPlan ?? null,
    createdAt: entity.createdAt.toISOString(),
    updatedAt: entity.updatedAt.toISOString(),
  };
}
