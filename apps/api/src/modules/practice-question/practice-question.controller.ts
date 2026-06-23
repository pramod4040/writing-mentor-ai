import { Body, Controller, Get, Param, Patch, Post } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { PracticeQuestionService } from './practice-question.service';
import { SubmitPracticeAnswerDto } from './dto/practice-question.dto';

@ApiTags('practice-questions')
@Controller()
export class PracticeQuestionController {
  constructor(private readonly service: PracticeQuestionService) {}

  @Post('ai-reviews/:reviewId/practice-questions/generate')
  @ApiOperation({ summary: 'Generate practice questions for an AI review' })
  generate(@Param('reviewId') reviewId: string) {
    return this.service.generateForReview(reviewId);
  }

  @Get('ai-reviews/:reviewId/practice-questions')
  @ApiOperation({ summary: 'List practice questions for an AI review' })
  list(@Param('reviewId') reviewId: string) {
    return this.service.listByReview(reviewId);
  }

  @Get('ai-reviews/:reviewId/practice-questions/count')
  @ApiOperation({ summary: 'Count practice questions for an AI review' })
  count(@Param('reviewId') reviewId: string) {
    return this.service.countByReview(reviewId);
  }

  @Patch('practice-questions/:id/submit')
  @ApiOperation({ summary: 'Submit an answer for a practice question' })
  submit(@Param('id') id: string, @Body() dto: SubmitPracticeAnswerDto) {
    return this.service.submitAnswer(id, dto.answer);
  }
}
