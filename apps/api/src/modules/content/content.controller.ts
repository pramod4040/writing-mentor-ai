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

@ApiTags('contents')
@Controller('contents')
export class ContentController {
  constructor(
    private readonly service: ContentService,
    private readonly aiReviewService: AiReviewService,
  ) {}

  @Get()
  @ApiOperation({ summary: 'List contents' })
  findAll(@Query() query: Record<string, string>) {
    const parsed = paginationQuerySchema.parse(query);
    return this.service.findAll(parsed);
  }

  @Post('save-and-review')
  @ApiOperation({ summary: 'Save content and generate AI review' })
  saveAndReview(@Body() dto: SaveAndReviewDto) {
    return this.aiReviewService.saveAndReview(dto);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get content by id' })
  findOne(@Param('id') id: string) {
    return this.service.findOne(id);
  }

  @Post()
  @ApiOperation({ summary: 'Create content' })
  create(@Body() dto: CreateContentDto) {
    return this.service.create(dto);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update content' })
  update(@Param('id') id: string, @Body() dto: UpdateContentDto) {
    return this.service.update(id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete content' })
  remove(@Param('id') id: string) {
    return this.service.remove(id);
  }

  @Post(':id/ai-review')
  @ApiOperation({ summary: 'Generate AI review for content' })
  createAiReview(@Param('id') id: string, @Body() dto: CreateAiReviewDto) {
    return this.aiReviewService.generateReview(id, dto.mentorTypeId, {
      question: dto.question,
      textContent: dto.textContent,
    });
  }

  @Get(':id/ai-reviews')
  @ApiOperation({ summary: 'List AI reviews for content' })
  findAiReviews(@Param('id') id: string) {
    return this.aiReviewService.findByContentId(id);
  }
}
