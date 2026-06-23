import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import type {
  CreateContentInput,
  UpdateContentInput,
  ContentResponse,
} from '@writer-mentor-ai/shared/content';
import { ContentModel, ContentDocument } from './schemas/content.schema';

@Injectable()
export class ContentRepository {
  constructor(
    @InjectModel(ContentModel.name) private readonly contentModel: Model<ContentDocument>,
  ) {}

  findAll(skip: number, take: number) {
    return this.contentModel.find().skip(skip).limit(take).sort({ updatedAt: -1 }).exec();
  }

  count() {
    return this.contentModel.countDocuments().exec();
  }

  findById(id: string) {
    return this.contentModel.findById(id).exec();
  }

  create(data: Omit<ContentModel, 'createdAt' | 'updatedAt'>) {
    return this.contentModel.create(data);
  }

  update(id: string, data: Partial<ContentModel>) {
    return this.contentModel.findByIdAndUpdate(id, data, { new: true }).exec();
  }

  delete(id: string) {
    return this.contentModel.findByIdAndDelete(id).exec();
  }

  incrementAiReviewedTimes(id: string, feedback: string) {
    return this.contentModel
      .findByIdAndUpdate(
        id,
        { $inc: { aiReviewedTimes: 1 }, feedback },
        { new: true },
      )
      .exec();
  }
}

export function toContentResponse(entity: ContentDocument): ContentResponse {
  return {
    id: entity._id.toString(),
    shortName: entity.shortName,
    question: entity.question,
    feedback: entity.feedback ?? null,
    textContent: entity.textContent,
    userId: entity.userId,
    aiReviewedTimes: entity.aiReviewedTimes,
    wordCount: entity.wordCount,
    createdAt: entity.createdAt.toISOString(),
    updatedAt: entity.updatedAt.toISOString(),
  };
}
