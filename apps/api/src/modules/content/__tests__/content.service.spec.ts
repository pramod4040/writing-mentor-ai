import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { ContentService } from '../content.service';
import { ContentRepository } from '../content.repository';

describe('ContentService', () => {
  let service: ContentService;
  const repository = {
    findAll: jest.fn(),
    count: jest.fn(),
    findById: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    incrementAiReviewedTimes: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ContentService,
        { provide: ContentRepository, useValue: repository },
        {
          provide: ConfigService,
          useValue: { getOrThrow: jest.fn().mockReturnValue('demo-user') },
        },
      ],
    }).compile();
    service = module.get(ContentService);
    jest.clearAllMocks();
  });

  it('maps entity to public response', async () => {
    const now = new Date();
    repository.findById.mockResolvedValue({
      _id: { toString: () => '507f1f77bcf86cd799439011' },
      shortName: 'Essay 1',
      question: 'Describe your accommodation',
      feedback: null,
      textContent: 'Hello world',
      userId: 'demo-user',
      aiReviewedTimes: 0,
      wordCount: 2,
      createdAt: now,
      updatedAt: now,
    });
    const result = await service.findOne('507f1f77bcf86cd799439011');
    expect(result).toEqual({
      id: '507f1f77bcf86cd799439011',
      shortName: 'Essay 1',
      question: 'Describe your accommodation',
      feedback: null,
      textContent: 'Hello world',
      userId: 'demo-user',
      aiReviewedTimes: 0,
      wordCount: 2,
      createdAt: now.toISOString(),
      updatedAt: now.toISOString(),
    });
  });

  it('computes word count on create', async () => {
    const now = new Date();
    repository.create.mockResolvedValue({
      _id: { toString: () => '507f1f77bcf86cd799439011' },
      shortName: 'Essay 1',
      question: 'Task',
      feedback: null,
      textContent: 'one two three',
      userId: 'demo-user',
      aiReviewedTimes: 0,
      wordCount: 3,
      createdAt: now,
      updatedAt: now,
    });
    const result = await service.create({
      shortName: 'Essay 1',
      question: 'Task',
      textContent: 'one two three',
    });
    expect(repository.create).toHaveBeenCalledWith(
      expect.objectContaining({ wordCount: 3, userId: 'demo-user' }),
    );
    expect(result.wordCount).toBe(3);
  });
});
