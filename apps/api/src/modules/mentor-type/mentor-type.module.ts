import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { MentorTypeController } from './mentor-type.controller';
import { MentorTypeService } from './mentor-type.service';
import { MentorTypeRepository } from './mentor-type.repository';
import { MentorTypeModel, MentorTypeSchema } from './schemas/mentor-type.schema';

@Module({
  imports: [MongooseModule.forFeature([{ name: MentorTypeModel.name, schema: MentorTypeSchema }])],
  controllers: [MentorTypeController],
  providers: [MentorTypeService, MentorTypeRepository],
  exports: [MentorTypeService, MentorTypeRepository],
})
export class MentorTypeModule {}
