import { useHabits } from "../context/useHabits";
import { donePartIds } from "../utils/parts";

export default function PartChips({ habit, size = "small" }) {
  const { togglePart, today } = useHabits();
  const done = new Set(donePartIds(habit, today));

  return (
    <div className={`part-chips is-${size}`} role="group" aria-label={`Partes de ${habit.title}`}>
      {habit.parts.map((part, index) => (
        <button
          key={part.id}
          type="button"
          className="part-chip"
          aria-pressed={done.has(part.id)}
          onClick={() => togglePart(habit.id, part.id)}
        >
          {part.label || (part.time ? "" : index + 1)}
          {part.time && <span className="part-time">{part.label ? ` · ${part.time}` : `⏰ ${part.time}`}</span>}
        </button>
      ))}
    </div>
  );
}
