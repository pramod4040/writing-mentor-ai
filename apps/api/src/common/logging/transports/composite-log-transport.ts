import type { LogEntry } from '../log-entry.type';
import type { LogTransport } from '../log-transport.interface';

export class CompositeLogTransport implements LogTransport {
  constructor(private readonly transports: LogTransport[]) {}

  async write(entry: LogEntry): Promise<void> {
    await Promise.all(this.transports.map((t) => t.write(entry)));
  }
}
