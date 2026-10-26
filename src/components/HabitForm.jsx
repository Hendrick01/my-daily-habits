import { useState } from "react";
import { DAILY, DAY_LABELS } from "../utils/schedule";
import { MAX_PARTS } from "../utils/parts";

// Por tema: saúde, exercício, comida, sono, mente, estudo, foco, dinheiro, casa, pessoas e lazer.
const EMOJIS = [
  "💧", "💊", "🦷", "🧴", "❤️",
  "🏃", "🚶", "🚴", "🏊", "🏋️", "💪", "🤸", "🧘", "⚽",
  "🍎", "🥗", "🥦", "🍳", "☕", "🚭",
  "💤", "🛏️", "🌙", "☀️", "⏰",
  "🧠", "🙏", "😊", "📵",
  "📖", "📚", "✍️", "📝", "🎓", "🗣️", "💻",
  "🎯", "✅", "📅", "⏱️",
  "💰", "🐷",
  "🧹", "🧺", "🍽️", "🌱", "🐶", "🛒",
  "📞", "👪", "💌", "🤝",
  "🎸", "🎹", "🎨", "📷", "🎮", "🧩", "✈️",
];
const PRESET_PARTS = [
  { label: "Manhã", time: "08:00" },
  { label: "Tarde", time: "13:00" },
  { label: "Noite", time: "20:00" },
];
const newPartId = () => crypto.randomUUID().slice(0, 8);

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
  initialParts = [],
  submitLabel = "Adicionar hábito",
}) {
  const [title, setTitle] = useState(initialTitle);
  const [goal, setGoal] = useState(initialGoal);
  const [emoji, setEmoji] = useState(initialEmoji);
  const [scheduleType, setScheduleType] = useState(initialSchedule.type);
  const [days, setDays] = useState(initialSchedule.type === "weekdays" ? initialSchedule.days : [1, 2, 3, 4, 5]);
  const [times, setTimes] = useState(initialSchedule.type === "weekly" ? initialSchedule.times : 3);
  const [parts, setParts] = useState(initialParts.map((part) => ({ ...part, time: part.time ?? "" })));
  const [error, setError] = useState("");

  const emojiOptions = ["", ...new Set([initialEmoji, ...EMOJIS].filter(Boolean))];

  function toggleDay(day) {
    setDays((current) => (current.includes(day) ? current.filter((item) => item !== day) : [...current, day].sort((a, b) => a - b)));
  }

  function addPart() {
    setParts((current) => [...current, { id: newPartId(), label: "", time: "" }]);
  }

  function updatePart(partId, field, value) {
    setParts((current) => current.map((part) => (part.id === partId ? { ...part, [field]: value } : part)));
  }

  function removePart(partId) {
    setParts((current) => current.filter((part) => part.id !== partId));
  }

  // Uma parte só, sem nome nem horário, é o mesmo que não dividir.
  function buildParts() {
    const clean = parts.map((part) => ({ id: part.id, label: part.label.trim(), time: part.time || null }));
    if (clean.length === 0 || (clean.length === 1 && !clean[0].label && !clean[0].time)) return undefined;
    return clean;
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

    onSave(title, goal, emoji || undefined, buildSchedule(), buildParts());
    setTitle("");
    setGoal("");
    setEmoji("");
    setScheduleType("daily");
    setParts([]);
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
        <legend>Partes do dia (opcional)</legend>
        <p className="field-hint">
          Divida em partes, como 4 copos de água ou remédio de manhã e à noite. Com horário, cada parte vira um lembrete.
        </p>
        {parts.length > 0 && (
          <ol className="parts-editor">
            {parts.map((part, index) => (
              <li key={part.id}>
                <span className="part-number" aria-hidden="true">
                  {index + 1}
                </span>
                <input
                  type="text"
                  name="part-label"
                  aria-label={`Nome da parte ${index + 1}`}
                  placeholder={`Parte ${index + 1}`}
                  maxLength={40}
                  value={part.label}
                  onChange={(event) => updatePart(part.id, "label", event.target.value)}
                />
                <input
                  type="time"
                  name="part-time"
                  aria-label={`Horário da parte ${index + 1}`}
                  value={part.time}
                  onChange={(event) => updatePart(part.id, "time", event.target.value)}
                />
                <button type="button" className="remove-part" aria-label={`Remover parte ${index + 1}`} onClick={() => removePart(part.id)}>
                  ✕
                </button>
              </li>
            ))}
          </ol>
        )}
        <div className="chips">
          <button type="button" className="chip" onClick={addPart} disabled={parts.length >= MAX_PARTS}>
            + Adicionar parte
          </button>
          {parts.length === 0 && (
            <button type="button" className="chip" onClick={() => setParts(PRESET_PARTS.map((part) => ({ ...part, id: newPartId() })))}>
              Manhã, tarde e noite
            </button>
          )}
        </div>
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
