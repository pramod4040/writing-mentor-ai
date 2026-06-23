import type { LogLevel } from './log-level';

export type LogEntry = {
  timestamp: string;
  level: LogLevel;
  message: string;
  context?: string;
  trace?: string;
  meta?: Record<string, unknown>;
};
