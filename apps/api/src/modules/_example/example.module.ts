import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ExampleController } from './example.controller';
import { ExampleService } from './example.service';
import { ExampleRepository } from './example.repository';
import { ExampleModel, ExampleSchema } from './schemas/example.schema';

@Module({
  imports: [MongooseModule.forFeature([{ name: ExampleModel.name, schema: ExampleSchema }])],
  controllers: [ExampleController],
  providers: [ExampleService, ExampleRepository],
})
export class ExampleModule {}
