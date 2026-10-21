import { addDays, fromDateKey, startOfWeek, toDateKey } from "./dates.js";

// Frequência de um hábito:
//   { type: "daily" }                        todo dia
//   { type: "weekdays", days: [1, 3, 5] }    dias da semana (0 = domingo)
//   { type: "weekly", times: 3 }             N vezes por semana, em qualquer dia

export const DAILY = { type: "daily" };
export const DAY_LABELS = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];
const ALL_DAYS = [0, 1, 2, 3, 4, 5, 6];

// Qualquer frequência estranha (dados antigos, backup editado à mão) vira "todo dia".
export function sanitizeSchedule(schedule) {
  if (schedule?.type === "weekdays" && Array.isArray(schedule.days)) {
    const days = [...new Set(schedule.days.filter((day) => Number.isInteger(day) && day >= 0 && day <= 6))].sort((a, b) => a - b);
    if (days.length > 0 && days.length < 7) return { type: "weekdays", days };
  }
  if (schedule?.type === "weekly" && Number.isInteger(schedule.times) && schedule.times >= 1 && schedule.times <= 6) {
    return { type: "weekly", times: schedule.times };
  }
  return DAILY;
}

export function describeSchedule(schedule) {
  if (schedule.type === "weekdays") return schedule.days.map((day) => DAY_LABELS[day]).join(", ");
  if (schedule.type === "weekly") return `${schedule.times}x por semana`;
  return "Todo dia";
}

export function streakUnit(schedule, value) {
  if (schedule.type === "weekly") return value === 1 ? "semana" : "semanas";
  return value === 1 ? "dia" : "dias";
}

function isScheduledOn(schedule, date) {
  return (schedule.type === "weekdays" ? schedule.days : ALL_DAYS).includes(date.getDay());
}

function countInWeek(done, weekStart) {
  return [0, 1, 2, 3, 4, 5, 6].filter((offset) => done.has(toDateKey(addDays(weekStart, offset)))).length;
}

export function getWeekCount(habit, today) {
  return countInWeek(new Set(habit.completedDates), startOfWeek(today));
}

// Aparece em "hoje"? Feito hoje sempre aparece; meta semanal some quando a semana já bateu a meta.
export function isDueToday(habit, today) {
  if (habit.completedDates.includes(toDateKey(today))) return true;
  if (habit.schedule.type === "weekly") return getWeekCount(habit, today) < habit.schedule.times;
  return isScheduledOn(habit.schedule, today);
}

// Sequência atual. O dia (ou a semana) em andamento ainda não conta como falha.
export function getStreak(habit, today) {
  const done = new Set(habit.completedDates);
  if (done.size === 0) return 0;

  if (habit.schedule.type === "weekly") {
    let week = startOfWeek(today);
    if (countInWeek(done, week) < habit.schedule.times) week = addDays(week, -7);
    let streak = 0;
    while (countInWeek(done, week) >= habit.schedule.times) {
      streak += 1;
      week = addDays(week, -7);
    }
    return streak;
  }

  const oldest = [...done].sort()[0];
  let day = done.has(toDateKey(today)) ? new Date(today) : addDays(today, -1);
  let streak = 0;
  for (; toDateKey(day) >= oldest; day = addDays(day, -1)) {
    if (!isScheduledOn(habit.schedule, day)) continue;
    if (!done.has(toDateKey(day))) break;
    streak += 1;
  }
  return streak;
}

// Maior sequência de todo o histórico, na mesma unidade da sequência atual.
export function getBestStreak(habit, today) {
  const done = new Set(habit.completedDates);
  if (done.size === 0) return 0;

  const first = fromDateKey([...done].sort()[0]);
  let best = 0;
  let run = 0;

  if (habit.schedule.type === "weekly") {
    const currentWeek = startOfWeek(today);
    for (let week = startOfWeek(first); week <= currentWeek; week = addDays(week, 7)) {
      if (countInWeek(done, week) >= habit.schedule.times) best = Math.max(best, ++run);
      else if (week < currentWeek) run = 0;
    }
    return best;
  }

  const todayKey = toDateKey(today);
  for (let day = first; toDateKey(day) <= todayKey; day = addDays(day, 1)) {
    if (!isScheduledOn(habit.schedule, day)) continue;
    if (done.has(toDateKey(day))) best = Math.max(best, ++run);
    else if (toDateKey(day) < todayKey) run = 0;
  }
  return best;
}

export function isOffDay(schedule, date) {
  return !isScheduledOn(schedule, date);
}
