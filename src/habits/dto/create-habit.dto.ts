import {
  IsBoolean,
  IsDateString,
  IsIn,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  Min,
  ValidateIf,
} from 'class-validator';

export class CreateHabitDto {
  @IsString()
  @IsNotEmpty()
  name!: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsString()
  @IsOptional()
  category?: string;

  @IsIn(['daily', 'weekly', 'custom'])
  frequency!: string;

  @IsInt()
  @Min(1)
  @IsOptional()
  targetValue?: number;

  @IsString()
  @IsOptional()
  unit?: string;

  @ValidateIf((o) => o.frequency === 'custom')
  @IsInt()
  @Min(2)
  periodDays?: number;

  @IsString()
  @IsOptional()
  priority?: string;

  @IsDateString()
  startDate!: string;

  @IsDateString()
  @IsOptional()
  endDate?: string;

  @IsBoolean()
  @IsOptional()
  active?: boolean;
}
