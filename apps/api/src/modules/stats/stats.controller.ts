import { Controller, Get } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { StatsService } from './stats.service';
import { CurrentUser } from '@/common/decorators/current-user.decorator';
import type { AuthUser } from '@/auth/auth.mapper';

@ApiTags('stats')
@Controller('stats')
export class StatsController {
  constructor(private readonly service: StatsService) {}

  @Get()
  @ApiOperation({ summary: 'Get content and AI review counts' })
  getStats(@CurrentUser() user: AuthUser) {
    return this.service.getStats(user.id);
  }
}
