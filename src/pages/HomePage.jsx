import { useContext } from "react";
import { HabitsContext } from "../context/HabitsContext";
import Panel from "../components/Panel";
import HabitList from "../components/HabitList";

export default function HomePage() {
  const context = useContext(HabitsContext);

  if (!context) {
    throw new Error("O componente HomePage precisa estar dentro de um HabitsProvider.");
  }

  const { habits, completedCount } = context;

  return (
    <>
      <header className="hero">
        <p className="eyebrow">MY DAILY HABITS</p>
        <h1>Pequenos hábitos, progresso visível.</h1>
        <p>
          {completedCount} de {habits.length} hábitos concluídos.
        </p>
      </header>

      <Panel title="Hábitos de hoje">
        <HabitList />
      </Panel>
    </>
  );
}
