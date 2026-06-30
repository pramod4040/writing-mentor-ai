import { Test, TestingModule } from '@nestjs/testing';
import { ForbiddenException } from '@nestjs/common';
import { ContentService } from '../content.service';
import { ContentRepository } from '../content.repository';

describe('ContentService', () => {
  let service: ContentService;
  const userId = 'user-1';
  const repository = {
    findAllByUserId: jest.fn(),
    countByUserId: jest.fn(),
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
      userId,
      aiReviewedTimes: 0,
      wordCount: 2,
      createdAt: now,
      updatedAt: now,
    });
    const result = await service.findOne('507f1f77bcf86cd799439011', userId);
    expect(result).toEqual({
      id: '507f1f77bcf86cd799439011',
      shortName: 'Essay 1',
      question: 'Describe your accommodation',
      feedback: null,
      textContent: 'Hello world',
      userId,
      aiReviewedTimes: 0,
      wordCount: 2,
      createdAt: now.toISOString(),
      updatedAt: now.toISOString(),
    });
  });

  it('rejects access to another user content', async () => {
    repository.findById.mockResolvedValue({
      _id: { toString: () => '507f1f77bcf86cd799439011' },
      userId: 'other-user',
    });
    await expect(service.findOne('507f1f77bcf86cd799439011', userId)).rejects.toBeInstanceOf(
      ForbiddenException,
    );
  });

  it('computes word count on create', async () => {
    const now = new Date();
    repository.create.mockResolvedValue({
      _id: { toString: () => '507f1f77bcf86cd799439011' },
      shortName: 'Essay 1',
      question: 'Task',
      feedback: null,
      textContent: 'one two three',
      userId,
      aiReviewedTimes: 0,
      wordCount: 3,
      createdAt: now,
      updatedAt: now,
    });
    const result = await service.create(userId, {
      shortName: 'Essay 1',
      question: 'Task',
      textContent: 'one two three',
    });
    expect(repository.create).toHaveBeenCalledWith(
      expect.objectContaining({ wordCount: 3, userId }),
    );
    expect(result.wordCount).toBe(3);
  });
});
