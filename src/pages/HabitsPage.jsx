import { useState } from "react";
import HabitList from "../components/HabitList";
import BackupPanel from "../components/BackupPanel";
import { useHabits } from "../context/useHabits";

const filters = [
  ["all", "Todos"],
  ["pending", "Pendentes"],
  ["done", "Concluídos"],
];

export default function HabitsPage() {
  const { habits, completedCount } = useHabits();
  const [filter, setFilter] = useState("all");
  const counts = { all: habits.length, pending: habits.length - completedCount, done: completedCount };

  return (
    <>
      <div className="segmented" role="group" aria-label="Filtrar hábitos">
        {filters.map(([value, label]) => (
          <button key={value} type="button" aria-pressed={filter === value} onClick={() => setFilter(value)}>
            {label} <span className="count">{counts[value]}</span>
          </button>
        ))}
      </div>
      <HabitList filter={filter} />
      <BackupPanel />
    </>
  );
}
