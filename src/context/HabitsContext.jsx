import { useState, useEffect } from "react";
import { initialHabits } from "../data/habits";
import { HabitsContext } from "./useHabits";
import { toDateKey } from "../utils/dates";

const STORAGE_KEY = "my-daily-habits:habits";

// A versão antiga guardava `completed: true/false`; agora cada hábito guarda os dias em que foi feito.
function normalize(habit, today) {
  if (Array.isArray(habit.completedDates)) return habit;
  const { completed, ...rest } = habit;
  return { ...rest, completedDates: completed ? [today] : [] };
}

function isHabit(value) {
  return value !== null && typeof value === "object" && typeof value.id === "string" && typeof value.title === "string";
}

function loadHabits() {
  const today = toDateKey();
  try {
    const stored = JSON.parse(localStorage.getItem(STORAGE_KEY));
    if (Array.isArray(stored)) return stored.filter(isHabit).map((habit) => normalize(habit, today));
  } catch {
    // JSON inválido: cai nos hábitos iniciais abaixo
  }
  return initialHabits.map((habit) => normalize(habit, today));
}

export function HabitsProvider({ children }) {
  const [habits, setHabits] = useState(loadHabits);

  // ponytail: "hoje" é recalculado a cada render; com o app aberto na virada do dia, atualiza no próximo clique.
  const today = toDateKey();
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

  function toggleHabit(habitId) {
    setHabits((currentHabits) =>
      currentHabits.map((habit) => {
        if (habit.id !== habitId) return habit;
        const doneToday = habit.completedDates.includes(today);
        return {
          ...habit,
          completedDates: doneToday
            ? habit.completedDates.filter((date) => date !== today)
            : [...habit.completedDates, today],
        };
      }),
    );
  }

  function addHabit(title, goal) {
    const newHabit = {
      id: crypto.randomUUID(),
      title: title.trim(),
      goal: goal.trim(),
      completedDates: [],
    };

    setHabits((currentHabits) => [...currentHabits, newHabit]);
  }

  function removeHabit(habitId) {
    setHabits((currentHabits) => currentHabits.filter((habit) => habit.id !== habitId));
  }

  return (
    <HabitsContext value={{ habits: habitsToday, completedCount, toggleHabit, addHabit, removeHabit }}>
      {children}
    </HabitsContext>
  );
}
