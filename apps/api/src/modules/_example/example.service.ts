import { Injectable, NotFoundException } from '@nestjs/common';
import { ExampleRepository, toExampleResponse } from './example.repository';
import type { CreateExampleInput, UpdateExampleInput, ExampleResponse } from '@writer-mentor-ai/shared/_example';
import type { PaginationQuery } from '@writer-mentor-ai/shared/common';

@Injectable()
export class ExampleService {
  constructor(private readonly repository: ExampleRepository) {}

  async findAll(query: PaginationQuery) {
    const skip = (query.page - 1) * query.limit;
    const [items, total] = await Promise.all([
      this.repository.findAll(skip, query.limit),
      this.repository.count(),
    ]);
    return {
      data: items.map(toExampleResponse),
      total,
      page: query.page,
      limit: query.limit,
      totalPages: Math.ceil(total / query.limit),
    };
  }

  async findOne(id: string): Promise<ExampleResponse> {
    const item = await this.repository.findById(id);
    if (!item) throw new NotFoundException(`Example ${id} not found`);
    return toExampleResponse(item);
  }

  async create(input: CreateExampleInput): Promise<ExampleResponse> {
    const item = await this.repository.create(input);
    return toExampleResponse(item);
  }

  async update(id: string, input: UpdateExampleInput): Promise<ExampleResponse> {
    await this.findOne(id);
    const item = await this.repository.update(id, input);
    if (!item) throw new NotFoundException(`Example ${id} not found`);
    return toExampleResponse(item);
  }

  async remove(id: string): Promise<void> {
    await this.findOne(id);
    await this.repository.delete(id);
  }
}
