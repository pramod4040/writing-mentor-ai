import { Injectable, NotFoundException, OnModuleInit } from '@nestjs/common';
import { MentorTypeRepository, toMentorTypeResponse } from './mentor-type.repository';
import type {
  CreateMentorTypeInput,
  UpdateMentorTypeInput,
  MentorTypeResponse,
} from '@writer-mentor-ai/shared/mentor-type';
import { DEFAULT_MENTOR_TYPES } from './mentor-type.seed';
import { AppLoggerService } from '@/common/logging/app-logger.service';

@Injectable()
export class MentorTypeService implements OnModuleInit {
  constructor(
    private readonly repository: MentorTypeRepository,
    private readonly logger: AppLoggerService,
  ) {}

  async onModuleInit() {
    for (const seed of DEFAULT_MENTOR_TYPES) {
      const existing = await this.repository.findByName(seed.name);
      if (!existing) {
        await this.repository.create(seed);
      }
    }
  }

  async findAll(): Promise<MentorTypeResponse[]> {
    const items = await this.repository.findAll();
    this.logger.info('Listed mentor types', 'MentorTypeService', { count: items.length });
    return items.map(toMentorTypeResponse);
  }

  async findOne(id: string): Promise<MentorTypeResponse> {
    const item = await this.repository.findById(id);
    if (!item) throw new NotFoundException(`MentorType ${id} not found`);
    return toMentorTypeResponse(item);
  }

  async create(input: CreateMentorTypeInput): Promise<MentorTypeResponse> {
    const item = await this.repository.create(input);
    return toMentorTypeResponse(item);
  }

  async update(id: string, input: UpdateMentorTypeInput): Promise<MentorTypeResponse> {
    await this.findOne(id);
    const item = await this.repository.update(id, input);
    if (!item) throw new NotFoundException(`MentorType ${id} not found`);
    return toMentorTypeResponse(item);
  }

  async remove(id: string): Promise<void> {
    await this.findOne(id);
    await this.repository.delete(id);
  }
}
