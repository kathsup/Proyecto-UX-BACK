import { IsIn, IsOptional, IsString } from 'class-validator';

export class ListHabitsQueryDto {
  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  @IsString()
  category?: string;

  @IsOptional()
  @IsIn(['true', 'false'])
  active?: string;

  @IsOptional()
  @IsIn(['name', 'priority', 'createdAt'])
  sort?: string;
}
