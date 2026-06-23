import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { ExampleService } from '../example.service';
import { ExampleRepository } from '../example.repository';
import { ExampleModel } from '../schemas/example.schema';

describe('ExampleService', () => {
  let service: ExampleService;
  const repository = {
    findAll: jest.fn(),
    count: jest.fn(),
    findById: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ExampleService,
        { provide: ExampleRepository, useValue: repository },
        { provide: getModelToken(ExampleModel.name), useValue: {} },
      ],
    }).compile();
    service = module.get(ExampleService);
    jest.clearAllMocks();
  });

  it('maps entity to public response', async () => {
    const now = new Date();
    repository.findById.mockResolvedValue({
      _id: { toString: () => '507f1f77bcf86cd799439011' },
      title: 'Test',
      description: null,
      createdAt: now,
      updatedAt: now,
    });
    const result = await service.findOne('507f1f77bcf86cd799439011');
    expect(result).toEqual({
      id: '507f1f77bcf86cd799439011',
      title: 'Test',
      description: null,
      createdAt: now.toISOString(),
      updatedAt: now.toISOString(),
    });
    expect(result).not.toHaveProperty('passwordHash');
  });
});
