import { isAbsolute, join, dirname } from 'path';
import { mkdirSync } from 'fs';
import type { LogLevel } from './log-level';
import type { LogTransport } from './log-transport.interface';
import { CompositeLogTransport } from './transports/composite-log-transport';
import { ConsoleLogTransport } from './transports/console-log-transport';
import { FileLogTransport } from './transports/file-log-transport';
import pino, { type DestinationStream, type StreamEntry } from 'pino';

export type LogConfig = {
  output: 'console' | 'file' | 'both';
  filePath: string;
};

/** Resolve log file to apps/api/logs when running from monorepo root via turbo. */
export function resolveLogFilePath(filePath: string): string {
  if (isAbsolute(filePath)) return filePath;
  const cwd = process.cwd();
  const normalized = cwd.replace(/\\/g, '/');
  const apiDir =
    normalized.endsWith('/apps/api') || normalized.endsWith('/api')
      ? cwd
      : join(cwd, 'apps/api');
  return join(apiDir, filePath);
}

export function ensureLogFileDirectory(filePath: string): void {
  mkdirSync(dirname(filePath), { recursive: true });
}

export function createLogTransports(config: LogConfig): LogTransport {
  const resolvedPath = resolveLogFilePath(config.filePath);
  const transports: LogTransport[] = [];

  if (config.output === 'file' || config.output === 'both') {
    ensureLogFileDirectory(resolvedPath);
    transports.push(new FileLogTransport(resolvedPath));
  }
  if (config.output === 'console' || config.output === 'both') {
    transports.push(new ConsoleLogTransport());
  }

  if (transports.length === 0) {
    transports.push(new ConsoleLogTransport());
  }

  return new CompositeLogTransport(transports);
}

export type PinoLogConfig = {
  level: LogLevel;
  output: LogConfig['output'];
  filePath: string;
  nodeEnv: string;
};

export function buildPinoHttpOptions(config: PinoLogConfig): Record<string, unknown> {
  const logFilePath = resolveLogFilePath(config.filePath);
  const streams: StreamEntry[] = [];

  if (config.output === 'file' || config.output === 'both') {
    ensureLogFileDirectory(logFilePath);
    streams.push({
      stream: pino.destination({ dest: logFilePath, sync: false }),
    });
  }

  if (config.output === 'console' || config.output === 'both') {
    if (config.nodeEnv !== 'production') {
      streams.push({
        stream: pino.transport({ target: 'pino-pretty', options: { colorize: true } }),
      });
    } else {
      streams.push({ stream: process.stdout as DestinationStream });
    }
  }

  if (streams.length === 1) {
    return {
      level: config.level,
      stream: streams[0].stream,
    };
  }

  return {
    level: config.level,
    stream: pino.multistream(streams),
  };
}
