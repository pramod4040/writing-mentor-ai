import { Module, forwardRef } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AiReviewService } from './ai-review.service';
import { AiReviewRepository } from './ai-review.repository';
import { AiReviewModel, AiReviewSchema } from './schemas/ai-review.schema';
import { ContentModule } from '../content/content.module';
import { MentorTypeModule } from '../mentor-type/mentor-type.module';
import { AiModule } from '../ai/ai.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: AiReviewModel.name, schema: AiReviewSchema }]),
    forwardRef(() => ContentModule),
    MentorTypeModule,
    AiModule,
  ],
  providers: [AiReviewService, AiReviewRepository],
  exports: [AiReviewService, AiReviewRepository],
})
export class AiReviewModule {}
