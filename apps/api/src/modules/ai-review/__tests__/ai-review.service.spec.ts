import { Test, TestingModule } from '@nestjs/testing';
import { HttpException, HttpStatus } from '@nestjs/common';
import { AiReviewService } from '../ai-review.service';
import { AiReviewRepository } from '../ai-review.repository';
import { AiReviewQuotaService } from '../ai-review-quota.service';
import { ContentService } from '../../content/content.service';
import { MentorTypeService } from '../../mentor-type/mentor-type.service';
import { AiService } from '../../ai/ai.service';

const userId = 'user-1';

const mockStructured = {
  overallScore: 6,
  estimatedBand: 6,
  scores: {
    taskResponse: 6,
    grammar: 5.5,
    vocabulary: 6,
    cohesion: 6,
    structure: 6,
    formality: 6.5,
  },
  summary: {
    strengths: ['Clear purpose'],
    weaknesses: ['Grammar errors'],
  },
  priorityImprovements: ['Fix grammar'],
  mistakes: { grammar: ['Article error'] },
  feedback: ['Use formal tone'],
  learningPlan: ['Practice writing'],
};

describe('AiReviewService', () => {
  let service: AiReviewService;
  const contentService = {
    findOne: jest.fn(),
    recordAiReview: jest.fn(),
    update: jest.fn(),
    create: jest.fn(),
  };
  const mentorTypeService = {
    findOne: jest.fn(),
  };
  const aiService = {
    generateReview: jest.fn(),
  };
  const repository = {
    findByContentId: jest.fn(),
    create: jest.fn(),
    countByUserId: jest.fn(),
  };
  const quotaService = {
    assertWithinDailyLimit: jest.fn(),
    getQuota: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AiReviewService,
        { provide: AiReviewRepository, useValue: repository },
        { provide: ContentService, useValue: contentService },
        { provide: MentorTypeService, useValue: mentorTypeService },
        { provide: AiService, useValue: aiService },
        { provide: AiReviewQuotaService, useValue: quotaService },
      ],
    }).compile();
    service = module.get(AiReviewService);
    jest.clearAllMocks();
    quotaService.assertWithinDailyLimit.mockResolvedValue(undefined);
  });

  it('generates review, stores record, and updates content', async () => {
    const now = new Date();
    contentService.findOne.mockResolvedValue({
      id: 'content-id',
      question: 'Write about accommodation',
      textContent: 'Hello world',
    });
    mentorTypeService.findOne.mockResolvedValue({
      id: 'mentor-id',
      name: 'IELTS',
      systemPrompt: 'Evaluate IELTS',
    });
    aiService.generateReview.mockResolvedValue(mockStructured);
    repository.create.mockResolvedValue({
      _id: { toString: () => 'review-id' },
      contentId: { toString: () => 'content-id' },
      textContent: 'Hello world',
      aiGeneratedReview: JSON.stringify(mockStructured),
      mentorTypeId: { toString: () => 'mentor-id' },
      mentorTypeName: 'IELTS',
      userId,
      overallScore: 6,
      estimatedBand: 6,
      scores: mockStructured.scores,
      summary: mockStructured.summary,
      priorityImprovements: mockStructured.priorityImprovements,
      mistakes: mockStructured.mistakes,
      feedback: mockStructured.feedback,
      learningPlan: mockStructured.learningPlan,
      createdAt: now,
      updatedAt: now,
    });

    const result = await service.generateReview('content-id', 'mentor-id', userId);

    expect(quotaService.assertWithinDailyLimit).toHaveBeenCalledWith(userId);
    expect(aiService.generateReview).toHaveBeenCalledWith({
      systemPrompt: 'Evaluate IELTS',
      question: 'Write about accommodation',
      textContent: 'Hello world',
    });
    expect(repository.create).toHaveBeenCalled();
    expect(contentService.recordAiReview).toHaveBeenCalledWith('content-id', userId, 'Band 6');
    expect(result.estimatedBand).toBe(6);
    expect(result.mentorTypeName).toBe('IELTS');
  });

  it('updates content before generating review when content fields provided', async () => {
    contentService.findOne.mockResolvedValue({
      id: 'content-id',
      question: 'Old question',
      textContent: 'Old text',
    });
    contentService.update.mockResolvedValue({
      id: 'content-id',
      question: 'New question',
      textContent: 'New text',
    });
    mentorTypeService.findOne.mockResolvedValue({
      id: 'mentor-id',
      name: 'IELTS',
      systemPrompt: 'Evaluate IELTS',
    });
    aiService.generateReview.mockResolvedValue(mockStructured);
    repository.create.mockResolvedValue({
      _id: { toString: () => 'review-id' },
      contentId: { toString: () => 'content-id' },
      textContent: 'New text',
      aiGeneratedReview: JSON.stringify(mockStructured),
      mentorTypeId: { toString: () => 'mentor-id' },
      mentorTypeName: 'IELTS',
      userId,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    await service.generateReview('content-id', 'mentor-id', userId, {
      question: 'New question',
      textContent: 'New text',
    });

    expect(contentService.update).toHaveBeenCalled();
    expect(aiService.generateReview).toHaveBeenCalledWith({
      systemPrompt: 'Evaluate IELTS',
      question: 'New question',
      textContent: 'New text',
    });
  });

  it('does not call AI when daily limit is reached', async () => {
    quotaService.assertWithinDailyLimit.mockRejectedValue(
      new HttpException(
        {
          statusCode: HttpStatus.TOO_MANY_REQUESTS,
          message: 'Daily AI review limit reached',
          used: 3,
          limit: 3,
          resetsAt: '2026-06-25T10:00:00.000Z',
        },
        HttpStatus.TOO_MANY_REQUESTS,
      ),
    );

    await expect(
      service.generateReview('content-id', 'mentor-id', userId),
    ).rejects.toBeInstanceOf(HttpException);

    expect(contentService.findOne).not.toHaveBeenCalled();
    expect(aiService.generateReview).not.toHaveBeenCalled();
    expect(repository.create).not.toHaveBeenCalled();
  });
});
