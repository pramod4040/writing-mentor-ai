import { Controller, Get } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { StatsService } from './stats.service';

@ApiTags('stats')
@Controller('stats')
export class StatsController {
  constructor(private readonly service: StatsService) {}

  @Get()
  @ApiOperation({ summary: 'Get content and AI review counts' })
  getStats() {
    return this.service.getStats();
  }
}
