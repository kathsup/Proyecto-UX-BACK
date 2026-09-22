import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import {
  DAY_MS,
  getPeriodRange,
  toDayString,
  toUtcDate,
} from 'src/records/utils/period.util';

@Injectable()
export class StatisticsService {
  constructor(private prisma: PrismaService) {}

  async getDashboard(userId: string, date: string) {
    const habits = await this.prisma.habit.findMany({
      where: { userId, active: true },
    });

    const week = getPeriodRange('weekly', date);
    const month = getPeriodRange('monthly', date);
    const rangeStart = new Date(
      Math.min(week.start.getTime(), month.start.getTime()),
    );
    const rangeEnd = new Date(
      Math.max(week.endExclusive.getTime(), month.endExclusive.getTime()),
    );

    const records = await this.prisma.record.findMany({
      where: { userId, date: { gte: rangeStart, lt: rangeEnd } },
    });

    const recordMap = new Map(
      records.map((r) => [`${r.habitId}|${toDayString(r.date)}`, r]),
    );

    const habitsOn = (day: string) =>
      habits.filter(
        (h) =>
          toDayString(h.startDate) <= day &&
          (!h.endDate || toDayString(h.endDate) >= day),
      );

    // % de cumplimiento
    const dayPercent = (day: string): number | null => {
      if (day > date) return null;
      const applicable = habitsOn(day);
      const totalTarget = applicable.reduce((sum, h) => sum + h.targetValue, 0);
      if (totalTarget === 0) return 0;
      const achieved = applicable.reduce((sum, h) => {
        const value = recordMap.get(`${h.id}|${day}`)?.value ?? 0;
        return sum + Math.min(value, h.targetValue);
      }, 0);
      return Math.round((achieved / totalTarget) * 100);
    };

    const listDays = (start: Date, count: number) =>
      Array.from({ length: count }, (_, i) =>
        toDayString(new Date(start.getTime() + i * DAY_MS)),
      );

    // Tarjetas de hoy
    const todayHabits = habitsOn(date);
    const completedToday = todayHabits.filter(
      (h) => recordMap.get(`${h.id}|${date}`)?.completed,
    ).length;

    // Racha
    const completedRecords = await this.prisma.record.findMany({
      where: { userId, completed: true },
      select: { date: true },
    });
    const completedDays = new Set(
      completedRecords.map((r) => toDayString(r.date)),
    );

    // Racha actual: si hoy aún no hay nada completado, se cuenta desde ayer
    let currentStreak = 0;
    let cursor = toUtcDate(date);
    if (!completedDays.has(date)) cursor = new Date(cursor.getTime() - DAY_MS);
    while (completedDays.has(toDayString(cursor))) {
      currentStreak++;
      cursor = new Date(cursor.getTime() - DAY_MS);
    }

    // Mejor racha
    let bestStreak = 0;
    let run = 0;
    let prev: number | null = null;
    for (const day of [...completedDays].sort()) {
      const time = toUtcDate(day).getTime();
      run = prev !== null && time - prev === DAY_MS ? run + 1 : 1;
      bestStreak = Math.max(bestStreak, run);
      prev = time;
    }

    return {
      activeHabits: todayHabits.length,
      completedToday,
      currentStreak,
      bestStreak,
      percentToday: dayPercent(date),
      weekly: listDays(week.start, 7).map((day) => ({
        day,
        percent: dayPercent(day),
      })),
      monthly: listDays(month.start, month.days).map((day) => ({
        day,
        percent: dayPercent(day),
      })),
    };
  }

  async getOverview(userId: string, date: string) {
    const allHabits = await this.prisma.habit.findMany({ where: { userId } });
    const habits = allHabits.filter((h) => h.active);
    const today = toUtcDate(date);

    const monthStarts = Array.from(
      { length: 6 },
      (_, i) =>
        new Date(
          Date.UTC(today.getUTCFullYear(), today.getUTCMonth() - (5 - i), 1),
        ),
    );

    const thisWeekStart = getPeriodRange('weekly', date).start;
    const weekStarts = Array.from(
      { length: 8 },
      (_, i) => new Date(thisWeekStart.getTime() - (7 - i) * 7 * DAY_MS),
    );

    const records = await this.prisma.record.findMany({
      where: {
        userId,
        date: { gte: monthStarts[0], lt: new Date(today.getTime() + DAY_MS) },
      },
    });
    const recordMap = new Map(
      records.map((r) => [`${r.habitId}|${toDayString(r.date)}`, r]),
    );

    const habitsOn = (day: string) =>
      habits.filter(
        (h) =>
          toDayString(h.startDate) <= day &&
          (!h.endDate || toDayString(h.endDate) >= day),
      );

    const averagePercent = (days: string[]): number | null => {
      const percents: number[] = [];
      for (const day of days) {
        const applicable = habitsOn(day);
        const totalTarget = applicable.reduce(
          (sum, h) => sum + h.targetValue,
          0,
        );
        if (totalTarget === 0) continue;
        const achieved = applicable.reduce((sum, h) => {
          const value = recordMap.get(`${h.id}|${day}`)?.value ?? 0;
          return sum + Math.min(value, h.targetValue);
        }, 0);
        percents.push((achieved / totalTarget) * 100);
      }
      if (percents.length === 0) return null;
      return Math.round(percents.reduce((a, b) => a + b, 0) / percents.length);
    };

    const listDays = (start: Date, count: number) =>
      Array.from({ length: count }, (_, i) =>
        toDayString(new Date(start.getTime() + i * DAY_MS)),
      );

    const daysUntilToday = (start: Date, maxDays: number) => {
      const elapsed =
        Math.round((today.getTime() - start.getTime()) / DAY_MS) + 1;
      return listDays(start, Math.max(0, Math.min(maxDays, elapsed)));
    };

    const monthlyProgress = monthStarts.map((start) => {
      const daysInMonth = new Date(
        Date.UTC(start.getUTCFullYear(), start.getUTCMonth() + 1, 0),
      ).getUTCDate();
      return {
        month: toDayString(start).slice(0, 7),
        percent: averagePercent(daysUntilToday(start, daysInMonth)),
      };
    });

    const trend = weekStarts.map((start) => ({
      weekStart: toDayString(start),
      percent: averagePercent(daysUntilToday(start, 7)),
    }));

    const current = trend[7].percent;
    const previous = trend[6].percent;
    const trendChange =
      current !== null && previous !== null ? current - previous : null;

    // racha

    const completedRecords = await this.prisma.record.findMany({
      where: { userId, completed: true },
      select: { date: true },
    });
    const completedDays = new Set(
      completedRecords.map((r) => toDayString(r.date)),
    );
    let consecutiveDays = 0;
    let cursor = today;
    if (!completedDays.has(date)) cursor = new Date(cursor.getTime() - DAY_MS);
    while (completedDays.has(toDayString(cursor))) {
      consecutiveDays++;
      cursor = new Date(cursor.getTime() - DAY_MS);
    }

    return {
      totalHabits: allHabits.length,
      activeHabits: habitsOn(date).length,
      finishedHabits: allHabits.filter(
        (h) => h.endDate && toDayString(h.endDate) < date,
      ).length,
      consecutiveDays,
      monthlyProgress,
      trend,
      trendChange,
    };
  }

  // Calendario
  async getHeatmap(userId: string, days: number) {
    const today = toDayString(new Date());
    const todayUtc = toUtcDate(today);
    const start = new Date(todayUtc.getTime() - (days - 1) * DAY_MS);

    const allHabits = await this.prisma.habit.findMany({ where: { userId } });

    const records = await this.prisma.record.findMany({
      where: { userId, date: { gte: start, lte: todayUtc } },
    });
    const recordMap = new Map(
      records.map((r) => [`${r.habitId}|${toDayString(r.date)}`, r]),
    );

    const habitsOn = (day: string) =>
      allHabits.filter(
        (h) =>
          toDayString(h.startDate) <= day &&
          (!h.endDate || toDayString(h.endDate) >= day),
      );

    const listDays = (start: Date, count: number) =>
      Array.from({ length: count }, (_, i) =>
        toDayString(new Date(start.getTime() + i * DAY_MS)),
      );

    return listDays(start, days).map((day) => {
      const applicable = habitsOn(day);
      const totalTarget = applicable.reduce((sum, h) => sum + h.targetValue, 0);
      const achieved = applicable.reduce((sum, h) => {
        const value = recordMap.get(`${h.id}|${day}`)?.value ?? 0;
        return sum + Math.min(value, h.targetValue);
      }, 0);
      const done =
        totalTarget > 0 && achieved >= totalTarget && applicable.length > 0;
      return { day, done };
    });
  }
}
