import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException, HttpException, HttpStatus } from '@nestjs/common';
import { getModelToken } from '@nestjs/mongoose';
import { ConfigService } from '@nestjs/config';
import { AiReviewQuotaService } from '../ai-review-quota.service';
import { AiReviewRepository } from '../ai-review.repository';
import { UserModel } from '@/auth/schemas/user.schema';

describe('AiReviewQuotaService', () => {
  let service: AiReviewQuotaService;

  const userModel = {
    findById: jest.fn(),
  };

  const repository = {
    countByUserIdSince: jest.fn(),
    findOldestSince: jest.fn(),
  };

  const config = {
    get: jest.fn().mockReturnValue(3),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AiReviewQuotaService,
        { provide: getModelToken(UserModel.name), useValue: userModel },
        { provide: AiReviewRepository, useValue: repository },
        { provide: ConfigService, useValue: config },
      ],
    }).compile();

    service = module.get(AiReviewQuotaService);
    jest.clearAllMocks();
  });

  it('returns quota when user is under limit', async () => {
    userModel.findById.mockReturnValue({
      exec: jest.fn().mockResolvedValue({ dailyAiReviewLimit: 3 }),
    });
    repository.countByUserIdSince.mockResolvedValue(1);

    const quota = await service.getQuota('user-1');

    expect(quota).toEqual({
      used: 1,
      limit: 3,
      remaining: 2,
      resetsAt: null,
    });
  });

  it('uses env default when user has no stored limit', async () => {
    userModel.findById.mockReturnValue({
      exec: jest.fn().mockResolvedValue({ dailyAiReviewLimit: undefined }),
    });
    repository.countByUserIdSince.mockResolvedValue(0);
    config.get.mockReturnValue(5);

    const quota = await service.getQuota('user-1');

    expect(quota.limit).toBe(5);
  });

  it('computes resetsAt when at limit', async () => {
    const oldestCreatedAt = new Date('2026-06-24T10:00:00.000Z');
    userModel.findById.mockReturnValue({
      exec: jest.fn().mockResolvedValue({ dailyAiReviewLimit: 3 }),
    });
    repository.countByUserIdSince.mockResolvedValue(3);
    repository.findOldestSince.mockResolvedValue({ createdAt: oldestCreatedAt });

    const quota = await service.getQuota('user-1');

    expect(quota.remaining).toBe(0);
    expect(quota.resetsAt).toBe('2026-06-25T10:00:00.000Z');
  });

  it('throws 429 when daily limit is reached', async () => {
    userModel.findById.mockReturnValue({
      exec: jest.fn().mockResolvedValue({ dailyAiReviewLimit: 3 }),
    });
    repository.countByUserIdSince.mockResolvedValue(3);
    repository.findOldestSince.mockResolvedValue({
      createdAt: new Date('2026-06-24T10:00:00.000Z'),
    });

    await expect(service.assertWithinDailyLimit('user-1')).rejects.toBeInstanceOf(
      HttpException,
    );
  });

  it('throws NotFoundException when user does not exist', async () => {
    userModel.findById.mockReturnValue({
      exec: jest.fn().mockResolvedValue(null),
    });

    await expect(service.getQuota('missing-user')).rejects.toBeInstanceOf(NotFoundException);
  });
});
