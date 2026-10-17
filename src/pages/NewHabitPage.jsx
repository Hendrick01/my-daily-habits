import { useState, useContext } from "react";
import { HabitsContext } from "../context/HabitsContext";

export default function NewHabitPage() {
  const context = useContext(HabitsContext);

  if (!context) {
    throw new Error("O componente NewHabitPage precisa estar dentro de um HabitsProvider.");
  }

  const { addHabit } = context;
  const [title, setTitle] = useState("");
  const [goal, setGoal] = useState("");
  const [error, setError] = useState("");

  function handleSubmit(event) {
    event.preventDefault();

    if (title.trim() === "" || goal.trim() === "") {
      setError("Preencha o hábito e a meta.");
      return;
    }

    addHabit(title, goal);
    setTitle("");
    setGoal("");
    setError("");
  }

  return (
    <div>
      <h2>Cadastrar novo hábito</h2>
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
    </div>
  );
}
