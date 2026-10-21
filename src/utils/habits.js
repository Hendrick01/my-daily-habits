import { sanitizeSchedule } from "./schedule.js";

const DATE_KEY = /^\d{4}-\d{2}-\d{2}$/;

function isHabit(value) {
  return value !== null && typeof value === "object" && typeof value.id === "string" && typeof value.title === "string";
}

// Limpa dados vindos de fora (localStorage ou arquivo de backup).
// Aceita o formato antigo (`completed: true/false`) e descarta o que não for hábito.
export function sanitizeHabits(list, today) {
  if (!Array.isArray(list)) return [];

  const seenIds = new Set();
  return list
    .filter((habit) => isHabit(habit) && !seenIds.has(habit.id) && seenIds.add(habit.id))
    .map((habit) => {
      const dates = Array.isArray(habit.completedDates) ? habit.completedDates : habit.completed ? [today] : [];
      return {
        id: habit.id,
        title: habit.title,
        goal: typeof habit.goal === "string" && habit.goal.trim() ? habit.goal : undefined,
        emoji: typeof habit.emoji === "string" && habit.emoji.length <= 16 ? habit.emoji : undefined,
        schedule: sanitizeSchedule(habit.schedule),
        completedDates: [...new Set(dates.filter((date) => typeof date === "string" && DATE_KEY.test(date)))].sort(),
      };
    });
}
