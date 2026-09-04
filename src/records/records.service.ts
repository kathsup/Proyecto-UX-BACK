import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateRecordDto } from './dto/create-record.dto';

@Injectable()
export class RecordsService {
  constructor(private prisma: PrismaService) {}

  create(createRecordDto: CreateRecordDto, userId: string) {
    return this.prisma.record.create({
      data: {
        habitId: createRecordDto.habitId,
        date: new Date(createRecordDto.date),
        completed: createRecordDto.completed ?? true,
        userId,
      },
    });
  }

  findAllByUser(userId: string) {
    return this.prisma.record.findMany({ where: { userId } });
  }

  findByHabit(habitId: string, userId: string) {
    return this.prisma.record.findMany({ where: { habitId, userId } });
  }

  remove(id: string) {
    return this.prisma.record.delete({ where: { id } });
  }
}
