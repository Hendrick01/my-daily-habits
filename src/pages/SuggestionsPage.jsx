import { useState } from "react";
import { fetchSuggestions } from "../services/habitSuggestions";
import { useHabits } from "../context/useHabits";

export default function SuggestionsPage() {
  const { habits, addHabit } = useHabits();
  const [suggestions, setSuggestions] = useState([]);
  const [status, setStatus] = useState("idle"); // idle | loading | success | error
  const [errorMessage, setErrorMessage] = useState("");

  async function handleSearch() {
    setStatus("loading");
    setErrorMessage("");

    try {
      const data = await fetchSuggestions();
      setSuggestions(data);
      setStatus("success");
    } catch (error) {
      setSuggestions([]);
      setErrorMessage(error.message);
      setStatus("error");
    }
  }

  const myTitles = new Set(habits.map((habit) => habit.title.toLowerCase()));

  return (
    <>
      <header className="page-head">
        <h1>Sugestões</h1>
        <p>Cada busca sorteia 6 ideias. Gostou de alguma? Adicione à sua lista.</p>
      </header>

      <button type="button" className="btn btn-primary" onClick={handleSearch} disabled={status === "loading"}>
        Buscar sugestões
      </button>

      <div className="suggestions" aria-live="polite">
        {status === "idle" && <p className="status-msg">Clique no botão acima para buscar ideias de hábitos.</p>}

        {status === "loading" && (
          <>
            <p className="status-msg">Buscando sugestões...</p>
            {[1, 2, 3].map((row) => (
              <div key={row} className="skeleton" />
            ))}
          </>
        )}

        {status === "error" && (
          <p className="status-msg is-error" role="alert">
            {errorMessage}
          </p>
        )}

        {status === "success" && (
          <>
            <p className="status-msg">{suggestions.length} sugestões recebidas</p>
            <ul className="suggestion-list">
              {suggestions.map((item) => {
                const added = myTitles.has(item.title.toLowerCase());
                return (
                  <li key={item.id} className="suggestion">
                    <span className="habit-emoji" aria-hidden="true">
                      {item.emoji}
                    </span>
                    <div className="suggestion-info">
                      <strong>{item.title}</strong>
                      <p className="muted">Meta: {item.goal}</p>
                    </div>
                    <button
                      type="button"
                      className="btn btn-ghost btn-sm"
                      disabled={added}
                      onClick={() => addHabit(item.title, item.goal, item.emoji)}
                    >
                      {added ? "Adicionado ✓" : "+ Adicionar"}
                    </button>
                  </li>
                );
              })}
            </ul>
          </>
        )}
      </div>
    </>
  );
}
