import { Body, Controller, Get, Param, Patch, Query } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { paginationQuerySchema } from '@writer-mentor-ai/shared/common';
import { AuthService } from './auth.service';
import { AdminUpdateUserDto } from './dto/auth.dto';
import { Roles } from '@/common/decorators/roles.decorator';

@ApiTags('users')
@Controller('users')
export class UsersController {
  constructor(private readonly authService: AuthService) {}

  @Get()
  @Roles('admin')
  @ApiOperation({ summary: 'List users (admin only)' })
  findAll(@Query() query: Record<string, string>) {
    const parsed = paginationQuerySchema.parse(query);
    return this.authService.listUsers(parsed);
  }

  @Patch(':id')
  @Roles('admin')
  @ApiOperation({ summary: 'Update user settings (admin only)' })
  update(@Param('id') id: string, @Body() dto: AdminUpdateUserDto) {
    return this.authService.adminUpdateUser(id, dto);
  }
}
