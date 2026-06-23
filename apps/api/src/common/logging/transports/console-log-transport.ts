import type { LogEntry } from '../log-entry.type';
import type { LogTransport } from '../log-transport.interface';

export class ConsoleLogTransport implements LogTransport {
  write(entry: LogEntry): void {
    const line = JSON.stringify(entry);
    if (entry.level === 'error') {
      process.stderr.write(`${line}\n`);
    } else {
      process.stdout.write(`${line}\n`);
    }
  }
}
