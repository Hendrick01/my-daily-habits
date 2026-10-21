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
    <form onSubmit={handleSubmit}>
      <label>
        Hábito
        <input
          type="text"
          name="habit"
          value={title}
          onChange={(event) => setTitle(event.target.value)}
        />
      </label>

      <label>
        Meta
        <input
          type="text"
          name="goal"
          value={goal}
          onChange={(event) => setGoal(event.target.value)}
        />
      </label>

      {error && <p>{error}</p>}

      <button type="submit">Adicionar hábito</button>
    </form>
  );
}
