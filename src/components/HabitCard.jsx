import { Link } from "react-router-dom";
import { useHabits } from "../context/useHabits";
import { getStreak } from "../utils/dates";

export default function HabitCard({ id, title, goal = "Sem meta definida", completed, completedDates }) {
  const { toggleHabit } = useHabits();
  const streak = getStreak(completedDates);

  return (
    <article className={`habit-card${completed ? " is-complete" : ""}`}>
      <button
        type="button"
        className="check"
        onClick={() => toggleHabit(id)}
        aria-pressed={completed}
        aria-label={`Concluir ${title}`}
      >
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path d="M5 12.5l4.5 4.5L19 7.5" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>

      <div className="habit-info">
        <h2>{title}</h2>
        <p>Meta: {goal}</p>
        <div className="habit-meta">
          {streak > 0 && (
            <span className="streak" title="Dias seguidos">
              🔥 {streak} {streak === 1 ? "dia" : "dias"}
            </span>
          )}
          <Link to={`/habitos/${id}`} className="card-link">
            Ver detalhes
          </Link>
        </div>
      </div>

      <span className="habit-status">{completed ? "Concluído" : "Pendente"}</span>
    </article>
  );
}
