import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

export type PracticeQuestionDocument = HydratedDocument<PracticeQuestionModel>;

const QUESTION_TYPES = [
  'mcq',
  'fill_blank',
  'true_false',
  'sentence_correction',
  'error_detection',
  'matching',
  'sentence_transformation',
  'cloze_passage',
  'short_answer',
] as const;

const DIFFICULTY_LEVELS = ['beginner', 'intermediate', 'advanced'] as const;

@Schema({ timestamps: true, collection: 'practice_questions' })
export class PracticeQuestionModel {
  @Prop({ type: String, required: true, enum: QUESTION_TYPES })
  questionType!: string;

  @Prop({ required: true, maxlength: 5000 })
  question!: string;

  @Prop({ required: true, maxlength: 5000 })
  correctAnswer!: string;

  @Prop({ type: [String] })
  options?: string[];

  @Prop({ type: Object })
  metadata?: Record<string, unknown>;

  @Prop({ type: String, required: true, enum: DIFFICULTY_LEVELS })
  difficultyLevel!: string;

  @Prop({ type: Types.ObjectId, ref: 'AiReviewModel', required: true, index: true })
  aiReviewId!: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'ContentModel', required: true })
  contentId!: Types.ObjectId;

  @Prop()
  userId?: string;

  @Prop({ default: false })
  isSolved!: boolean;

  @Prop({ default: 0 })
  numAttempt!: number;

  @Prop({ required: true, default: 60 })
  timer!: number;

  @Prop()
  userAnswer?: string;

  @Prop()
  lastMatchPercent?: number;

  createdAt!: Date;
  updatedAt!: Date;
}

export const PracticeQuestionSchema = SchemaFactory.createForClass(PracticeQuestionModel);
