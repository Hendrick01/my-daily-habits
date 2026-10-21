import { useState } from "react";

const EMOJIS = ["💧", "📖", "🧘", "🏃", "🍎", "💤", "✍️", "🎯", "💪", "🧹", "🎸", "🌱"];

export default function HabitForm({
  onSave,
  onCancel,
  initialTitle = "",
  initialGoal = "",
  initialEmoji = "",
  submitLabel = "Adicionar hábito",
}) {
  const [title, setTitle] = useState(initialTitle);
  const [goal, setGoal] = useState(initialGoal);
  const [emoji, setEmoji] = useState(initialEmoji);
  const [error, setError] = useState("");

  const emojiOptions = ["", ...new Set([initialEmoji, ...EMOJIS].filter(Boolean))];

  function handleSubmit(event) {
    event.preventDefault();

    if (title.trim() === "" || goal.trim() === "") {
      setError("Preencha o hábito e a meta.");
      return;
    }

    onSave(title, goal, emoji || undefined);
    setTitle("");
    setGoal("");
    setEmoji("");
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

      <fieldset className="field emoji-field">
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
