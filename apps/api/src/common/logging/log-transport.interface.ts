import type { LogEntry } from './log-entry.type';

export interface LogTransport {
  write(entry: LogEntry): void | Promise<void>;
}
