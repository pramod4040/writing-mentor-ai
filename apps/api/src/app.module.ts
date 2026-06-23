import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { LoggerModule } from 'nestjs-pino';
import { AppConfigModule } from './config/config.module';
import type { Env } from './config/env.schema';
import { LoggingModule } from './common/logging/logging.module';
import { buildPinoHttpOptions } from './common/logging/logging.config';
import { DatabaseModule } from './database/mongoose/database.module';
import { HealthModule } from './modules/health/health.module';
import { ExampleModule } from './modules/_example/example.module';
import { AuthModule } from './auth/auth.module';
import { MentorTypeModule } from './modules/mentor-type/mentor-type.module';
import { ContentModule } from './modules/content/content.module';
import { AiReviewModule } from './modules/ai-review/ai-review.module';
import { AiModule } from './modules/ai/ai.module';
import { StatsModule } from './modules/stats/stats.module';
import { PracticeQuestionModule } from './modules/practice-question/practice-question.module';

@Module({
  imports: [
    LoggerModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService<Env, true>) => {
        const pinoHttp = buildPinoHttpOptions({
          level: config.get('LOG_LEVEL', { infer: true }),
          output: config.get('LOG_OUTPUT', { infer: true }),
          filePath: config.get('LOG_FILE_PATH', { infer: true }),
          nodeEnv: config.get('NODE_ENV', { infer: true }),
        });
        return { pinoHttp };
      },
    }),
    AppConfigModule,
    LoggingModule,
    DatabaseModule,
    HealthModule,
    AuthModule,
    ExampleModule,
    AiModule,
    MentorTypeModule,
    ContentModule,
    AiReviewModule,
    StatsModule,
    PracticeQuestionModule,
  ],
})
export class AppModule {}
