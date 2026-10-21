import { useState } from "react";
import Panel from "../components/Panel";
import HabitList from "../components/HabitList";
import { useHabits } from "../context/useHabits";
import { fromDateKey } from "../utils/dates";

const dateFormat = new Intl.DateTimeFormat("pt-BR", { weekday: "long", day: "numeric", month: "long" });

function greeting(hour) {
  if (hour < 12) return "Bom dia";
  if (hour < 18) return "Boa tarde";
  return "Boa noite";
}

export default function HomePage() {
  const { habits, completedCount, today } = useHabits();
  const total = habits.length;
  const percentage = total === 0 ? 0 : Math.round((completedCount / total) * 100);
  const [hour] = useState(() => new Date().getHours());

  return (
    <>
      <section className="hero">
        <p className="eyebrow">{dateFormat.format(fromDateKey(today))}</p>
        <h1>{greeting(hour)}, Hendrick!</h1>
        <p className="hero-sub">Pequenos hábitos, progresso visível.</p>

        <div
          className="progress-bar"
          role="progressbar"
          aria-label="Progresso de hoje"
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={percentage}
        >
          <span style={{ width: `${percentage}%` }} />
        </div>
        <p className="hero-count">
          {completedCount} de {total} hábitos concluídos.
        </p>
        {total > 0 && completedCount === total && <p className="celebrate">🎉 Tudo feito hoje. Mandou bem!</p>}
      </section>

      <Panel title="Hábitos de hoje">
        <HabitList />
      </Panel>
    </>
  );
}
