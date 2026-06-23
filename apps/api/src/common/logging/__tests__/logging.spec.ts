import { mkdtemp, readFile } from 'fs/promises';
import { join } from 'path';
import { tmpdir } from 'os';
import { shouldLog } from '../log-level';
import { AppLoggerService } from '../app-logger.service';
import { FileLogTransport } from '../transports/file-log-transport';
import { CompositeLogTransport } from '../transports/composite-log-transport';
import { ConsoleLogTransport } from '../transports/console-log-transport';
import type { LogEntry } from '../log-entry.type';

describe('shouldLog', () => {
  it('filters below minimum level', () => {
    expect(shouldLog('debug', 'info')).toBe(false);
    expect(shouldLog('info', 'info')).toBe(true);
    expect(shouldLog('error', 'info')).toBe(true);
  });
});

describe('FileLogTransport', () => {
  it('writes JSON lines to file', async () => {
    const dir = await mkdtemp(join(tmpdir(), 'api-log-'));
    const filePath = join(dir, 'test.log');
    const transport = new FileLogTransport(filePath);
    const entry: LogEntry = {
      timestamp: '2026-01-01T00:00:00.000Z',
      level: 'error',
      message: 'test error',
    };
    await transport.write(entry);
    const content = await readFile(filePath, 'utf8');
    expect(JSON.parse(content.trim())).toEqual(entry);
  });
});

describe('CompositeLogTransport', () => {
  it('writes to all child transports', async () => {
    const writes: string[] = [];
    const mockTransport = {
      write: (entry: LogEntry) => {
        writes.push(entry.message);
      },
    };
    const composite = new CompositeLogTransport([
      mockTransport,
      new ConsoleLogTransport(),
    ]);
    await composite.write({
      timestamp: '2026-01-01T00:00:00.000Z',
      level: 'info',
      message: 'hello',
    });
    expect(writes).toEqual(['hello']);
  });
});

describe('AppLoggerService', () => {
  const config = {
    get: (key: string) => {
      if (key === 'LOG_LEVEL') return 'info';
      if (key === 'LOG_OUTPUT') return 'console';
      if (key === 'LOG_FILE_PATH') return 'logs/api.log';
      return undefined;
    },
  };

  it('suppresses debug when LOG_LEVEL is info', async () => {
    const dir = await mkdtemp(join(tmpdir(), 'api-log-'));
    const filePath = join(dir, 'app.log');
    const fileConfig = {
      get: (key: string) => {
        if (key === 'LOG_LEVEL') return 'info';
        if (key === 'LOG_OUTPUT') return 'file';
        if (key === 'LOG_FILE_PATH') return filePath;
        return undefined;
      },
    };
    const logger = new AppLoggerService(fileConfig as never);
    logger.debug('debug message', 'Test');
    logger.info('info message', 'Test');
    await new Promise((resolve) => setTimeout(resolve, 50));
    const content = await readFile(filePath, 'utf8');
    expect(content).not.toContain('debug message');
    expect(content).toContain('info message');
  });

  it('logs errors with trace', async () => {
    const dir = await mkdtemp(join(tmpdir(), 'api-log-'));
    const filePath = join(dir, 'error.log');
    const fileConfig = {
      get: (key: string) => {
        if (key === 'LOG_LEVEL') return 'error';
        if (key === 'LOG_OUTPUT') return 'file';
        if (key === 'LOG_FILE_PATH') return filePath;
        return undefined;
      },
    };
    const logger = new AppLoggerService(fileConfig as never);
    const err = new Error('boom');
    logger.logError('failed', 'Test', err);
    await new Promise((resolve) => setTimeout(resolve, 50));
    const content = await readFile(filePath, 'utf8');
    const parsed = JSON.parse(content.trim());
    expect(parsed.level).toBe('error');
    expect(parsed.message).toBe('failed');
    expect(parsed.trace).toContain('boom');
  });
});
