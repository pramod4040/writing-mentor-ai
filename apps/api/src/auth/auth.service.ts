import {
  BadRequestException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectModel } from '@nestjs/mongoose';
import { ConfigService } from '@nestjs/config';
import { Model } from 'mongoose';
import { OAuth2Client } from 'google-auth-library';
import * as bcrypt from 'bcrypt';
import type {
  AdminUpdateUserInput,
  LoginResponse,
  SetPasswordInput,
  UpdateUserSettingsInput,
  UserListResponse,
  UserResponse,
} from '@writer-mentor-ai/shared/auth';
import type { PaginationQuery } from '@writer-mentor-ai/shared/common';
import { UserModel, UserDocument } from './schemas/user.schema';
import { toAuthUser, toUserResponse } from './auth.mapper';
import type { AuthUser } from './auth.mapper';

@Injectable()
export class AuthService {
  private readonly googleClient: OAuth2Client;

  constructor(
    @InjectModel(UserModel.name) private readonly userModel: Model<UserDocument>,
    private readonly jwt: JwtService,
    private readonly config: ConfigService,
  ) {
    this.googleClient = new OAuth2Client(config.get<string>('GOOGLE_CLIENT_ID'));
  }

  async login(email: string, password: string): Promise<LoginResponse> {
    const user = await this.userModel.findOne({ email }).exec();
    if (!user) throw new UnauthorizedException('Invalid credentials');
    if (!user.passwordHash) {
      throw new UnauthorizedException('Use Google sign-in for this account');
    }
    const valid = await bcrypt.compare(password, user.passwordHash);
    if (!valid) throw new UnauthorizedException('Invalid credentials');
    return this.buildLoginResponse(user);
  }

  async loginWithGoogle(idToken: string): Promise<LoginResponse> {
    const clientId = this.config.get<string>('GOOGLE_CLIENT_ID');
    if (!clientId) {
      throw new BadRequestException('Google sign-in is not configured');
    }

    const ticket = await this.googleClient.verifyIdToken({
      idToken,
      audience: clientId,
    });
    const payload = ticket.getPayload();
    if (!payload?.email || !payload.sub) {
      throw new UnauthorizedException('Invalid Google token');
    }

    let user = await this.userModel.findOne({ googleId: payload.sub }).exec();
    if (!user) {
      user = await this.userModel.findOne({ email: payload.email }).exec();
    }

    if (user) {
      if (!user.googleId) {
        user.googleId = payload.sub;
      }
      if (payload.name && !user.name) {
        user.name = payload.name;
      }
      if (payload.picture && !user.image) {
        user.image = payload.picture;
      }
      await user.save();
    } else {
      const adminEmails = this.getAdminEmails();
      const role = adminEmails.includes(payload.email.toLowerCase()) ? 'admin' : 'user';
      user = await this.userModel.create({
        email: payload.email,
        name: payload.name ?? payload.email.split('@')[0],
        googleId: payload.sub,
        image: payload.picture,
        role,
      });
    }

    return this.buildLoginResponse(user);
  }

  async getProfile(userId: string): Promise<UserResponse> {
    const user = await this.findUserById(userId);
    return toUserResponse(user);
  }

  async updateSettings(
    userId: string,
    input: UpdateUserSettingsInput,
  ): Promise<UserResponse> {
    const user = await this.findUserById(userId);
    if (input.name !== undefined) {
      user.name = input.name;
    }
    if (input.defaultMentorTypeId !== undefined) {
      user.defaultMentorTypeId = input.defaultMentorTypeId ?? undefined;
    }
    await user.save();
    return toUserResponse(user);
  }

  async setPassword(userId: string, input: SetPasswordInput): Promise<UserResponse> {
    if (input.password !== input.confirmPassword) {
      throw new BadRequestException('Passwords do not match');
    }

    const user = await this.findUserById(userId);

    if (user.passwordHash) {
      if (!input.currentPassword) {
        throw new BadRequestException('Current password is required');
      }
      const valid = await bcrypt.compare(input.currentPassword, user.passwordHash);
      if (!valid) throw new UnauthorizedException('Current password is incorrect');
    }

    user.passwordHash = await bcrypt.hash(input.password, 10);
    await user.save();
    return toUserResponse(user);
  }

  async listUsers(query: PaginationQuery): Promise<UserListResponse> {
    const skip = (query.page - 1) * query.limit;
    const [items, total] = await Promise.all([
      this.userModel.find().sort({ createdAt: -1 }).skip(skip).limit(query.limit).exec(),
      this.userModel.countDocuments().exec(),
    ]);
    return {
      data: items.map(toUserResponse),
      total,
      page: query.page,
      limit: query.limit,
      totalPages: Math.ceil(total / query.limit),
    };
  }

  async adminUpdateUser(
    userId: string,
    input: AdminUpdateUserInput,
  ): Promise<UserResponse> {
    const user = await this.findUserById(userId);
    user.dailyAiReviewLimit = input.dailyAiReviewLimit;
    await user.save();
    return toUserResponse(user);
  }

  private buildLoginResponse(user: UserDocument): LoginResponse {
    const authUser = toAuthUser(user);
    const accessToken = this.jwt.sign({
      sub: authUser.id,
      email: authUser.email,
      role: authUser.role,
    });
    return {
      accessToken,
      user: toUserResponse(user),
    };
  }

  private async findUserById(userId: string): Promise<UserDocument> {
    const user = await this.userModel.findById(userId).exec();
    if (!user) throw new NotFoundException('User not found');
    return user;
  }

  private getAdminEmails(): string[] {
    const raw = this.config.get<string>('ADMIN_EMAILS');
    if (!raw) return [];
    return raw
      .split(',')
      .map((email) => email.trim().toLowerCase())
      .filter(Boolean);
  }
}

export type { AuthUser };
