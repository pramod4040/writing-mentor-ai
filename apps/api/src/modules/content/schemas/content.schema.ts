import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type ContentDocument = HydratedDocument<ContentModel>;

@Schema({ timestamps: true, collection: 'contents' })
export class ContentModel {
  @Prop({ required: true, maxlength: 200 })
  shortName!: string;

  @Prop({ required: true, maxlength: 2000 })
  question!: string;

  @Prop({ maxlength: 50000 })
  feedback?: string;

  @Prop({ required: true, maxlength: 50000 })
  textContent!: string;

  @Prop({ required: true })
  userId!: string;

  @Prop({ default: 0 })
  aiReviewedTimes!: number;

  @Prop({ required: true, default: 0 })
  wordCount!: number;

  createdAt!: Date;
  updatedAt!: Date;
}

export const ContentSchema = SchemaFactory.createForClass(ContentModel);
