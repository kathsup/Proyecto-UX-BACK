import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateHabitDto } from './dto/create-habit.dto';
import { UpdateHabitDto } from './dto/update-habit.dto';
import { ListHabitsQueryDto } from './dto/list-habits-query.dto';

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

  findAll(userId: string, query: ListHabitsQueryDto) {
    return this.prisma.habit.findMany({
      where: {
        userId,
        active:
          query.active === undefined ? undefined : query.active === 'true',
        category: query.category || undefined,
        name: query.search
          ? { contains: query.search, mode: 'insensitive' }
          : undefined,
      },
      orderBy: { [query.sort ?? 'createdAt']: 'asc' },
    });
  }

  findOne(id: string, userId: string) {
    return this.prisma.habit.findFirst({ where: { id, userId } });
  }

  update(id: string, userId: string, updateHabitDto: UpdateHabitDto) {
    return this.prisma.habit.updateMany({
      where: { id, userId },
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

  remove(id: string, userId: string) {
    return this.prisma.habit.deleteMany({ where: { id, userId } });
  }
}
