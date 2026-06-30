import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type UserDocument = HydratedDocument<UserModel>;

@Schema({ timestamps: true, collection: 'users' })
export class UserModel {
  @Prop({ required: true, unique: true })
  email!: string;

  @Prop({ required: true })
  name!: string;

  @Prop()
  passwordHash?: string;

  @Prop({ unique: true, sparse: true })
  googleId?: string;

  @Prop()
  image?: string;

  @Prop({ default: 'user', enum: ['user', 'admin'] })
  role!: string;

  @Prop()
  defaultMentorTypeId?: string;

  @Prop({ default: 3, min: 0, max: 1000 })
  dailyAiReviewLimit!: number;
}

export const UserSchema = SchemaFactory.createForClass(UserModel);
