import { Test, TestingModule } from '@nestjs/testing';
import { MentorTypeService } from '../mentor-type.service';
import { MentorTypeRepository } from '../mentor-type.repository';

describe('MentorTypeService', () => {
  let service: MentorTypeService;
  const repository = {
    findAll: jest.fn(),
    findById: jest.fn(),
    findByName: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MentorTypeService,
        { provide: MentorTypeRepository, useValue: repository },
      ],
    }).compile();
    service = module.get(MentorTypeService);
    jest.clearAllMocks();
  });

  it('maps entity to public response', async () => {
    const now = new Date();
    repository.findById.mockResolvedValue({
      _id: { toString: () => '507f1f77bcf86cd799439011' },
      name: 'IELTS',
      systemPrompt: 'Evaluate IELTS writing',
      practicePrompt: 'Write an essay about technology.',
      description: 'IELTS review',
      createdAt: now,
      updatedAt: now,
    });
    const result = await service.findOne('507f1f77bcf86cd799439011');
    expect(result).toEqual({
      id: '507f1f77bcf86cd799439011',
      name: 'IELTS',
      systemPrompt: 'Evaluate IELTS writing',
      practicePrompt: 'Write an essay about technology.',
      description: 'IELTS review',
      createdAt: now.toISOString(),
      updatedAt: now.toISOString(),
    });
  });

  it('seeds default mentor types only when missing', async () => {
    repository.findByName.mockResolvedValue(null);
    repository.create.mockResolvedValue({});
    await service.onModuleInit();
    expect(repository.findByName).toHaveBeenCalledTimes(3);
    expect(repository.create).toHaveBeenCalledTimes(3);
    expect(repository.create).toHaveBeenCalledWith(
      expect.objectContaining({ name: 'IELTS' }),
    );
  });

  it('does not overwrite existing mentor types on module init', async () => {
    repository.findByName.mockResolvedValue({ name: 'IELTS' });
    await service.onModuleInit();
    expect(repository.findByName).toHaveBeenCalledTimes(3);
    expect(repository.create).not.toHaveBeenCalled();
  });
});
