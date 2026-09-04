import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateHabitDto } from './dto/create-habit.dto';
import { UpdateHabitDto } from './dto/update-habit.dto';

@Injectable()
export class HabitsService {
  constructor(private prisma: PrismaService) {}

  create(createHabitDto: CreateHabitDto) {
    return this.prisma.habit.create({
      data: {
        ...createHabitDto, //copia todas las propiedades recibidas
        startDate: new Date(createHabitDto.startDate),
        endDate: createHabitDto.endDate
          ? new Date(createHabitDto.endDate)
          : undefined,
      },
    });
  }

  findAll() {
    return this.prisma.habit.findMany();
  }

  findOne(id: string) {
    return this.prisma.habit.findUnique({ where: { id } });
  }

  update(id: string, updateHabitDto: UpdateHabitDto) {
    return this.prisma.habit.update({
      where: { id },
      data: {
        ...updateHabitDto, //desempaqueta todas las propiedades enviadas por el dto y las pone en el objeto data
        ...(updateHabitDto.startDate && {
          //... es para desestructurar un objeto
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
