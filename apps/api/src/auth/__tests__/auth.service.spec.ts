import { Test, TestingModule } from '@nestjs/testing';
import { UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { getModelToken } from '@nestjs/mongoose';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import { AuthService } from '../auth.service';
import { UserModel } from '../schemas/user.schema';

describe('AuthService', () => {
  let service: AuthService;
  const jwt = { sign: jest.fn().mockReturnValue('token-123') };
  const config = {
    get: jest.fn(),
  };

  const createUserDoc = (overrides: Record<string, unknown> = {}) => {
    const doc = {
      _id: { toString: () => (overrides.id as string | undefined) ?? 'user-id' },
      email: 'user@example.com',
      name: 'Test User',
      role: 'user',
      passwordHash: undefined as string | undefined,
      image: null,
      defaultMentorTypeId: undefined,
      dailyAiReviewLimit: 3,
      googleId: undefined,
      save: jest.fn().mockResolvedValue(undefined),
      ...overrides,
    };
    return doc;
  };

  const userModel = {
    findOne: jest.fn(),
    findById: jest.fn(),
    find: jest.fn(),
    countDocuments: jest.fn(),
    create: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: getModelToken(UserModel.name), useValue: userModel },
        { provide: JwtService, useValue: jwt },
        { provide: ConfigService, useValue: config },
      ],
    }).compile();
    service = module.get(AuthService);
    jest.clearAllMocks();
  });

  it('rejects login when user has no password', async () => {
    userModel.findOne.mockReturnValue({
      exec: jest.fn().mockResolvedValue(createUserDoc()),
    });
    await expect(service.login('user@example.com', 'password123')).rejects.toBeInstanceOf(
      UnauthorizedException,
    );
  });

  it('logs in with valid password', async () => {
    const hash = await bcrypt.hash('password123', 10);
    userModel.findOne.mockReturnValue({
      exec: jest.fn().mockResolvedValue(createUserDoc({ passwordHash: hash })),
    });

    const result = await service.login('user@example.com', 'password123');
    expect(result.accessToken).toBe('token-123');
    expect(result.user.email).toBe('user@example.com');
    expect(result.user.hasPassword).toBe(true);
  });

  it('sets password only for the requested user id from JWT context', async () => {
    const user = createUserDoc({ passwordHash: undefined });
    userModel.findById.mockReturnValue({
      exec: jest.fn().mockResolvedValue(user),
    });

    const result = await service.setPassword('user-id', {
      password: 'newpassword123',
      confirmPassword: 'newpassword123',
    });

    expect(userModel.findById).toHaveBeenCalledWith('user-id');
    expect(user.save).toHaveBeenCalled();
    expect(result.hasPassword).toBe(true);
    expect(result.id).toBe('user-id');
  });

  it('does not update a different user when setPassword is called with another id', async () => {
    const otherUser = createUserDoc({
      _id: { toString: () => 'other-user-id' },
      email: 'other@example.com',
    });
    userModel.findById.mockReturnValue({
      exec: jest.fn().mockResolvedValue(otherUser),
    });

    await service.setPassword('other-user-id', {
      password: 'newpassword123',
      confirmPassword: 'newpassword123',
    });

    expect(userModel.findById).toHaveBeenCalledWith('other-user-id');
    expect(otherUser.save).toHaveBeenCalled();
    expect(userModel.findById).not.toHaveBeenCalledWith('user-id');
  });

  it('lists users with pagination', async () => {
    const now = new Date();
    const chain = {
      sort: jest.fn().mockReturnThis(),
      skip: jest.fn().mockReturnThis(),
      limit: jest.fn().mockReturnThis(),
      exec: jest.fn().mockResolvedValue([
        {
          _id: { toString: () => 'user-1' },
          email: 'a@example.com',
          name: 'User A',
          role: 'user',
          createdAt: now,
          updatedAt: now,
        },
      ]),
    };
    userModel.find.mockReturnValue(chain);
    userModel.countDocuments.mockReturnValue({
      exec: jest.fn().mockResolvedValue(1),
    });

    const result = await service.listUsers({ page: 1, limit: 20 });
    expect(result.data).toHaveLength(1);
    expect(result.total).toBe(1);
    expect(result.data[0].email).toBe('a@example.com');
  });

  it('updates daily AI review limit for a user', async () => {
    const user = createUserDoc({ dailyAiReviewLimit: 3 });
    userModel.findById.mockReturnValue({
      exec: jest.fn().mockResolvedValue(user),
    });

    const result = await service.adminUpdateUser('user-id', { dailyAiReviewLimit: 10 });

    expect(user.dailyAiReviewLimit).toBe(10);
    expect(user.save).toHaveBeenCalled();
    expect(result.dailyAiReviewLimit).toBe(10);
  });
});
