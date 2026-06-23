import { Injectable, LoggerService } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type { Env } from '../../config/env.schema';
import type { LogLevel } from './log-level';
import { shouldLog } from './log-level';
import type { LogEntry } from './log-entry.type';
import { createLogTransports } from './logging.config';
import type { LogTransport } from './log-transport.interface';

@Injectable()
export class AppLoggerService implements LoggerService {
  private readonly minLevel: LogLevel;
  private readonly transport: LogTransport;

  constructor(private readonly config: ConfigService<Env, true>) {
    this.minLevel = this.config.get('LOG_LEVEL', { infer: true });
    this.transport = createLogTransports({
      output: this.config.get('LOG_OUTPUT', { infer: true }),
      filePath: this.config.get('LOG_FILE_PATH', { infer: true }),
    });
  }

  log(message: string, context?: string): void {
    this.write('info', message, context);
  }

  debug(message: string, context?: string, meta?: Record<string, unknown>): void {
    this.write('debug', message, context, undefined, meta);
  }

  info(message: string, context?: string, meta?: Record<string, unknown>): void {
    this.write('info', message, context, undefined, meta);
  }

  warn(message: string, context?: string, meta?: Record<string, unknown>): void {
    this.write('warn', message, context, undefined, meta);
  }

  error(
    message: string,
    trace?: string,
    context?: string,
    meta?: Record<string, unknown>,
  ): void {
    this.write('error', message, context, trace, meta);
  }

  logError(
    message: string,
    context?: string,
    error?: unknown,
    meta?: Record<string, unknown>,
  ): void {
    const err = error instanceof Error ? error : undefined;
    const trace = err?.stack ?? undefined;
    const combinedMeta = {
      ...meta,
      ...(err ? { errorMessage: err.message } : {}),
    };
    this.write('error', message, context, trace, combinedMeta);
  }

  private write(
    level: LogLevel,
    message: string,
    context?: string,
    trace?: string,
    meta?: Record<string, unknown>,
  ): void {
    if (!shouldLog(level, this.minLevel)) return;

    const entry: LogEntry = {
      timestamp: new Date().toISOString(),
      level,
      message,
      ...(context ? { context } : {}),
      ...(trace ? { trace } : {}),
      ...(meta && Object.keys(meta).length > 0 ? { meta } : {}),
    };

    void this.transport.write(entry);
  }
}
