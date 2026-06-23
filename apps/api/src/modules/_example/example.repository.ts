import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import type { CreateExampleInput, UpdateExampleInput, ExampleResponse } from '@writer-mentor-ai/shared/_example';
import { ExampleModel, ExampleDocument } from './schemas/example.schema';

@Injectable()
export class ExampleRepository {
  constructor(
    @InjectModel(ExampleModel.name) private readonly exampleModel: Model<ExampleDocument>,
  ) {}

  findAll(skip: number, take: number) {
    return this.exampleModel.find().skip(skip).limit(take).sort({ createdAt: -1 }).exec();
  }

  count() {
    return this.exampleModel.countDocuments().exec();
  }

  findById(id: string) {
    return this.exampleModel.findById(id).exec();
  }

  create(data: CreateExampleInput) {
    return this.exampleModel.create(data);
  }

  update(id: string, data: UpdateExampleInput) {
    return this.exampleModel.findByIdAndUpdate(id, data, { new: true }).exec();
  }

  delete(id: string) {
    return this.exampleModel.findByIdAndDelete(id).exec();
  }
}

export function toExampleResponse(entity: ExampleDocument): ExampleResponse {
  return {
    id: entity._id.toString(),
    title: entity.title,
    description: entity.description ?? null,
    createdAt: entity.createdAt.toISOString(),
    updatedAt: entity.updatedAt.toISOString(),
  };
}
