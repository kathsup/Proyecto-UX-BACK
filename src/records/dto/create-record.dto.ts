import {
  IsBoolean,
  IsDateString,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsNumber,
} from 'class-validator';

export class CreateRecordDto {
  @IsString()
  @IsNotEmpty()
  habitId!: string;

  @IsDateString()
  @IsNotEmpty()
  date!: string;

  @IsBoolean()
  @IsOptional()
  completed?: boolean;

  @IsNumber()
  @IsOptional()
  value?: number;
}
