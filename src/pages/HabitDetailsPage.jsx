import { useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useHabits } from "../context/useHabits";
import HabitForm from "../components/HabitForm";
import { fromDateKey, getStreak, lastDays, toDateKey } from "../utils/dates";

const weekday = new Intl.DateTimeFormat("pt-BR", { weekday: "short" });
const longDate = new Intl.DateTimeFormat("pt-BR", { weekday: "long", day: "numeric", month: "long" });

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

  function handleSave(title, goal) {
    updateHabit(habit.id, title, goal);
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

  return (
    <article className="card">
      {editing ? (
        <HabitForm
          initialTitle={habit.title}
          initialGoal={habit.goal ?? ""}
          submitLabel="Salvar alterações"
          onSave={handleSave}
          onCancel={() => setEditing(false)}
        />
      ) : (
        <div className="detail-head">
          <div>
            <h2>{habit.title}</h2>
            <p className="muted">Meta: {habit.goal || "Sem meta definida"}</p>
          </div>
          <span className={`habit-status${habit.completed ? " is-done" : ""}`}>
            Status: {habit.completed ? "Concluído" : "Pendente"}
          </span>
        </div>
      )}

      <div className="stats">
        <div className="stat">
          <strong>🔥 {getStreak(habit.completedDates, todayDate)}</strong>
          <span>dias seguidos</span>
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
                className={`week-dot${done.has(key) ? " is-done" : ""}`}
                aria-pressed={done.has(key)}
                aria-label={longDate.format(day)}
                onClick={() => toggleHabit(habit.id, key)}
              />
              <span className={key === today ? "is-today" : undefined}>{weekday.format(day).replace(".", "")}</span>
            </li>
          );
        })}
      </ol>

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
