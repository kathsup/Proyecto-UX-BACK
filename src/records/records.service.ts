import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { UpsertRecordDto } from './dto/upsert-record.dto';
import { RangeQueryDto } from './dto/range-query.dto';
import { ProgressQueryDto } from './dto/progress-query.dto';
import { MatrixQueryDto } from './dto/matrix-query.dto';
import {
  DAY_MS,
  computeProgress,
  getPeriodRange,
  toDayString,
  toUtcDate,
} from './utils/period.util';

@Injectable()
export class RecordsService {
  constructor(private prisma: PrismaService) {}

  // Busca el hábito solo si es del usuario; si no, 404
  private async getOwnHabit(habitId: string, userId: string) {
    const habit = await this.prisma.habit.findFirst({
      where: { id: habitId, userId },
    });
    if (!habit) throw new NotFoundException('Hábito no encontrado');
    return habit;
  }

  async upsert(dto: UpsertRecordDto, userId: string) {
    const habit = await this.getOwnHabit(dto.habitId, userId);
    const date = toUtcDate(dto.date);
    const completed = dto.value >= habit.targetValue;

    return this.prisma.record.upsert({
      where: { habitId_date: { habitId: dto.habitId, date } },
      update: { value: dto.value, completed },
      create: {
        habitId: dto.habitId,
        date,
        value: dto.value,
        completed,
        userId,
      },
    });
  }

  findAllByUser(userId: string) {
    return this.prisma.record.findMany({ where: { userId } });
  }

  // Historial de un hábito, con rango opcional
  async findByHabit(habitId: string, userId: string, query: RangeQueryDto) {
    await this.getOwnHabit(habitId, userId);

    const date: { gte?: Date; lte?: Date } = {};
    if (query.from) date.gte = toUtcDate(query.from);
    if (query.to) date.lte = toUtcDate(query.to);

    return this.prisma.record.findMany({
      where: { habitId, userId, date },
      orderBy: { date: 'asc' },
    });
  }

  // Progreso de un hábito en el día, semana o mes de una fecha
  async getProgress(habitId: string, userId: string, query: ProgressQueryDto) {
    const habit = await this.getOwnHabit(habitId, userId);
    const { start, endExclusive } = getPeriodRange(query.period, query.date);

    const records = await this.prisma.record.findMany({
      where: { habitId, userId, date: { gte: start, lt: endExclusive } },
    });

    return {
      habitId,
      period: query.period,
      from: toDayString(start),
      to: toDayString(new Date(endExclusive.getTime() - 1)),
      targetValue: habit.targetValue,
      unit: habit.unit,
      ...computeProgress(habit, records, start, endExclusive),
    };
  }

  // Todos los hábitos del usuario con sus records por día (para el grid)
  async getMatrix(userId: string, query: MatrixQueryDto) {
    const start = toUtcDate(query.from);
    const end = toUtcDate(query.to);

    if (end < start) {
      throw new BadRequestException('to no puede ser anterior a from');
    }
    const totalDays =
      Math.round((end.getTime() - start.getTime()) / DAY_MS) + 1;
    if (totalDays > 62) {
      throw new BadRequestException('El rango máximo es de 62 días');
    }
    const endExclusive = new Date(end.getTime() + DAY_MS);

    // Columnas del grid: ["2026-09-14", "2026-09-15", ...]
    const days = Array.from({ length: totalDays }, (_, i) =>
      toDayString(new Date(start.getTime() + i * DAY_MS)),
    );

    // Hábitos vigentes en algún momento del rango, con sus records incluidos
    const habits = await this.prisma.habit.findMany({
      where: {
        userId,
        startDate: { lt: endExclusive },
        OR: [
          { endDate: null },
          { endDate: { isSet: false } },
          { endDate: { gte: start } },
        ],
      },
      orderBy: { createdAt: 'asc' },
      include: {
        records: { where: { userId, date: { gte: start, lt: endExclusive } } },
      },
    });

    return {
      from: query.from,
      to: query.to,
      days,
      habits: habits.map((habit) => {
        // Diccionario: "2026-09-15" -> { value, completed }
        const cells: Record<string, { value: number; completed: boolean }> = {};
        for (const r of habit.records) {
          cells[toDayString(r.date)] = {
            value: r.value,
            completed: r.completed,
          };
        }
        return {
          id: habit.id,
          name: habit.name,
          frequency: habit.frequency,
          targetValue: habit.targetValue,
          unit: habit.unit,
          active: habit.active,
          startDate: habit.startDate,
          endDate: habit.endDate,
          cells,
          ...computeProgress(habit, habit.records, start, endExclusive),
        };
      }),
    };
  }

  // Solo borra si el record es del usuario
  async remove(id: string, userId: string) {
    const result = await this.prisma.record.deleteMany({
      where: { id, userId },
    });
    if (result.count === 0) throw new NotFoundException('Record no encontrado');
    return { deleted: true };
  }
}
