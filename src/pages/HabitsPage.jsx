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
  const { habits } = useHabits();
  const doneCount = habits.filter((habit) => habit.completed).length;
  const [filter, setFilter] = useState("all");
  const counts = { all: habits.length, pending: habits.length - doneCount, done: doneCount };

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
