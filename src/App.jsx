import { useState, useEffect } from "react";
import "./App.css";
import HabitList from "./components/HabitList";
import Panel from "./components/Panel";
import { initialHabits } from "./data/habits";

const STORAGE_KEY = "my-daily-habits:habits";

function loadHabits() {
  try {
    const storedHabits = localStorage.getItem(STORAGE_KEY);
    
    if (storedHabits === null) {
      return initialHabits;
    }

    const parsedHabits = JSON.parse(storedHabits);
    if (Array.isArray(parsedHabits)) {
      return parsedHabits;
    }
    
    return initialHabits;
  } catch {
    // Optional catch binding: cai aqui se o JSON.parse falhar ou se o getItem estourar erro
    return initialHabits;
  }
}

export default function App() {
  const [habits, setHabits] = useState(() => loadHabits());
  const [title, setTitle] = useState("");
  const [goal, setGoal] = useState("");
  const [error, setError] = useState("");

  const completedCount = habits.filter((habit) => habit.completed).length;

  // Efeito 1: Salvar no localStorage
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(habits));
  }, [habits]);

  // Efeito 2: Título da aba
  useEffect(() => {
    const originalTitle = document.title;
    document.title = `${completedCount}/${habits.length} hábitos concluídos`;

    // Função de limpeza
    return () => {
      document.title = originalTitle;
    };
  }, [completedCount, habits.length]);

  function handleToggleHabit(habitId) {
    setHabits((currentHabits) =>
      currentHabits.map((habit) => {
        if (habit.id === habitId) {
          return {
            ...habit,
            completed: !habit.completed,
          };
        }

        return habit;
      }),
    );
  }

  function handleSubmit(event) {
    event.preventDefault();

    if (title.trim() === "" || goal.trim() === "") {
      setError("Preencha o hábito e a meta.");
      return;
    }

    const novoHabito = {
      id: crypto.randomUUID(),
      title: title.trim(),
      goal: goal.trim(),
      completed: false,
    };

    setHabits((currentHabits) => [
      ...currentHabits,
      novoHabito,
    ]);

    setTitle("");
    setGoal("");
    setError("");
  }

  return (
    <main className="app">
      <header className="hero">
        <p className="eyebrow">MY DAILY HABITS</p>
        <h1>Pequenos hábitos, progresso visível.</h1>
        <p>
          {completedCount} de {habits.length} hábitos concluídos.
        </p>
      </header>

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

      <Panel title="Hábitos de hoje">
        <HabitList habits={habits} onToggle={handleToggleHabit} />
      </Panel>
    </main>
  );
}
