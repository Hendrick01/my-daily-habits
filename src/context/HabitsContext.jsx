import { createContext, useState, useEffect } from "react";
import { initialHabits } from "../data/habits";

const STORAGE_KEY = "my-daily-habits:habits";

function loadHabits() {
  try {
    const storedHabits = localStorage.getItem(STORAGE_KEY);
    
    if (storedHabits === null) {
      return initialHabits;
    }

    const parsedHabits = JSON.parse(storedHabits);
    if (Array.isArray(parsedHabits)) {
      return parsedHabits;
    }
    
    return initialHabits;
  } catch {
    return initialHabits;
  }
}

export const HabitsContext = createContext(null);

export function HabitsProvider({ children }) {
  const [habits, setHabits] = useState(() => loadHabits());

  const completedCount = habits.filter((habit) => habit.completed).length;

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
        if (habit.id === habitId) {
          return {
            ...habit,
            completed: !habit.completed,
          };
        }
        return habit;
      })
    );
  }

  function addHabit(title, goal) {
    const novoHabito = {
      id: crypto.randomUUID(),
      title: title.trim(),
      goal: goal.trim(),
      completed: false,
    };

    setHabits((currentHabits) => [...currentHabits, novoHabito]);
  }

  return (
    <HabitsContext.Provider value={{ habits, completedCount, toggleHabit, addHabit }}>
      {children}
    </HabitsContext.Provider>
  );
}
