import { Body, Controller, Get, Param, Patch, Post } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { PracticeQuestionService } from './practice-question.service';
import { SubmitPracticeAnswerDto } from './dto/practice-question.dto';
import { CurrentUser } from '@/common/decorators/current-user.decorator';
import type { AuthUser } from '@/auth/auth.mapper';

@ApiTags('practice-questions')
@Controller()
export class PracticeQuestionController {
  constructor(private readonly service: PracticeQuestionService) {}

  @Post('ai-reviews/:reviewId/practice-questions/generate')
  @ApiOperation({ summary: 'Generate practice questions for an AI review' })
  generate(@CurrentUser() user: AuthUser, @Param('reviewId') reviewId: string) {
    return this.service.generateForReview(reviewId, user.id);
  }

  @Get('ai-reviews/:reviewId/practice-questions')
  @ApiOperation({ summary: 'List practice questions for an AI review' })
  list(@CurrentUser() user: AuthUser, @Param('reviewId') reviewId: string) {
    return this.service.listByReview(reviewId, user.id);
  }

  @Get('ai-reviews/:reviewId/practice-questions/count')
  @ApiOperation({ summary: 'Count practice questions for an AI review' })
  count(@CurrentUser() user: AuthUser, @Param('reviewId') reviewId: string) {
    return this.service.countByReview(reviewId, user.id);
  }

  @Patch('practice-questions/:id/submit')
  @ApiOperation({ summary: 'Submit an answer for a practice question' })
  submit(
    @CurrentUser() user: AuthUser,
    @Param('id') id: string,
    @Body() dto: SubmitPracticeAnswerDto,
  ) {
    return this.service.submitAnswer(id, user.id, dto.answer);
  }
}
