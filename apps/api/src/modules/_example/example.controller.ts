import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { ExampleService } from './example.service';
import { CreateExampleDto } from './dto/create-example.dto';
import { UpdateExampleDto } from './dto/create-example.dto';
import { paginationQuerySchema } from '@writer-mentor-ai/shared/common';

@ApiTags('examples')
@Controller('examples')
export class ExampleController {
  constructor(private readonly service: ExampleService) {}

  @Get()
  @ApiOperation({ summary: 'List examples' })
  findAll(@Query() query: Record<string, string>) {
    const parsed = paginationQuerySchema.parse(query);
    return this.service.findAll(parsed);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get example by id' })
  findOne(@Param('id') id: string) {
    return this.service.findOne(id);
  }

  @Post()
  @ApiOperation({ summary: 'Create example' })
  create(@Body() dto: CreateExampleDto) {
    return this.service.create(dto);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update example' })
  update(@Param('id') id: string, @Body() dto: UpdateExampleDto) {
    return this.service.update(id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete example' })
  remove(@Param('id') id: string) {
    return this.service.remove(id);
  }
}
