import { Injectable } from '@nestjs/common';
import {
  DIFFICULTY_QUESTION_TYPES,
  fuzzyMatchPercent,
  normalizeAnswer,
  type PracticeDifficulty,
} from '@writer-mentor-ai/shared/practice-question';
import type { AiProvider, AiReviewInput } from '../ai-provider.interface';
import { AiService } from '../ai.service';

@Injectable()
export class MockAiProvider implements AiProvider {
  async generateReviewRaw(input: AiReviewInput): Promise<string> {
    const wordCount = input.textContent.trim().split(/\s+/).filter(Boolean).length;
    const structured = {
      overallScore: 6.0,
      estimatedBand: 6.0,
      scores: {
        taskResponse: 6,
        grammar: 5.5,
        vocabulary: 6,
        cohesion: 6,
        structure: 6,
        formality: 6.5,
      },
      summary: {
        strengths: ['Clear purpose', 'Basic structure is present'],
        weaknesses: ['Grammar accuracy needs work', `Word count: ${wordCount} words`],
      },
      priorityImprovements: [
        'Review subject-verb agreement',
        'Use more formal vocabulary',
        'Add clearer transitions between ideas',
      ],
      mistakes: {
        grammar: ['Check article usage', 'Review subject-verb agreement'],
        vocabulary: ['Replace informal word choices with formal alternatives'],
      },
      feedback: [
        'Address all parts of the prompt',
        'Combine short sentences for better flow',
        'Expand vocabulary for the topic',
      ],
      learningPlan: [
        'Practice timed writing exercises',
        'Review common grammar patterns',
        'Build topic-specific vocabulary lists',
      ],
    };
    return JSON.stringify(structured);
  }

  async generatePracticeQuestionsRaw(prompt: string): Promise<string> {
    const difficultyMatch = prompt.match(/Difficulty level: (\w+)/);
    const difficulty = (difficultyMatch?.[1] ?? 'intermediate') as PracticeDifficulty;
    const types = DIFFICULTY_QUESTION_TYPES[difficulty];

    const templates: Record<string, object> = {
      mcq: {
        questionType: 'mcq',
        question: 'Which word best completes the sentence: "The report was _____ submitted."',
        correctAnswer: 'B',
        timer: 60,
        options: ['A) quick', 'B) promptly', 'C) slow', 'D) never'],
      },
      fill_blank: {
        questionType: 'fill_blank',
        question: 'Fill in the blank: She has been working here _____ 2020.',
        correctAnswer: 'since',
        timer: 60,
      },
      true_false: {
        questionType: 'true_false',
        question: 'True or false: "Fewer" and "less" are interchangeable in all contexts.',
        correctAnswer: 'false',
        timer: 45,
      },
      sentence_correction: {
        questionType: 'sentence_correction',
        question: 'Correct this sentence: "He go to school every day."',
        correctAnswer: 'He goes to school every day.',
        timer: 90,
      },
      error_detection: {
        questionType: 'error_detection',
        question: 'Find and fix the error: "The informations in the email were unclear."',
        correctAnswer: 'The information in the email was unclear.',
        timer: 90,
      },
      matching: {
        questionType: 'matching',
        question: 'Match the word to its meaning.',
        correctAnswer: JSON.stringify({ formal: 'polite and professional', concise: 'brief and clear' }),
        timer: 90,
        metadata: { pairs: [{ left: 'formal', right: 'polite and professional' }, { left: 'concise', right: 'brief and clear' }] },
      },
      sentence_transformation: {
        questionType: 'sentence_transformation',
        question: 'Rewrite using "although": "It was raining. We went for a walk."',
        correctAnswer: 'Although it was raining, we went for a walk.',
        timer: 120,
      },
      cloze_passage: {
        questionType: 'cloze_passage',
        question: 'Complete the passage: Technology has _____ (1) our lives, but it also brings _____ (2) challenges.',
        correctAnswer: JSON.stringify(['changed', 'new']),
        timer: 120,
        metadata: { blanks: ['changed', 'new'] },
      },
      short_answer: {
        questionType: 'short_answer',
        question: 'In one sentence, explain why proofreading is important in professional writing.',
        correctAnswer: 'Proofreading helps catch errors and ensures clarity and professionalism.',
        timer: 90,
      },
    };

    const questions = types.map((type, index) => ({
      ...templates[type],
      question: `${(templates[type] as { question: string }).question} (Q${index + 1})`,
    }));

    return JSON.stringify({ questions });
  }

  async gradePracticeAnswerRaw(prompt: string): Promise<string> {
    const refMatch = prompt.match(/Reference answer: ([\s\S]*?)\nStudent answer:/);
    const userMatch = prompt.match(/Student answer: ([\s\S]*?)\n\n/);
    const reference = refMatch?.[1]?.trim() ?? '';
    const user = userMatch?.[1]?.trim() ?? '';
    const matchPercent = fuzzyMatchPercent(reference, user);
    const overlap =
      normalizeAnswer(reference).length > 0 &&
      normalizeAnswer(user).includes(normalizeAnswer(reference).slice(0, Math.min(20, reference.length)));

    const score = overlap ? Math.max(matchPercent, 85) : matchPercent;
    return JSON.stringify({
      matchPercent: score,
      feedback:
        score >= 90
          ? 'Your answer captures the key meaning of the reference answer.'
          : 'Your answer differs from the expected response in meaning or form.',
    });
  }
}
