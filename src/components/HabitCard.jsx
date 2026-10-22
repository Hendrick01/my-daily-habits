import { Link } from "react-router-dom";
import { useHabits } from "../context/useHabits";
import PartChips from "./PartChips";
import { fromDateKey } from "../utils/dates";
import { describeSchedule, getStreak, streakUnit } from "../utils/schedule";
import { isSplit, nextPartToToggle, partProgress } from "../utils/parts";

export default function HabitCard(habit) {
  const { id, title, goal = "Sem meta definida", emoji, schedule, completed, weekCount, parts } = habit;
  const { toggleHabit, togglePart, today } = useHabits();
  const streak = getStreak(habit, fromDateKey(today));
  const split = isSplit(habit);
  const progress = partProgress(habit, today);
  const partial = split && !completed && progress.done > 0;
  const singleTime = !split && parts?.[0]?.time;

  return (
    <article className={`habit-card${completed ? " is-complete" : ""}`}>
      <button
        type="button"
        className={`check${partial ? " is-partial" : ""}`}
        style={split ? { "--progress": `${(progress.done / progress.total) * 100}%` } : undefined}
        onClick={() => (split ? togglePart(id, nextPartToToggle(habit, today)) : toggleHabit(id))}
        aria-pressed={completed}
        aria-label={split ? `Marcar próxima parte de ${title} (${progress.done} de ${progress.total})` : `Concluir ${title}`}
      >
        {split && !completed ? (
          <span className="check-count" aria-hidden="true">
            {progress.done}/{progress.total}
          </span>
        ) : (
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <path d="M5 12.5l4.5 4.5L19 7.5" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        )}
      </button>

      {emoji && (
        <span className="habit-emoji" aria-hidden="true">
          {emoji}
        </span>
      )}

      <div className="habit-info">
        <h2>{title}</h2>
        <p>Meta: {goal}</p>
        {split && <PartChips habit={habit} />}
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
          {singleTime && <span className="schedule-tag">⏰ {singleTime}</span>}
          <Link to={`/habitos/${id}`} className="card-link">
            Ver detalhes
          </Link>
        </div>
      </div>

      <span className="habit-status">{completed ? "Concluído" : partial ? `${progress.done} de ${progress.total}` : "Pendente"}</span>
    </article>
  );
}
