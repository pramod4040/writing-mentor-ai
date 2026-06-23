import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PracticeQuestionService } from '../practice-question.service';
import { PracticeQuestionRepository } from '../practice-question.repository';
import { AiReviewRepository } from '../../ai-review/ai-review.repository';
import { MentorTypeService } from '../../mentor-type/mentor-type.service';
import { AiService } from '../../ai/ai.service';

describe('PracticeQuestionService', () => {
  let service: PracticeQuestionService;
  const repository = {
    findByAiReviewId: jest.fn(),
    countByAiReviewId: jest.fn(),
    deleteByAiReviewId: jest.fn(),
    findById: jest.fn(),
    createMany: jest.fn(),
    updateAfterSubmit: jest.fn(),
  };
  const aiReviewRepository = { findById: jest.fn() };
  const mentorTypeService = { findOne: jest.fn() };
  const aiService = {
    generatePracticeQuestions: jest.fn(),
    gradePracticeAnswer: jest.fn(),
  };
  const config = { getOrThrow: jest.fn().mockReturnValue('demo-user') };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PracticeQuestionService,
        { provide: PracticeQuestionRepository, useValue: repository },
        { provide: AiReviewRepository, useValue: aiReviewRepository },
        { provide: MentorTypeService, useValue: mentorTypeService },
        { provide: AiService, useValue: aiService },
        { provide: ConfigService, useValue: config },
      ],
    }).compile();
    service = module.get(PracticeQuestionService);
    jest.clearAllMocks();
  });

  it('generates practice questions for a review', async () => {
    const now = new Date();
    aiReviewRepository.findById.mockResolvedValue({
      mentorTypeId: { toString: () => 'mentor-id' },
      contentId: { toString: () => 'content-id' },
      estimatedBand: 6,
      aiGeneratedReview: '{"summary":{}}',
    });
    mentorTypeService.findOne.mockResolvedValue({
      practicePrompt: 'Write about technology.',
    });
    aiService.generatePracticeQuestions.mockResolvedValue([
      {
        questionType: 'sentence_correction',
        question: 'Fix the sentence.',
        correctAnswer: 'He goes to school.',
        timer: 60,
      },
      {
        questionType: 'error_detection',
        question: 'Find the error.',
        correctAnswer: 'Correct version.',
        timer: 60,
      },
      {
        questionType: 'matching',
        question: 'Match pairs.',
        correctAnswer: JSON.stringify({ a: 'b' }),
        timer: 60,
      },
      {
        questionType: 'sentence_correction',
        question: 'Fix again.',
        correctAnswer: 'She runs fast.',
        timer: 60,
      },
    ]);
    repository.createMany.mockResolvedValue([
      {
        _id: { toString: () => 'q1' },
        questionType: 'sentence_correction',
        question: 'Fix the sentence.',
        options: undefined,
        metadata: undefined,
        difficultyLevel: 'intermediate',
        aiReviewId: { toString: () => 'review-id' },
        contentId: { toString: () => 'content-id' },
        userId: 'demo-user',
        isSolved: false,
        numAttempt: 0,
        timer: 60,
        userAnswer: undefined,
        lastMatchPercent: undefined,
        createdAt: now,
        updatedAt: now,
      },
    ]);

    const result = await service.generateForReview('review-id');
    expect(result.difficulty).toBe('intermediate');
    expect(repository.deleteByAiReviewId).toHaveBeenCalledWith('review-id');
    expect(aiService.generatePracticeQuestions).toHaveBeenCalled();
  });

  it('submits structured answer with fuzzy grading and always returns correct answer', async () => {
    repository.findById.mockResolvedValue({
      questionType: 'true_false',
      question: 'Is this true?',
      correctAnswer: 'true',
      isSolved: false,
    });
    repository.updateAfterSubmit.mockResolvedValue({});

    const result = await service.submitAnswer('q-id', 'true');
    expect(result.correct).toBe(true);
    expect(result.correctAnswer).toBe('true');
    expect(result.matchPercent).toBe(100);
  });

  it('uses AI grading for open-ended types', async () => {
    repository.findById.mockResolvedValue({
      questionType: 'short_answer',
      question: 'Explain proofreading.',
      correctAnswer: 'Proofreading catches errors.',
      isSolved: false,
    });
    aiService.gradePracticeAnswer.mockResolvedValue({
      matchPercent: 92,
      feedback: 'Good answer.',
    });
    repository.updateAfterSubmit.mockResolvedValue({});

    const result = await service.submitAnswer('q-id', 'Proofreading helps catch mistakes.');
    expect(result.correct).toBe(true);
    expect(result.correctAnswer).toBe('Proofreading catches errors.');
    expect(result.matchPercent).toBe(92);
    expect(aiService.gradePracticeAnswer).toHaveBeenCalled();
  });

  it('throws when review not found', async () => {
    aiReviewRepository.findById.mockResolvedValue(null);
    await expect(service.generateForReview('missing')).rejects.toBeInstanceOf(NotFoundException);
  });
});
