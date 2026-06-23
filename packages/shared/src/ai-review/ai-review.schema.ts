import { z } from 'zod';

export const reviewScoresSchema = z.object({
  taskResponse: z.number(),
  grammar: z.number(),
  vocabulary: z.number(),
  cohesion: z.number(),
  structure: z.number(),
  formality: z.number(),
});

export const structuredAiReviewSchema = z.object({
  overallScore: z.number(),
  estimatedBand: z.number(),
  scores: reviewScoresSchema,
  summary: z.object({
    strengths: z.array(z.string()),
    weaknesses: z.array(z.string()),
  }),
  priorityImprovements: z.array(z.string()),
  mistakes: z.record(z.array(z.string())),
  feedback: z.array(z.string()),
  learningPlan: z.array(z.string()),
});

export const JSON_REVIEW_OUTPUT_INSTRUCTION = `
Respond with valid JSON only. No markdown, no code fences, no extra text.
Use exactly this structure (all fields required):

{
  "overallScore": number,
  "estimatedBand": number,
  "scores": {
    "taskResponse": number,
    "grammar": number,
    "vocabulary": number,
    "cohesion": number,
    "structure": number,
    "formality": number
  },
  "summary": {
    "strengths": ["string"],
    "weaknesses": ["string"]
  },
  "priorityImprovements": ["string"],
  "mistakes": { "categoryName": ["mistake description"] },
  "feedback": ["string"],
  "learningPlan": ["string"]
}

Score ranges: use 0-9 for band-style scores where appropriate. Be specific and reference the student's actual writing.
`;

export const aiReviewResponseSchema = z.object({
  id: z.string().min(1),
  contentId: z.string().min(1),
  textContent: z.string(),
  aiGeneratedReview: z.string(),
  mentorTypeId: z.string().min(1),
  mentorTypeName: z.string().nullable(),
  userId: z.string().nullable(),
  overallScore: z.number().nullable(),
  estimatedBand: z.number().nullable(),
  scores: reviewScoresSchema.nullable(),
  summary: z
    .object({
      strengths: z.array(z.string()),
      weaknesses: z.array(z.string()),
    })
    .nullable(),
  priorityImprovements: z.array(z.string()).nullable(),
  mistakes: z.record(z.array(z.string())).nullable(),
  feedback: z.array(z.string()).nullable(),
  learningPlan: z.array(z.string()).nullable(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});

export type ReviewScores = z.infer<typeof reviewScoresSchema>;
export type StructuredAiReview = z.infer<typeof structuredAiReviewSchema>;
export type AiReviewResponse = z.infer<typeof aiReviewResponseSchema>;
