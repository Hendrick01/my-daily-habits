import { Link } from "react-router-dom";
import HabitCard from "./HabitCard";
import { useHabits } from "../context/useHabits";

const emptyMessages = {
  all: "Nenhum hábito cadastrado ainda.",
  today: "Nada programado para hoje. Aproveite o descanso! 🌴",
  pending: "Nada pendente por hoje. Bom trabalho! 🎉",
  done: "Nenhum hábito concluído hoje ainda.",
};

export default function HabitList({ filter = "all" }) {
  const { habits } = useHabits();
  const visible = habits.filter((habit) => {
    if (filter === "today") return habit.dueToday;
    if (filter === "all") return true;
    return habit.completed === (filter === "done");
  });

  if (visible.length === 0) {
    const message = habits.length === 0 ? emptyMessages.all : emptyMessages[filter];
    return (
      <div className="empty">
        <p>{message}</p>
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
