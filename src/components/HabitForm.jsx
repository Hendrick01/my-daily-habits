import { useState } from "react";
import { DAILY, DAY_LABELS } from "../utils/schedule";

const EMOJIS = ["💧", "📖", "🧘", "🏃", "🍎", "💤", "✍️", "🎯", "💪", "🧹", "🎸", "🌱"];
const SCHEDULE_TYPES = [
  ["daily", "Todo dia"],
  ["weekdays", "Dias da semana"],
  ["weekly", "Vezes por semana"],
];

export default function HabitForm({
  onSave,
  onCancel,
  initialTitle = "",
  initialGoal = "",
  initialEmoji = "",
  initialSchedule = DAILY,
  submitLabel = "Adicionar hábito",
}) {
  const [title, setTitle] = useState(initialTitle);
  const [goal, setGoal] = useState(initialGoal);
  const [emoji, setEmoji] = useState(initialEmoji);
  const [scheduleType, setScheduleType] = useState(initialSchedule.type);
  const [days, setDays] = useState(initialSchedule.type === "weekdays" ? initialSchedule.days : [1, 2, 3, 4, 5]);
  const [times, setTimes] = useState(initialSchedule.type === "weekly" ? initialSchedule.times : 3);
  const [error, setError] = useState("");

  const emojiOptions = ["", ...new Set([initialEmoji, ...EMOJIS].filter(Boolean))];

  function toggleDay(day) {
    setDays((current) => (current.includes(day) ? current.filter((item) => item !== day) : [...current, day].sort((a, b) => a - b)));
  }

  function buildSchedule() {
    if (scheduleType === "weekdays") return days.length === 7 ? DAILY : { type: "weekdays", days };
    if (scheduleType === "weekly") return { type: "weekly", times: Math.min(6, Math.max(1, Math.round(times) || 1)) };
    return DAILY;
  }

  function handleSubmit(event) {
    event.preventDefault();

    if (title.trim() === "" || goal.trim() === "") {
      setError("Preencha o hábito e a meta.");
      return;
    }
    if (scheduleType === "weekdays" && days.length === 0) {
      setError("Escolha pelo menos um dia da semana.");
      return;
    }

    onSave(title, goal, emoji || undefined, buildSchedule());
    setTitle("");
    setGoal("");
    setEmoji("");
    setScheduleType("daily");
    setError("");
  }

  return (
    <form className="form" onSubmit={handleSubmit} noValidate>
      <label className="field">
        Hábito
        <input
          type="text"
          name="habit"
          placeholder="Ex.: Beber água"
          maxLength={60}
          value={title}
          onChange={(event) => setTitle(event.target.value)}
        />
      </label>

      <label className="field">
        Meta
        <input
          type="text"
          name="goal"
          placeholder="Ex.: 8 copos"
          maxLength={60}
          value={goal}
          onChange={(event) => setGoal(event.target.value)}
        />
      </label>

      <fieldset className="field plain-fieldset">
        <legend>Frequência</legend>
        <div className="segmented">
          {SCHEDULE_TYPES.map(([value, label]) => (
            <label key={value}>
              <input
                type="radio"
                name="schedule"
                value={value}
                className="sr-only"
                checked={scheduleType === value}
                onChange={() => setScheduleType(value)}
              />
              {label}
            </label>
          ))}
        </div>

        {scheduleType === "weekdays" && (
          <div className="day-picker">
            {DAY_LABELS.map((label, day) => (
              <label key={label} className="day-option">
                <input type="checkbox" className="sr-only" checked={days.includes(day)} onChange={() => toggleDay(day)} />
                {label}
              </label>
            ))}
          </div>
        )}

        {scheduleType === "weekly" && (
          <label className="times-field">
            Quantas vezes por semana?
            <input
              type="number"
              name="times"
              min={1}
              max={6}
              value={times}
              onChange={(event) => setTimes(Number(event.target.value))}
            />
          </label>
        )}
      </fieldset>

      <fieldset className="field plain-fieldset">
        <legend>Ícone (opcional)</legend>
        <div className="emoji-picker">
          {emojiOptions.map((option) => (
            <label key={option || "none"} className="emoji-option">
              <input
                type="radio"
                name="emoji"
                className="sr-only"
                checked={emoji === option}
                onChange={() => setEmoji(option)}
                aria-label={option ? `Ícone ${option}` : "Sem ícone"}
              />
              <span aria-hidden="true">{option || "—"}</span>
            </label>
          ))}
        </div>
      </fieldset>

      {error && (
        <p className="form-error" role="alert">
          {error}
        </p>
      )}

      <div className="form-actions">
        <button type="submit" className="btn btn-primary">
          {submitLabel}
        </button>
        {onCancel && (
          <button type="button" className="btn btn-ghost" onClick={onCancel}>
            Cancelar
          </button>
        )}
      </div>
    </form>
  );
}
