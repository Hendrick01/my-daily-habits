import { useContext } from "react";
import HabitCard from "./HabitCard";
import { HabitsContext } from "../context/HabitsContext";

export default function HabitList() {
  const context = useContext(HabitsContext);

  if (!context) {
    throw new Error("O componente HabitList precisa estar dentro de um HabitsProvider.");
  }

  const { habits } = context;

  if (habits.length === 0) {
    return <p>Nenhum hábito cadastrado ainda.</p>;
  }

  return (
    <section className="habit-list" aria-label="Hábitos de hoje">
      {habits.map((habit) => (
        <HabitCard key={habit.id} {...habit} />
      ))}
    </section>
  );
}
