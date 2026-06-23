import { appendFile, mkdir } from 'fs/promises';
import { dirname } from 'path';
import type { LogEntry } from '../log-entry.type';
import type { LogTransport } from '../log-transport.interface';

export class FileLogTransport implements LogTransport {
  constructor(private readonly filePath: string) {}

  async write(entry: LogEntry): Promise<void> {
    const dir = dirname(this.filePath);
    await mkdir(dir, { recursive: true });
    await appendFile(this.filePath, `${JSON.stringify(entry)}\n`, 'utf8');
  }
}
