import { Link } from "react-router-dom";
import HabitCard from "./HabitCard";
import { useHabits } from "../context/useHabits";

const emptyMessages = {
  all: "Nenhum hábito cadastrado ainda.",
  pending: "Nada pendente por hoje. Bom trabalho! 🎉",
  done: "Nenhum hábito concluído hoje ainda.",
};

export default function HabitList({ filter = "all" }) {
  const { habits } = useHabits();
  const visible = filter === "all" ? habits : habits.filter((habit) => habit.completed === (filter === "done"));

  if (visible.length === 0) {
    return (
      <div className="empty">
        <p>{emptyMessages[filter]}</p>
        {habits.length === 0 && (
          <Link to="/novo" className="btn btn-primary">
            Criar meu primeiro hábito
          </Link>
        )}
      </div>
    );
  }

  return (
    <section className="habit-list" aria-label="Hábitos de hoje">
      {visible.map((habit) => (
        <HabitCard key={habit.id} {...habit} />
      ))}
    </section>
  );
}
