import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import type {
  GeneratedPracticeQuestion,
  PracticeDifficulty,
  PracticeQuestionResponse,
} from '@writer-mentor-ai/shared/practice-question';
import {
  PracticeQuestionModel,
  PracticeQuestionDocument,
} from './schemas/practice-question.schema';

type CreatePracticeQuestionData = GeneratedPracticeQuestion & {
  difficultyLevel: PracticeDifficulty;
  aiReviewId: string;
  contentId: string;
  userId: string;
};

@Injectable()
export class PracticeQuestionRepository {
  constructor(
    @InjectModel(PracticeQuestionModel.name)
    private readonly practiceQuestionModel: Model<PracticeQuestionDocument>,
  ) {}

  findByAiReviewId(aiReviewId: string) {
    return this.practiceQuestionModel
      .find({ aiReviewId: new Types.ObjectId(aiReviewId) })
      .sort({ createdAt: 1 })
      .exec();
  }

  countByAiReviewId(aiReviewId: string) {
    return this.practiceQuestionModel
      .countDocuments({ aiReviewId: new Types.ObjectId(aiReviewId) })
      .exec();
  }

  deleteByAiReviewId(aiReviewId: string): Promise<{ acknowledged: boolean; deletedCount: number }> {
    return this.practiceQuestionModel
      .deleteMany({ aiReviewId: new Types.ObjectId(aiReviewId) })
      .exec();
  }

  findById(id: string) {
    return this.practiceQuestionModel.findById(id).exec();
  }

  createMany(items: CreatePracticeQuestionData[]) {
    return this.practiceQuestionModel.insertMany(
      items.map((item) => ({
        questionType: item.questionType,
        question: item.question,
        correctAnswer: item.correctAnswer,
        options: item.options,
        metadata: item.metadata,
        difficultyLevel: item.difficultyLevel,
        aiReviewId: new Types.ObjectId(item.aiReviewId),
        contentId: new Types.ObjectId(item.contentId),
        userId: item.userId,
        timer: item.timer ?? 60,
        isSolved: false,
        numAttempt: 0,
      })),
    );
  }

  updateAfterSubmit(
    id: string,
    data: {
      userAnswer: string;
      lastMatchPercent: number;
      isSolved: boolean;
    },
  ) {
    return this.practiceQuestionModel
      .findByIdAndUpdate(
        id,
        {
          $inc: { numAttempt: 1 },
          userAnswer: data.userAnswer,
          lastMatchPercent: data.lastMatchPercent,
          isSolved: data.isSolved,
        },
        { new: true },
      )
      .exec();
  }
}

export function toPracticeQuestionResponse(
  entity: PracticeQuestionDocument,
): PracticeQuestionResponse {
  return {
    id: entity._id.toString(),
    questionType: entity.questionType as PracticeQuestionResponse['questionType'],
    question: entity.question,
    options: entity.options ?? null,
    metadata: entity.metadata ?? null,
    difficultyLevel: entity.difficultyLevel as PracticeQuestionResponse['difficultyLevel'],
    aiReviewId: entity.aiReviewId.toString(),
    contentId: entity.contentId.toString(),
    userId: entity.userId ?? null,
    isSolved: entity.isSolved,
    numAttempt: entity.numAttempt,
    timer: entity.timer,
    userAnswer: entity.userAnswer ?? null,
    lastMatchPercent: entity.lastMatchPercent ?? null,
    createdAt: entity.createdAt.toISOString(),
    updatedAt: entity.updatedAt.toISOString(),
  };
}
