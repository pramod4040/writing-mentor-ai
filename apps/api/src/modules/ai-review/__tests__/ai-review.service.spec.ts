import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { AiReviewService } from '../ai-review.service';
import { AiReviewRepository } from '../ai-review.repository';
import { ContentService } from '../../content/content.service';
import { MentorTypeService } from '../../mentor-type/mentor-type.service';
import { AiService } from '../../ai/ai.service';

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
    count: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AiReviewService,
        { provide: AiReviewRepository, useValue: repository },
        { provide: ContentService, useValue: contentService },
        { provide: MentorTypeService, useValue: mentorTypeService },
        { provide: AiService, useValue: aiService },
        {
          provide: ConfigService,
          useValue: { getOrThrow: jest.fn().mockReturnValue('demo-user') },
        },
      ],
    }).compile();
    service = module.get(AiReviewService);
    jest.clearAllMocks();
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
      userId: 'demo-user',
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

    const result = await service.generateReview('content-id', 'mentor-id');

    expect(aiService.generateReview).toHaveBeenCalledWith({
      systemPrompt: 'Evaluate IELTS',
      question: 'Write about accommodation',
      textContent: 'Hello world',
    });
    expect(repository.create).toHaveBeenCalled();
    expect(contentService.recordAiReview).toHaveBeenCalledWith('content-id', 'Band 6');
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
      userId: 'demo-user',
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    await service.generateReview('content-id', 'mentor-id', {
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
});
