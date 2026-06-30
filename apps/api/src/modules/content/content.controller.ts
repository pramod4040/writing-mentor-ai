import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { paginationQuerySchema } from '@writer-mentor-ai/shared/common';
import { ContentService } from './content.service';
import { CreateContentDto, UpdateContentDto, CreateAiReviewDto, SaveAndReviewDto } from './dto/content.dto';
import { AiReviewService } from '../ai-review/ai-review.service';
import { CurrentUser } from '@/common/decorators/current-user.decorator';
import type { AuthUser } from '@/auth/auth.mapper';

@ApiTags('contents')
@Controller('contents')
export class ContentController {
  constructor(
    private readonly service: ContentService,
    private readonly aiReviewService: AiReviewService,
  ) {}

  @Get()
  @ApiOperation({ summary: 'List contents' })
  findAll(@CurrentUser() user: AuthUser, @Query() query: Record<string, string>) {
    const parsed = paginationQuerySchema.parse(query);
    return this.service.findAll(user.id, parsed);
  }

  @Post('save-and-review')
  @ApiOperation({ summary: 'Save content and generate AI review' })
  saveAndReview(@CurrentUser() user: AuthUser, @Body() dto: SaveAndReviewDto) {
    return this.aiReviewService.saveAndReview(user.id, dto);
  }

  @Get('ai-review-quota')
  @ApiOperation({ summary: 'Get current user daily AI review quota' })
  getAiReviewQuota(@CurrentUser() user: AuthUser) {
    return this.aiReviewService.getQuota(user.id);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get content by id' })
  findOne(@CurrentUser() user: AuthUser, @Param('id') id: string) {
    return this.service.findOne(id, user.id);
  }

  @Post()
  @ApiOperation({ summary: 'Create content' })
  create(@CurrentUser() user: AuthUser, @Body() dto: CreateContentDto) {
    return this.service.create(user.id, dto);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update content' })
  update(
    @CurrentUser() user: AuthUser,
    @Param('id') id: string,
    @Body() dto: UpdateContentDto,
  ) {
    return this.service.update(id, user.id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete content' })
  remove(@CurrentUser() user: AuthUser, @Param('id') id: string) {
    return this.service.remove(id, user.id);
  }

  @Post(':id/ai-review')
  @ApiOperation({ summary: 'Generate AI review for content' })
  createAiReview(
    @CurrentUser() user: AuthUser,
    @Param('id') id: string,
    @Body() dto: CreateAiReviewDto,
  ) {
    return this.aiReviewService.generateReview(id, dto.mentorTypeId, user.id, {
      question: dto.question,
      textContent: dto.textContent,
    });
  }

  @Get(':id/ai-reviews')
  @ApiOperation({ summary: 'List AI reviews for content' })
  findAiReviews(@CurrentUser() user: AuthUser, @Param('id') id: string) {
    return this.aiReviewService.findByContentId(id, user.id);
  }
}
