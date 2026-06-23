import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type MentorTypeDocument = HydratedDocument<MentorTypeModel>;

@Schema({ timestamps: true, collection: 'mentor_types' })
export class MentorTypeModel {
  @Prop({ required: true, unique: true, maxlength: 100 })
  name!: string;

  @Prop({ required: true, maxlength: 10000 })
  systemPrompt!: string;

  @Prop({ required: true, maxlength: 2000 })
  practicePrompt!: string;

  @Prop({ maxlength: 500 })
  description?: string;

  createdAt!: Date;
  updatedAt!: Date;
}

export const MentorTypeSchema = SchemaFactory.createForClass(MentorTypeModel);
