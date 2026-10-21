import { createContext, useContext } from "react";

export const HabitsContext = createContext(null);

export function useHabits() {
  const context = useContext(HabitsContext);

  if (!context) {
    throw new Error("useHabits precisa ser usado dentro de um <HabitsProvider>.");
  }

  return context;
}
