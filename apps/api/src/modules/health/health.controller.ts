import { Controller, Get } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { HealthCheck, HealthCheckService, MongooseHealthIndicator } from '@nestjs/terminus';
import { AppLoggerService } from '@/common/logging/app-logger.service';
import { Public } from '@/common/decorators/public.decorator';

@ApiTags('health')
@Controller('health')
export class HealthController {
  constructor(
    private health: HealthCheckService,
    private mongoose: MongooseHealthIndicator,
    private readonly logger: AppLoggerService,
  ) {}

  @Public()
  @Get()
  @HealthCheck()
  check() {
    this.logger.info('Health check', 'HealthController', {
      endpoint: '/api/health',
      logFilePath: this.logger.resolvedLogFilePath,
    });
    return this.health.check([() => this.mongoose.pingCheck('mongodb')]);
  }
}
