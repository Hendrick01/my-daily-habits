import { useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useHabits } from "../context/useHabits";
import { getStreak, lastDays, toDateKey } from "../utils/dates";

const weekday = new Intl.DateTimeFormat("pt-BR", { weekday: "short" });

export default function HabitDetailsPage() {
  const { habits, toggleHabit, removeHabit } = useHabits();
  const { habitId } = useParams();
  const navigate = useNavigate();
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

  function handleDelete() {
    if (!confirmingDelete) {
      setConfirmingDelete(true);
      return;
    }
    removeHabit(habit.id);
    navigate("/habitos", { replace: true });
  }

  const done = new Set(habit.completedDates);

  return (
    <article className="card">
      <div className="detail-head">
        <div>
          <h2>{habit.title}</h2>
          <p className="muted">Meta: {habit.goal || "Sem meta definida"}</p>
        </div>
        <span className={`habit-status${habit.completed ? " is-done" : ""}`}>
          Status: {habit.completed ? "Concluído" : "Pendente"}
        </span>
      </div>

      <div className="stats">
        <div className="stat">
          <strong>🔥 {getStreak(habit.completedDates)}</strong>
          <span>dias seguidos</span>
        </div>
        <div className="stat">
          <strong>{habit.completedDates.length}</strong>
          <span>dias concluídos no total</span>
        </div>
      </div>

      <h3>Últimos 7 dias</h3>
      <ol className="week">
        {lastDays(7).map((day) => {
          const key = toDateKey(day);
          return (
            <li key={key} className="week-day">
              <span className={`week-dot${done.has(key) ? " is-done" : ""}`} aria-hidden="true" />
              {weekday.format(day).replace(".", "")}
              <span className="sr-only">{done.has(key) ? "feito" : "não feito"}</span>
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
