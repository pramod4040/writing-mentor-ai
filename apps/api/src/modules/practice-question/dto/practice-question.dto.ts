import { IsString, MaxLength, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class SubmitPracticeAnswerDto {
  @ApiProperty()
  @IsString()
  @MinLength(1)
  @MaxLength(5000)
  answer!: string;
}
