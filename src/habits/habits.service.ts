import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateHabitDto } from './dto/create-habit.dto';
import { UpdateHabitDto } from './dto/update-habit.dto';

@Injectable()
export class HabitsService {
  constructor(private prisma: PrismaService) {}

  create(createHabitDto: CreateHabitDto, userId: string) {
    return this.prisma.habit.create({
      data: {
        ...createHabitDto,
        userId,
        startDate: new Date(createHabitDto.startDate),
        endDate: createHabitDto.endDate
          ? new Date(createHabitDto.endDate)
          : undefined,
      },
    });
  }

  findAll(userId: string) {
    return this.prisma.habit.findMany({ where: { userId } });
  }

  findOne(id: string) {
    return this.prisma.habit.findUnique({ where: { id } });
  }

  update(id: string, updateHabitDto: UpdateHabitDto) {
    return this.prisma.habit.update({
      where: { id },
      data: {
        ...updateHabitDto,
        ...(updateHabitDto.startDate && {
          startDate: new Date(updateHabitDto.startDate),
        }),
        ...(updateHabitDto.endDate && {
          endDate: new Date(updateHabitDto.endDate),
        }),
      },
    });
  }

  remove(id: string) {
    return this.prisma.habit.delete({ where: { id } });
  }
}
