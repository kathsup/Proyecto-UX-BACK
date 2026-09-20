import { IsInt, IsNotEmpty, IsString, Matches, Min } from 'class-validator';

export class UpsertRecordDto {
  @IsString()
  @IsNotEmpty()
  habitId!: string;

  // Solo el día, formato YYYY-MM-DD sin la hora
  @Matches(/^\d{4}-\d{2}-\d{2}$/, {
    message: 'date debe tener el formato YYYY-MM-DD',
  })
  date!: string;

  @IsInt()
  @Min(0)
  value!: number;
}
