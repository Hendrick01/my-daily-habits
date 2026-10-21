import { useState } from "react";
import { fetchSuggestions } from "../services/habitSuggestions";
import Panel from "../components/Panel";

export default function SuggestionsPage() {
  const [suggestions, setSuggestions] = useState([]);
  const [status, setStatus] = useState("idle"); // 'idle', 'loading', 'success', 'error'
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

  return (
    <div>
      <h2>Sugestões de Hábitos</h2>
      <button type="button" onClick={handleSearch} disabled={status === "loading"}>
        Buscar sugestões
      </button>

      <div style={{ marginTop: "2rem" }}>
        {status === "idle" && <p>Clique no botão acima para buscar ideias de hábitos na API.</p>}
        {status === "loading" && <p>Buscando sugestões...</p>}
        {status === "error" && <p style={{ color: "red" }}>{errorMessage}</p>}
        
        {status === "success" && (
          <Panel title={`${suggestions.length} sugestões recebidas`}>
            <ul style={{ listStyle: "none", padding: 0 }}>
              {suggestions.map((item) => (
                <li 
                  key={item.id} 
                  style={{ 
                    padding: "1rem", 
                    border: "1px solid #ddd", 
                    marginBottom: "0.5rem", 
                    borderRadius: "4px" 
                  }}
                >
                  <strong>{item.title}</strong>
                  <br />
                  <small>Status original: {item.completed ? "Concluído" : "Pendente"}</small>
                </li>
              ))}
            </ul>
          </Panel>
        )}
      </div>
    </div>
  );
}
