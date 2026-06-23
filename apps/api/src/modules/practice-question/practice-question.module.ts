import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { PracticeQuestionController } from './practice-question.controller';
import { PracticeQuestionService } from './practice-question.service';
import { PracticeQuestionRepository } from './practice-question.repository';
import {
  PracticeQuestionModel,
  PracticeQuestionSchema,
} from './schemas/practice-question.schema';
import { AiReviewModule } from '../ai-review/ai-review.module';
import { MentorTypeModule } from '../mentor-type/mentor-type.module';
import { AiModule } from '../ai/ai.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: PracticeQuestionModel.name, schema: PracticeQuestionSchema },
    ]),
    AiReviewModule,
    MentorTypeModule,
    AiModule,
  ],
  controllers: [PracticeQuestionController],
  providers: [PracticeQuestionService, PracticeQuestionRepository],
  exports: [PracticeQuestionService, PracticeQuestionRepository],
})
export class PracticeQuestionModule {}
