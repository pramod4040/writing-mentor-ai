import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import type {
  CreateMentorTypeInput,
  UpdateMentorTypeInput,
  MentorTypeResponse,
} from '@writer-mentor-ai/shared/mentor-type';
import { MentorTypeModel, MentorTypeDocument } from './schemas/mentor-type.schema';

@Injectable()
export class MentorTypeRepository {
  constructor(
    @InjectModel(MentorTypeModel.name)
    private readonly mentorTypeModel: Model<MentorTypeDocument>,
  ) {}

  findAll() {
    return this.mentorTypeModel.find().sort({ name: 1 }).exec();
  }

  findById(id: string) {
    return this.mentorTypeModel.findById(id).exec();
  }

  findByName(name: string) {
    return this.mentorTypeModel.findOne({ name }).exec();
  }

  create(data: CreateMentorTypeInput) {
    return this.mentorTypeModel.create(data);
  }

  update(id: string, data: UpdateMentorTypeInput) {
    return this.mentorTypeModel.findByIdAndUpdate(id, data, { new: true }).exec();
  }

  delete(id: string) {
    return this.mentorTypeModel.findByIdAndDelete(id).exec();
  }
}

export function toMentorTypeResponse(entity: MentorTypeDocument): MentorTypeResponse {
  return {
    id: entity._id.toString(),
    name: entity.name,
    systemPrompt: entity.systemPrompt,
    practicePrompt: entity.practicePrompt ?? '',
    description: entity.description ?? null,
    createdAt: entity.createdAt.toISOString(),
    updatedAt: entity.updatedAt.toISOString(),
  };
}
