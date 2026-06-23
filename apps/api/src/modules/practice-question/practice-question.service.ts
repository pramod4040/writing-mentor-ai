import { Injectable, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  PRACTICE_ANSWER_GRADE_THRESHOLD,
  difficultyFromBand,
  fuzzyMatchJsonPairsPercent,
  fuzzyMatchPercent,
  isStructuredPracticeType,
  type PracticeQuestionType,
  type PracticeAnswerGrade,
  type PracticeQuestionResponse,
  type SubmitPracticeAnswerResponse,
} from '@writer-mentor-ai/shared/practice-question';
import { AiReviewRepository } from '../ai-review/ai-review.repository';
import { MentorTypeService } from '../mentor-type/mentor-type.service';
import { AiService } from '../ai/ai.service';
import {
  PracticeQuestionRepository,
  toPracticeQuestionResponse,
} from './practice-question.repository';
import { AppLoggerService } from '@/common/logging/app-logger.service';

@Injectable()
export class PracticeQuestionService {
  constructor(
    private readonly repository: PracticeQuestionRepository,
    private readonly aiReviewRepository: AiReviewRepository,
    private readonly mentorTypeService: MentorTypeService,
    private readonly aiService: AiService,
    private readonly config: ConfigService,
    private readonly logger: AppLoggerService
  ) {}

  async generateForReview(aiReviewId: string) {
    const review = await this.aiReviewRepository.findById(aiReviewId);
    if (!review) throw new NotFoundException(`AI review ${aiReviewId} not found`);

    const mentorType = await this.mentorTypeService.findOne(review.mentorTypeId.toString());
    const difficulty = difficultyFromBand(review.estimatedBand ?? null);

    const generated = await this.aiService.generatePracticeQuestions({
      practicePrompt: mentorType.practicePrompt,
      aiGeneratedReview: review.aiGeneratedReview,
      difficulty,
    });

    const userId = this.config.getOrThrow<string>('DEFAULT_USER_ID');
    const contentId = review.contentId.toString();

    await this.repository.deleteByAiReviewId(aiReviewId);
    this.logger.error('AI review generation failed', 'AiService', JSON.stringify(generated));
    const created = await this.repository.createMany(
      generated.map((q) => ({
        ...q,
        difficultyLevel: difficulty,
        aiReviewId,
        contentId,
        userId,
      })),
    );

    return {
      difficulty,
      questions: created.map(toPracticeQuestionResponse),
    };
  }

  async listByReview(aiReviewId: string): Promise<PracticeQuestionResponse[]> {
    const items = await this.repository.findByAiReviewId(aiReviewId);
    return items.map(toPracticeQuestionResponse);
  }

  async countByReview(aiReviewId: string): Promise<{ count: number }> {
    const count = await this.repository.countByAiReviewId(aiReviewId);
    return { count };
  }

  async submitAnswer(id: string, answer: string): Promise<SubmitPracticeAnswerResponse> {
    const question = await this.repository.findById(id);
    if (!question) throw new NotFoundException(`Practice question ${id} not found`);

    const grade = await this.gradeAnswer(
      question.questionType as PracticeQuestionType,
      {
      question: question.question,
      correctAnswer: question.correctAnswer,
      userAnswer: answer,
    });

    const correct = grade.matchPercent >= PRACTICE_ANSWER_GRADE_THRESHOLD;
    await this.repository.updateAfterSubmit(id, {
      userAnswer: answer,
      lastMatchPercent: grade.matchPercent,
      isSolved: correct || question.isSolved,
    });

    return {
      correct,
      correctAnswer: question.correctAnswer,
      matchPercent: grade.matchPercent,
      feedback: grade.feedback,
    };
  }

  private async gradeAnswer(
    questionType: PracticeQuestionType,
    input: { question: string; correctAnswer: string; userAnswer: string },
  ): Promise<PracticeAnswerGrade> {
    if (isStructuredPracticeType(questionType)) {
      const matchPercent =
        questionType === 'matching'
          ? fuzzyMatchJsonPairsPercent(input.correctAnswer, input.userAnswer)
          : fuzzyMatchPercent(input.correctAnswer, input.userAnswer);

      return {
        matchPercent,
        feedback:
          matchPercent >= PRACTICE_ANSWER_GRADE_THRESHOLD
            ? 'Your answer matches the expected response.'
            : 'Your answer does not closely match the expected response.',
      };
    }

    return this.aiService.gradePracticeAnswer({
      questionType,
      question: input.question,
      correctAnswer: input.correctAnswer,
      userAnswer: input.userAnswer,
    });
  }
}
