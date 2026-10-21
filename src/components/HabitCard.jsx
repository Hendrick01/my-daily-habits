import { Link } from "react-router-dom";
import { useHabits } from "../context/useHabits";
import { fromDateKey } from "../utils/dates";
import { describeSchedule, getStreak, streakUnit } from "../utils/schedule";

export default function HabitCard({ id, title, goal = "Sem meta definida", emoji, schedule, completed, completedDates, weekCount }) {
  const { toggleHabit, today } = useHabits();
  const streak = getStreak({ schedule, completedDates }, fromDateKey(today));

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

      {emoji && (
        <span className="habit-emoji" aria-hidden="true">
          {emoji}
        </span>
      )}

      <div className="habit-info">
        <h2>{title}</h2>
        <p>Meta: {goal}</p>
        <div className="habit-meta">
          {streak > 0 && (
            <span className="streak" title="Dias seguidos">
              🔥 {streak} {streakUnit(schedule, streak)}
            </span>
          )}
          {schedule.type !== "daily" && (
            <span className="schedule-tag">
              {schedule.type === "weekly" ? `${weekCount}/${schedule.times} esta semana` : describeSchedule(schedule)}
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
