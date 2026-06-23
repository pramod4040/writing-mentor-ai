import { HttpException, HttpStatus, ArgumentsHost } from '@nestjs/common';
import { AllExceptionsFilter } from '../../filters/all-exceptions.filter';
import type { AppLoggerService } from '../app-logger.service';

describe('AllExceptionsFilter', () => {
  const logger = {
    logError: jest.fn(),
  } as unknown as AppLoggerService;

  const createHost = (request: Partial<{ method: string; url: string; query: object; body: object }>) => {
    const response = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    const req = {
      method: request.method ?? 'GET',
      url: request.url ?? '/api/test',
      query: request.query ?? {},
      body: request.body ?? {},
    };
    const host = {
      switchToHttp: () => ({
        getResponse: () => response,
        getRequest: () => req,
      }),
    } as ArgumentsHost;
    return { host, response };
  };

  it('logs and returns HttpException response', () => {
    const filter = new AllExceptionsFilter(logger);
    const { host, response } = createHost({ method: 'POST', url: '/api/foo', body: { name: 'test' } });
    const exception = new HttpException('Bad input', HttpStatus.BAD_REQUEST);

    filter.catch(exception, host);

    expect(logger.logError).toHaveBeenCalled();
    expect(response.status).toHaveBeenCalledWith(400);
    expect(response.json).toHaveBeenCalled();
  });

  it('logs and returns 500 for unknown errors', () => {
    const filter = new AllExceptionsFilter(logger);
    const { host, response } = createHost({});
    const exception = new Error('unexpected');

    filter.catch(exception, host);

    expect(logger.logError).toHaveBeenCalled();
    expect(response.status).toHaveBeenCalledWith(500);
    expect(response.json).toHaveBeenCalledWith(
      expect.objectContaining({ statusCode: 500, message: 'unexpected' }),
    );
  });
});
