import { Module, forwardRef } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ContentController } from './content.controller';
import { ContentService } from './content.service';
import { ContentRepository } from './content.repository';
import { ContentModel, ContentSchema } from './schemas/content.schema';
import { AiReviewModule } from '../ai-review/ai-review.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: ContentModel.name, schema: ContentSchema }]),
    forwardRef(() => AiReviewModule),
  ],
  controllers: [ContentController],
  providers: [ContentService, ContentRepository],
  exports: [ContentService, ContentRepository],
})
export class ContentModule {}
