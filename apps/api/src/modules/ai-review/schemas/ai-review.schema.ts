import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

export type AiReviewDocument = HydratedDocument<AiReviewModel>;

@Schema({ _id: false })
export class ReviewScoresModel {
  @Prop({ required: true })
  taskResponse!: number;

  @Prop({ required: true })
  grammar!: number;

  @Prop({ required: true })
  vocabulary!: number;

  @Prop({ required: true })
  cohesion!: number;

  @Prop({ required: true })
  structure!: number;

  @Prop({ required: true })
  formality!: number;
}

@Schema({ _id: false })
export class ReviewSummaryModel {
  @Prop({ type: [String], required: true })
  strengths!: string[];

  @Prop({ type: [String], required: true })
  weaknesses!: string[];
}

@Schema({ timestamps: true, collection: 'ai_reviews' })
export class AiReviewModel {
  @Prop({ type: Types.ObjectId, ref: 'ContentModel', required: true })
  contentId!: Types.ObjectId;

  @Prop({ required: true, maxlength: 50000 })
  textContent!: string;

  @Prop({ required: true, maxlength: 50000 })
  aiGeneratedReview!: string;

  @Prop({ type: Types.ObjectId, ref: 'MentorTypeModel', required: true })
  mentorTypeId!: Types.ObjectId;

  @Prop()
  mentorTypeName?: string;

  @Prop()
  userId?: string;

  @Prop()
  overallScore?: number;

  @Prop()
  estimatedBand?: number;

  @Prop({ type: ReviewScoresModel })
  scores?: ReviewScoresModel;

  @Prop({ type: ReviewSummaryModel })
  summary?: ReviewSummaryModel;

  @Prop({ type: [String] })
  priorityImprovements?: string[];

  @Prop({ type: Object })
  mistakes?: Record<string, string[]>;

  @Prop({ type: [String] })
  feedback?: string[];

  @Prop({ type: [String] })
  learningPlan?: string[];

  createdAt!: Date;
  updatedAt!: Date;
}

export const AiReviewSchema = SchemaFactory.createForClass(AiReviewModel);
