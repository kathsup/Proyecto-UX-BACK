export type Period = 'daily' | 'weekly' | 'monthly';

export const DAY_MS = 24 * 60 * 60 * 1000;

// "2026-09-19" -
export function toUtcDate(day: string): Date {
  return new Date(`${day}T00:00:00.000Z`);
}

// "2026-09-19"
export function toDayString(date: Date): string {
  return date.toISOString().slice(0, 10);
}

export function getPeriodRange(period: Period, day: string) {
  const base = toUtcDate(day);
  let start: Date;
  let endExclusive: Date;

  if (period === 'daily') {
    start = base;
    endExclusive = new Date(base.getTime() + DAY_MS);
  } else if (period === 'weekly') {
    const daysSinceMonday = (base.getUTCDay() + 6) % 7;
    start = new Date(base.getTime() - daysSinceMonday * DAY_MS);
    endExclusive = new Date(start.getTime() + 7 * DAY_MS);
  } else {
    start = new Date(Date.UTC(base.getUTCFullYear(), base.getUTCMonth(), 1));
    endExclusive = new Date(
      Date.UTC(base.getUTCFullYear(), base.getUTCMonth() + 1, 1),
    );
  }

  const days = Math.round((endExclusive.getTime() - start.getTime()) / DAY_MS);
  return { start, endExclusive, days };
}

export function computeProgress(
  habit: {
    frequency: string;
    targetValue: number;
    periodDays: number | null;
    startDate: Date;
    endDate: Date | null;
  },
  records: { date: Date; value: number; completed: boolean }[],
  start: Date,
  endExclusive: Date,
) {
  const habitStart = toUtcDate(toDayString(habit.startDate));
  const windowStart = new Date(Math.max(start.getTime(), habitStart.getTime()));
  let windowEnd = endExclusive;
  if (habit.endDate) {
    const habitEndExclusive = new Date(
      toUtcDate(toDayString(habit.endDate)).getTime() + DAY_MS,
    );
    windowEnd = new Date(
      Math.min(endExclusive.getTime(), habitEndExclusive.getTime()),
    );
  }
  const windowDays = Math.max(
    0,
    Math.round((windowEnd.getTime() - windowStart.getTime()) / DAY_MS),
  );

  const valid = records.filter(
    (r) => r.date >= windowStart && r.date < windowEnd,
  );

  const perWeek =
    habit.frequency === 'daily' ? 7 : Math.min(habit.periodDays ?? 1, 7);
  const expectedDays =
    windowDays === 0 ? 0 : Math.max(1, Math.round((perWeek * windowDays) / 7));

  const goal = habit.targetValue * expectedDays;
  const achieved = valid.reduce(
    (sum, r) => sum + Math.min(r.value, habit.targetValue),
    0,
  );

  return {
    expectedDays,
    completedDays: valid.filter((r) => r.completed).length,
    totalValue: valid.reduce((sum, r) => sum + r.value, 0),
    percent:
      goal === 0 ? 0 : Math.min(100, Math.round((achieved / goal) * 100)),
  };
}
