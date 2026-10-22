import { createContext, useContext } from "react";

export const TrainingContext = createContext(null);

export function useTraining() {
  const context = useContext(TrainingContext);

  if (!context) {
    throw new Error("useTraining precisa ser usado dentro de um <TrainingProvider>.");
  }

  return context;
}
