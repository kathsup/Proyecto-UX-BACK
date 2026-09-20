import { IsISO8601, Matches } from 'class-validator';

export class MatrixQueryDto {
  @Matches(/^\d{4}-\d{2}-\d{2}$/, { message: 'from debe ser YYYY-MM-DD' })
  @IsISO8601({ strict: true })
  from!: string;

  @Matches(/^\d{4}-\d{2}-\d{2}$/, { message: 'to debe ser YYYY-MM-DD' })
  @IsISO8601({ strict: true })
  to!: string;
}
