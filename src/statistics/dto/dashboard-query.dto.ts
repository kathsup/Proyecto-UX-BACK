import { IsISO8601, Matches } from 'class-validator';

export class DashboardQueryDto {
  @Matches(/^\d{4}-\d{2}-\d{2}$/, { message: 'date debe ser YYYY-MM-DD' })
  @IsISO8601({ strict: true })
  date!: string;
}
