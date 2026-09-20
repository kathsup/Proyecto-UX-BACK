import { IsISO8601, IsOptional, Matches } from 'class-validator';

export class RangeQueryDto {
  @IsOptional()
  @Matches(/^\d{4}-\d{2}-\d{2}$/, { message: 'from debe ser YYYY-MM-DD' })
  @IsISO8601({ strict: true })
  from?: string;

  @IsOptional()
  @Matches(/^\d{4}-\d{2}-\d{2}$/, { message: 'to debe ser YYYY-MM-DD' })
  @IsISO8601({ strict: true })
  to?: string;
}
