import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
} from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { MentorTypeService } from './mentor-type.service';
import { CreateMentorTypeDto, UpdateMentorTypeDto } from './dto/mentor-type.dto';

@ApiTags('mentor-types')
@Controller('mentor-types')
export class MentorTypeController {
  constructor(private readonly service: MentorTypeService) {}

  @Get()
  @ApiOperation({ summary: 'List mentor types' })
  findAll() {
    return this.service.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get mentor type by id' })
  findOne(@Param('id') id: string) {
    return this.service.findOne(id);
  }

  @Post()
  @ApiOperation({ summary: 'Create mentor type' })
  create(@Body() dto: CreateMentorTypeDto) {
    return this.service.create(dto);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update mentor type' })
  update(@Param('id') id: string, @Body() dto: UpdateMentorTypeDto) {
    return this.service.update(id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete mentor type' })
  remove(@Param('id') id: string) {
    return this.service.remove(id);
  }
}
