import { Module, forwardRef } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AiReviewService } from './ai-review.service';
import { AiReviewRepository } from './ai-review.repository';
import { AiReviewQuotaService } from './ai-review-quota.service';
import { AiReviewModel, AiReviewSchema } from './schemas/ai-review.schema';
import { UserModel, UserSchema } from '@/auth/schemas/user.schema';
import { ContentModule } from '../content/content.module';
import { MentorTypeModule } from '../mentor-type/mentor-type.module';
import { AiModule } from '../ai/ai.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: AiReviewModel.name, schema: AiReviewSchema },
      { name: UserModel.name, schema: UserSchema },
    ]),
    forwardRef(() => ContentModule),
    MentorTypeModule,
    AiModule,
  ],
  providers: [AiReviewService, AiReviewRepository, AiReviewQuotaService],
  exports: [AiReviewService, AiReviewRepository, AiReviewQuotaService],
})
export class AiReviewModule {}
