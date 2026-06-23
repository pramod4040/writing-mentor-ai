import { z } from 'zod';

export const practiceQuestionTypeSchema = z.enum([
  'mcq',
  'fill_blank',
  'true_false',
  'sentence_correction',
  'error_detection',
  'matching',
  'sentence_transformation',
  'cloze_passage',
  'short_answer',
]);

export const practiceDifficultySchema = z.enum(['beginner', 'intermediate', 'advanced']);

export const PRACTICE_ANSWER_GRADE_THRESHOLD = 90;

export const generatedPracticeQuestionSchema = z.object({
  questionType: practiceQuestionTypeSchema,
  question: z.string().min(1).max(5000),
  correctAnswer: z.string().min(1).max(5000),
  timer: z.number().int().min(10).max(600).default(60),
  options: z.array(z.string().min(1)).optional(),
  metadata: z.record(z.unknown()).optional(),
});

export const generatedPracticeQuestionsOutputSchema = z.object({
  questions: z.array(generatedPracticeQuestionSchema).min(4),
});

export const JSON_PRACTICE_QUESTIONS_INSTRUCTION = `
Respond with valid JSON only. No markdown, no code fences, no extra text.
Generate at least 4 practice questions using ONLY the allowed question types for this difficulty level.
Use a balanced mix across the allowed types (not all the same type).

Use exactly this structure:
{
  "questions": [
    {
      "questionType": "mcq" | "fill_blank" | "true_false" | "sentence_correction" | "error_detection" | "matching" | "sentence_transformation" | "cloze_passage" | "short_answer",
      "question": "string",
      "correctAnswer": "string",
      "timer": number (seconds, default 60),
      "options": ["string"] (required for mcq),
      "metadata": object (optional; matching pairs as { "left1": "right1" }, cloze as { "blanks": ["answer1"] })
    }
  ]
}

For matching, correctAnswer must be a JSON string of key-value pairs.
For cloze_passage, include metadata.blanks with the ordered blank answers.
Questions must relate to weaknesses and learning goals from the AI review context.
`;

export const practiceAnswerGradeSchema = z.object({
  matchPercent: z.number().min(0).max(100),
  feedback: z.string().optional(),
});

export const JSON_PRACTICE_ANSWER_GRADE_INSTRUCTION = `
Respond with valid JSON only. No markdown, no code fences, no extra text.
Evaluate whether the student's answer is acceptable compared to the reference answer.
Consider meaning, required corrections, and grammar—not just exact wording.

Use exactly this structure:
{
  "matchPercent": number (0-100),
  "feedback": "one short sentence explaining the score"
}
`;

export const practiceQuestionResponseSchema = z.object({
  id: z.string().min(1),
  questionType: practiceQuestionTypeSchema,
  question: z.string(),
  options: z.array(z.string()).nullable(),
  metadata: z.record(z.unknown()).nullable(),
  difficultyLevel: practiceDifficultySchema,
  aiReviewId: z.string().min(1),
  contentId: z.string().min(1),
  userId: z.string().nullable(),
  isSolved: z.boolean(),
  numAttempt: z.number().int(),
  timer: z.number().int(),
  userAnswer: z.string().nullable(),
  lastMatchPercent: z.number().nullable(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});

export const submitPracticeAnswerSchema = z.object({
  answer: z.string().min(1).max(5000),
});

export const submitPracticeAnswerResponseSchema = z.object({
  correct: z.boolean(),
  correctAnswer: z.string(),
  matchPercent: z.number(),
  feedback: z.string().optional(),
});

export const generatePracticeQuestionsResponseSchema = z.object({
  difficulty: practiceDifficultySchema,
  questions: z.array(practiceQuestionResponseSchema),
});

export const practiceQuestionCountResponseSchema = z.object({
  count: z.number().int(),
});

export type PracticeQuestionType = z.infer<typeof practiceQuestionTypeSchema>;
export type PracticeDifficulty = z.infer<typeof practiceDifficultySchema>;
export type GeneratedPracticeQuestion = z.infer<typeof generatedPracticeQuestionSchema>;
export type PracticeAnswerGrade = z.infer<typeof practiceAnswerGradeSchema>;
export type PracticeQuestionResponse = z.infer<typeof practiceQuestionResponseSchema>;
export type SubmitPracticeAnswerInput = z.infer<typeof submitPracticeAnswerSchema>;
export type SubmitPracticeAnswerResponse = z.infer<typeof submitPracticeAnswerResponseSchema>;
export type GeneratePracticeQuestionsResponse = z.infer<typeof generatePracticeQuestionsResponseSchema>;
export type PracticeQuestionCountResponse = z.infer<typeof practiceQuestionCountResponseSchema>;
