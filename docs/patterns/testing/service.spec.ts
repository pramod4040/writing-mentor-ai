// Pattern: Backend service unit test
import { Test } from '@nestjs/testing';
import { ExampleService } from './example.service';
import { ExampleRepository } from './example.repository';

describe('ExampleService', () => {
  const repository = {
    findById: jest.fn(),
    create: jest.fn(),
  };

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [
        ExampleService,
        { provide: ExampleRepository, useValue: repository },
      ],
    }).compile();
    // service = module.get(ExampleService);
  });

  it('strips internal fields from response', () => {
    // Assert response has no passwordHash
  });
});
