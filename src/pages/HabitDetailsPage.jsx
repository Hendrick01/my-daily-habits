import { useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useHabits } from "../context/useHabits";
import HabitForm from "../components/HabitForm";
import { fromDateKey, lastDays, toDateKey } from "../utils/dates";
import { describeSchedule, getBestStreak, getStreak, isOffDay, streakUnit } from "../utils/schedule";

const HEATMAP_WEEKS = 16;
const weekday = new Intl.DateTimeFormat("pt-BR", { weekday: "short" });
const longDate = new Intl.DateTimeFormat("pt-BR", { weekday: "long", day: "numeric", month: "long" });
const shortDate = new Intl.DateTimeFormat("pt-BR", { day: "numeric", month: "short" });

// Grade estilo GitHub: uma coluna por semana, começando num domingo.
function Heatmap({ done, today, schedule }) {
  const days = lastDays((HEATMAP_WEEKS - 1) * 7 + today.getDay() + 1, today);
  const doneCount = days.filter((day) => done.has(toDateKey(day))).length;
  const summary = `${doneCount} de ${days.length} dias nas últimas ${HEATMAP_WEEKS} semanas`;

  return (
    <figure className="heatmap">
      <div className="heatmap-grid" role="img" aria-label={summary}>
        {days.map((day) => {
          const key = toDateKey(day);
          return (
            <span
              key={key}
              className={`heat-cell${done.has(key) ? " is-done" : isOffDay(schedule, day) ? " is-off" : ""}`}
              title={`${shortDate.format(day)}${done.has(key) ? " ✓" : ""}`}
            />
          );
        })}
      </div>
      <figcaption className="muted">{summary}</figcaption>
    </figure>
  );
}

export default function HabitDetailsPage() {
  const { habits, today, toggleHabit, updateHabit, removeHabit } = useHabits();
  const { habitId } = useParams();
  const navigate = useNavigate();
  const [editing, setEditing] = useState(false);
  const [confirmingDelete, setConfirmingDelete] = useState(false);

  const habit = habits.find((item) => item.id === habitId);

  if (!habit) {
    return (
      <div className="empty">
        <h2>Hábito não encontrado</h2>
        <Link to="/habitos">Voltar à lista</Link>
      </div>
    );
  }

  function handleSave(title, goal, emoji, schedule) {
    updateHabit(habit.id, title, goal, emoji, schedule);
    setEditing(false);
  }

  function handleDelete() {
    if (!confirmingDelete) {
      setConfirmingDelete(true);
      return;
    }
    removeHabit(habit.id);
    navigate("/habitos", { replace: true });
  }

  const todayDate = fromDateKey(today);
  const done = new Set(habit.completedDates);
  const streak = getStreak(habit, todayDate);
  const best = getBestStreak(habit, todayDate);

  return (
    <article className="card">
      {editing ? (
        <HabitForm
          initialTitle={habit.title}
          initialGoal={habit.goal ?? ""}
          initialEmoji={habit.emoji ?? ""}
          initialSchedule={habit.schedule}
          submitLabel="Salvar alterações"
          onSave={handleSave}
          onCancel={() => setEditing(false)}
        />
      ) : (
        <div className="detail-head">
          <div>
            <h2>
              {habit.emoji && (
                <span className="detail-emoji" aria-hidden="true">
                  {habit.emoji}
                </span>
              )}
              {habit.title}
            </h2>
            <p className="muted">Meta: {habit.goal || "Sem meta definida"}</p>
            <p className="muted">
              Frequência: {describeSchedule(habit.schedule)}
              {habit.schedule.type === "weekly" && ` · ${habit.weekCount}/${habit.schedule.times} esta semana`}
            </p>
          </div>
          <span className={`habit-status${habit.completed ? " is-done" : ""}`}>
            Status: {habit.completed ? "Concluído" : "Pendente"}
          </span>
        </div>
      )}

      <div className="stats">
        <div className="stat">
          <strong>🔥 {streak}</strong>
          <span>{habit.schedule.type === "weekly" ? "semanas seguidas na meta" : "dias seguidos"}</span>
        </div>
        <div className="stat">
          <strong>🏆 {best}</strong>
          <span>melhor sequência ({streakUnit(habit.schedule, best)})</span>
        </div>
        <div className="stat">
          <strong>{habit.completedDates.length}</strong>
          <span>dias concluídos no total</span>
        </div>
      </div>

      <h3>Últimos 7 dias</h3>
      <p className="muted hint">Esqueceu de marcar? Toque num dia para corrigir.</p>
      <ol className="week">
        {lastDays(7, todayDate).map((day) => {
          const key = toDateKey(day);
          return (
            <li key={key} className="week-day">
              <button
                type="button"
                className={`week-dot${done.has(key) ? " is-done" : isOffDay(habit.schedule, day) ? " is-off" : ""}`}
                aria-pressed={done.has(key)}
                aria-label={longDate.format(day)}
                onClick={() => toggleHabit(habit.id, key)}
              />
              <span className={key === today ? "is-today" : undefined}>{weekday.format(day).replace(".", "")}</span>
            </li>
          );
        })}
      </ol>

      <h3 className="section-gap">Histórico</h3>
      <Heatmap done={done} today={todayDate} schedule={habit.schedule} />

      <div className="actions">
        <button type="button" className="btn btn-primary" onClick={() => toggleHabit(habit.id)}>
          {habit.completed ? "Desmarcar hoje" : "Concluir hoje"}
        </button>
        <button type="button" className="btn btn-ghost" onClick={() => navigate(-1)}>
          Voltar
        </button>
        {!editing && (
          <button type="button" className="btn btn-ghost" onClick={() => setEditing(true)}>
            Editar
          </button>
        )}
        <button
          type="button"
          className={`btn btn-danger${confirmingDelete ? " is-confirming" : ""}`}
          onClick={handleDelete}
          onBlur={() => setConfirmingDelete(false)}
        >
          {confirmingDelete ? "Confirmar exclusão" : "Excluir"}
        </button>
      </div>
    </article>
  );
}
