import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type ExampleDocument = HydratedDocument<ExampleModel>;

@Schema({ timestamps: true, collection: 'examples' })
export class ExampleModel {
  @Prop({ required: true, maxlength: 200 })
  title!: string;

  @Prop({ maxlength: 2000 })
  description?: string;

  createdAt!: Date;
  updatedAt!: Date;
}

export const ExampleSchema = SchemaFactory.createForClass(ExampleModel);
