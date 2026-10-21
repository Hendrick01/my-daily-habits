import { useState } from "react";

export default function HabitForm({ onAddHabit }) {
  const [title, setTitle] = useState("");
  const [goal, setGoal] = useState("");
  const [error, setError] = useState("");

  function handleSubmit(event) {
    event.preventDefault();

    if (title.trim() === "" || goal.trim() === "") {
      setError("Preencha o hábito e a meta.");
      return;
    }

    onAddHabit(title, goal);
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

      <button type="submit" className="btn btn-primary">
        Adicionar hábito
      </button>
    </form>
  );
}
