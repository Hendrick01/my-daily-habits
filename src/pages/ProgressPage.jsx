import { useHabits } from "../context/useHabits";
import { fromDateKey, getStreak, lastDays, toDateKey } from "../utils/dates";

const weekday = new Intl.DateTimeFormat("pt-BR", { weekday: "short" });

export default function ProgressPage() {
  const { habits, completedCount, today } = useHabits();
  const total = habits.length;

  if (total === 0) {
    return (
      <div className="empty">
        <h1>Progresso</h1>
        <p>Nenhum hábito cadastrado para medir progresso.</p>
      </div>
    );
  }

  const percentage = Math.round((completedCount / total) * 100);
  const todayDate = fromDateKey(today);
  const week = lastDays(7, todayDate).map((day) => {
    const key = toDateKey(day);
    return {
      key,
      label: weekday.format(day).replace(".", ""),
      count: habits.filter((habit) => habit.completedDates.includes(key)).length,
    };
  });
  const best = habits
    .map((habit) => ({ title: habit.title, streak: getStreak(habit.completedDates, todayDate) }))
    .sort((a, b) => b.streak - a.streak)[0];

  return (
    <>
      <header className="page-head">
        <h1>Progresso</h1>
        <p>Como você está indo hoje e na última semana.</p>
      </header>

      <div className="progress-grid">
        <section className="card ring-card">
          <div className="ring" style={{ "--value": String(percentage) }} role="img" aria-label={`${percentage}% concluído hoje`}>
            <div className="ring-inner">
              <strong>{percentage}%</strong>
              <span>hoje</span>
            </div>
          </div>
          <p>
            {completedCount} de {total} hábitos concluídos.
          </p>
        </section>

        <section className="card">
          <h2>Últimos 7 dias</h2>
          <div className="bars">
            {week.map((day) => (
              <div key={day.key} className={`bar${day.key === today ? " is-today" : ""}`}>
                <div className="bar-track">
                  <div className="bar-fill" style={{ height: `${(day.count / total) * 100}%` }} />
                </div>
                <strong>{day.count}</strong>
                <span>{day.label}</span>
              </div>
            ))}
          </div>
          {best.streak > 0 && (
            <p className="muted">
              Maior sequência: 🔥 {best.streak} {best.streak === 1 ? "dia" : "dias"} em “{best.title}”
            </p>
          )}
        </section>
      </div>
    </>
  );
}
