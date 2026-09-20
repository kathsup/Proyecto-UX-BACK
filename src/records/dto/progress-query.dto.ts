import { IsIn, IsISO8601, Matches } from 'class-validator';
import type { Period } from '../utils/period.util';

export class ProgressQueryDto {
  @IsIn(['daily', 'weekly', 'monthly'])
  period!: Period;

  @Matches(/^\d{4}-\d{2}-\d{2}$/, { message: 'date debe ser YYYY-MM-DD' })
  @IsISO8601({ strict: true })
  date!: string;
}
