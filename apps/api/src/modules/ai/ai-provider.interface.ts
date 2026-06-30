export interface AiReviewInput {
  systemPrompt: string;
  question: string;
  textContent: string;
}

export interface AiPracticeQuestionsInput {
  practicePrompt: string;
  aiGeneratedReview?: string;
  // allowedTypes?: string[];
  mistakes?: object;
  feedback?: string[]
}

export interface AiGradePracticeAnswerInput {
  questionType: string;
  question: string;
  correctAnswer: string;
  userAnswer: string;
}

export interface AiProvider {
  generateReviewRaw(input: AiReviewInput): Promise<string>;
  generatePracticeQuestionsRaw(prompt: string): Promise<string>;
  gradePracticeAnswerRaw(prompt: string): Promise<string>;
}

export const AI_PROVIDER = Symbol('AI_PROVIDER');
