import { useContext } from "react";
import { HabitsContext } from "../context/HabitsContext";

export default function ProgressPage() {
  const context = useContext(HabitsContext);

  if (!context) {
    throw new Error("O componente ProgressPage precisa estar dentro de um HabitsProvider.");
  }

  const { habits, completedCount } = context;
  const total = habits.length;

  if (total === 0) {
    return (
      <div>
        <h2>Progresso</h2>
        <p>Nenhum hábito cadastrado para medir progresso.</p>
      </div>
    );
  }

  const percentage = Math.round((completedCount / total) * 100);

  return (
    <div>
      <h2>Progresso</h2>
      <p style={{ fontSize: "2rem", fontWeight: "bold" }}>{percentage}%</p>
      <p>
        {completedCount} de {total} hábitos concluídos.
      </p>
    </div>
  );
}
