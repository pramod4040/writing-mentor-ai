import { Module } from '@nestjs/common';
import { StatsController } from './stats.controller';
import { StatsService } from './stats.service';
import { ContentModule } from '../content/content.module';
import { AiReviewModule } from '../ai-review/ai-review.module';

@Module({
  imports: [ContentModule, AiReviewModule],
  controllers: [StatsController],
  providers: [StatsService],
})
export class StatsModule {}
