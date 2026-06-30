import { Body, Controller, Get, Patch, Post } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import {
  GoogleLoginDto,
  LoginDto,
  SetPasswordDto,
  UpdateUserSettingsDto,
} from './dto/auth.dto';
import { Public } from '@/common/decorators/public.decorator';
import { CurrentUser } from '@/common/decorators/current-user.decorator';
import type { AuthUser } from './auth.mapper';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @Post('login')
  @ApiOperation({ summary: 'Login with email and password' })
  login(@Body() dto: LoginDto) {
    return this.authService.login(dto.email, dto.password);
  }

  @Public()
  @Post('google')
  @ApiOperation({ summary: 'Login or register with Google' })
  googleLogin(@Body() dto: GoogleLoginDto) {
    return this.authService.loginWithGoogle(dto.idToken);
  }

  @Get('me')
  @ApiOperation({ summary: 'Get current user profile' })
  me(@CurrentUser() user: AuthUser) {
    return this.authService.getProfile(user.id);
  }

  @Patch('me')
  @ApiOperation({ summary: 'Update current user settings' })
  updateMe(@CurrentUser() user: AuthUser, @Body() dto: UpdateUserSettingsDto) {
    return this.authService.updateSettings(user.id, dto);
  }

  @Post('password')
  @ApiOperation({ summary: 'Set or change password' })
  setPassword(@CurrentUser() user: AuthUser, @Body() dto: SetPasswordDto) {
    return this.authService.setPassword(user.id, dto);
  }
}
