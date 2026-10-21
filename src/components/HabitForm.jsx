import { useState } from "react";

export default function HabitForm({ onSave, onCancel, initialTitle = "", initialGoal = "", submitLabel = "Adicionar hábito" }) {
  const [title, setTitle] = useState(initialTitle);
  const [goal, setGoal] = useState(initialGoal);
  const [error, setError] = useState("");

  function handleSubmit(event) {
    event.preventDefault();

    if (title.trim() === "" || goal.trim() === "") {
      setError("Preencha o hábito e a meta.");
      return;
    }

    onSave(title, goal);
    setTitle("");
    setGoal("");
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
