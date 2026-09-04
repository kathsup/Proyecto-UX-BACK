import { PartialType } from '@nestjs/mapped-types'; //los vuelve a todos opcionales
import { CreateHabitDto } from './create-habit.dto';

export class UpdateHabitDto extends PartialType(CreateHabitDto) {}
