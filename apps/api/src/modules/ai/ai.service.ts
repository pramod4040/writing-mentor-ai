import {
  BadRequestException,
  Injectable,
  ServiceUnavailableException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ZodError } from 'zod';
import {
  JSON_REVIEW_OUTPUT_INSTRUCTION,
  structuredAiReviewSchema,
  type StructuredAiReview,
} from '@writer-mentor-ai/shared/ai-review';
import {
  generatedPracticeQuestionsOutputSchema,
  JSON_PRACTICE_ANSWER_GRADE_INSTRUCTION,
  JSON_PRACTICE_QUESTIONS_INSTRUCTION,
  practiceAnswerGradeSchema,
  type PracticeAnswerGrade,
  type PracticeQuestionType,
  type GeneratedPracticeQuestion,
} from '@writer-mentor-ai/shared/practice-question';
import type {
  AiGradePracticeAnswerInput,
  AiPracticeQuestionsInput,
  AiProvider,
  AiReviewInput,
} from './ai-provider.interface';
import { GeminiProvider } from './providers/gemini.provider';
import { MockAiProvider } from './providers/mock.provider';
import { OllamaProvider } from './providers/ollama.provider';
import { AppLoggerService } from '../../common/logging/app-logger.service';

function extractJson(text: string): string {
  const trimmed = text.trim();
  const fenceMatch = trimmed.match(/```(?:json)?\s*([\s\S]*?)```/);
  if (fenceMatch) return fenceMatch[1].trim();
  const start = trimmed.indexOf('{');
  const end = trimmed.lastIndexOf('}');
  if (start !== -1 && end !== -1 && end > start) {
    return trimmed.slice(start, end + 1);
  }
  return trimmed;
}

@Injectable()
export class AiService {
  private readonly provider: AiProvider;

  constructor(
    private readonly config: ConfigService,
    private readonly logger: AppLoggerService,
    geminiProvider: GeminiProvider,
    mockProvider: MockAiProvider,
    ollamaProvider: OllamaProvider,
  ) {
    const providerName = this.config.get<string>('AI_PROVIDER') ?? 'mock';
    if (providerName === 'gemini') {
      this.provider = geminiProvider;
    } else if (providerName === 'ollama') {
      this.provider = ollamaProvider;
    } else {
      this.provider = mockProvider;
    }
  }

  async generateReview(input: AiReviewInput): Promise<StructuredAiReview> {
    try {
      const raw = await this.provider.generateReviewRaw(input);
      const jsonText = extractJson(raw);
      const parsed = JSON.parse(jsonText);
      return structuredAiReviewSchema.parse(parsed);
    } catch (error) {
      this.handleAiError(error);
    }
  }

  async generatePracticeQuestions(
    input: AiPracticeQuestionsInput,
  ): Promise<GeneratedPracticeQuestion[]> {
    const prompt = AiService.buildPracticeQuestionsPrompt(input);
    try {
      const raw = await this.provider.generatePracticeQuestionsRaw(prompt);
      const jsonText = extractJson(raw);
      const parsed = JSON.parse(jsonText);
      const result = generatedPracticeQuestionsOutputSchema.parse(parsed);
      return result.questions;
    } catch (error) {
      this.handleAiError(error);
    }
  }

  async gradePracticeAnswer(input: AiGradePracticeAnswerInput): Promise<PracticeAnswerGrade> {
    const prompt = AiService.buildGradePracticeAnswerPrompt(input);
    try {
      const raw = await this.provider.gradePracticeAnswerRaw(prompt);
      const jsonText = extractJson(raw);
      const parsed = JSON.parse(jsonText);
      return practiceAnswerGradeSchema.parse(parsed);
    } catch (error) {
      this.handleAiError(error);
    }
  }

  private handleAiError(error: unknown): never {
    this.logger.logError('AI operation failed', 'AiService', error);

    if (error instanceof ZodError) {
      throw new BadRequestException(
        'AI returned data in an invalid format. Try again or switch AI provider.',
      );
    }
    if (error instanceof SyntaxError) {
      throw new BadRequestException(
        'AI returned invalid JSON. Try again or switch AI provider.',
      );
    }
    if (error instanceof Error) {
      const msg = error.message.toLowerCase();
      if (
        msg.includes('ollama') ||
        msg.includes('fetch failed') ||
        msg.includes('econnrefused') ||
        msg.includes('network')
      ) {
        const baseUrl = this.config.get<string>('OLLAMA_BASE_URL') ?? 'http://127.0.0.1:11434';
        throw new ServiceUnavailableException(
          `Could not reach the AI service. If using Ollama, ensure it is running at ${baseUrl}.`,
        );
      }
      throw new BadRequestException(error.message);
    }
    throw error;
  }

  static buildPrompt(input: AiReviewInput): string {
    return `${input.systemPrompt}\n\n${JSON_REVIEW_OUTPUT_INSTRUCTION}\n\nWriting Task/Prompt:\n${input.question}\n\nStudent's Writing:\n${input.textContent}`;
  }

  static buildPracticeQuestionsPrompt(input: AiPracticeQuestionsInput): string {
    return `
${input.practicePrompt}

Mistakes User had made:
${input.mistakes}

Feedback given to the user:
${input.feedback}

${JSON_PRACTICE_QUESTIONS_INSTRUCTION}`;
  }

  static buildGradePracticeAnswerPrompt(input: AiGradePracticeAnswerInput): string {
    return `You are grading a practice question answer.

Question type: ${input.questionType}
Question: ${input.question}
Reference answer: ${input.correctAnswer}
Student answer: ${input.userAnswer}

${JSON_PRACTICE_ANSWER_GRADE_INSTRUCTION}`;
  }
}
