import { useContext } from "react";
import { HabitsContext } from "../context/HabitsContext";
import { Link } from "react-router-dom";

export default function HabitCard({ id, title, goal = "Sem meta definida", completed }) {
  const context = useContext(HabitsContext);

  if (!context) {
    throw new Error("O componente HabitCard precisa estar dentro de um HabitsProvider.");
  }

  const { toggleHabit } = context;

  return (
    <article className={`habit-card ${completed ? "is-complete" : ""}`}>
      <div>
        <h2>{title}</h2>
        <p>Meta: {goal}</p>
      </div>
      <span className="habit-status">
        {completed ? "Concluído" : "Pendente"}
      </span>
      <button
        type="button"
        onClick={() => toggleHabit(id)}
      >
        {completed ? "Desmarcar" : "Concluir"}
      </button>
      <Link to={`/habitos/${id}`}>Ver detalhes</Link>
    </article>
  );
}
