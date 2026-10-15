import "./App.css";
import HabitList from "./components/HabitList";
import { initialHabits } from "./data/habits";

export default function App() {
  const completedCount = initialHabits.filter(
    (habit) => habit.completed,
  ).length;

  return (
    <main className="app">
      <header className="hero">
        <p className="eyebrow">MY DAILY HABITS</p>
        <h1>Pequenos hábitos, progresso visível.</h1>
        <p>
          {completedCount} de {initialHabits.length} hábitos concluídos.
        </p>
      </header>

      <HabitList habits={initialHabits} />
    </main>
  );
}
