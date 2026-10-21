import { useState, useEffect } from "react";
import { initialHabits } from "../data/habits";
import { HabitsContext } from "./useHabits";
import { toDateKey } from "../utils/dates";
import { sanitizeHabits } from "../utils/habits";

const STORAGE_KEY = "my-daily-habits:habits";

function loadHabits() {
  const today = toDateKey();
  try {
    const stored = JSON.parse(localStorage.getItem(STORAGE_KEY));
    if (Array.isArray(stored)) return sanitizeHabits(stored, today);
  } catch {
    // JSON inválido: cai nos hábitos iniciais abaixo
  }
  return sanitizeHabits(initialHabits, today);
}

export function HabitsProvider({ children }) {
  const [habits, setHabits] = useState(loadHabits);
  const [today, setToday] = useState(toDateKey);

  const habitsToday = habits.map((habit) => ({ ...habit, completed: habit.completedDates.includes(today) }));
  const completedCount = habitsToday.filter((habit) => habit.completed).length;

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(habits));
  }, [habits]);

  useEffect(() => {
    const originalTitle = document.title;
    document.title = `${completedCount}/${habits.length} hábitos concluídos`;

    return () => {
      document.title = originalTitle;
    };
  }, [completedCount, habits.length]);

  // Vira o dia sozinho: confere a data a cada minuto e quando a aba volta a ficar visível.
  useEffect(() => {
    const refresh = () => setToday(toDateKey());
    const timer = setInterval(refresh, 60_000);
    document.addEventListener("visibilitychange", refresh);

    return () => {
      clearInterval(timer);
      document.removeEventListener("visibilitychange", refresh);
    };
  }, []);

  function updateWhere(habitId, change) {
    setHabits((currentHabits) => currentHabits.map((habit) => (habit.id === habitId ? change(habit) : habit)));
  }

  function toggleHabit(habitId, date = today) {
    updateWhere(habitId, (habit) => ({
      ...habit,
      completedDates: habit.completedDates.includes(date)
        ? habit.completedDates.filter((day) => day !== date)
        : [...habit.completedDates, date].sort(),
    }));
  }

  function addHabit(title, goal, emoji) {
    const newHabit = {
      id: crypto.randomUUID(),
      title: title.trim(),
      goal: goal.trim(),
      emoji,
      completedDates: [],
    };

    setHabits((currentHabits) => [...currentHabits, newHabit]);
  }

  function updateHabit(habitId, title, goal, emoji) {
    updateWhere(habitId, (habit) => ({ ...habit, title: title.trim(), goal: goal.trim(), emoji }));
  }

  function removeHabit(habitId) {
    setHabits((currentHabits) => currentHabits.filter((habit) => habit.id !== habitId));
  }

  function replaceHabits(newHabits) {
    setHabits(sanitizeHabits(newHabits, today));
  }

  const value = {
    habits: habitsToday,
    completedCount,
    today,
    toggleHabit,
    addHabit,
    updateHabit,
    removeHabit,
    replaceHabits,
  };

  return <HabitsContext value={value}>{children}</HabitsContext>;
}
