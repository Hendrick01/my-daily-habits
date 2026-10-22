import { useState } from "react";
import { Link } from "react-router-dom";
import { useTraining } from "../context/useTraining";
import ExerciseDemo from "./ExerciseDemo";
import { EQUIPMENT, GROUPS, TYPES } from "../data/exercises";
import { filterExercises } from "../utils/training";

export default function ExercisePicker({ workoutId, onPick }) {
  const { library } = useTraining();
  const [query, setQuery] = useState("");
  const [group, setGroup] = useState("");
  const [type, setType] = useState("");
  const [added, setAdded] = useState("");
  const results = filterExercises(library, { query, group, type }).slice(0, 40);

  function pick(exercise) {
    onPick(exercise);
    setAdded(exercise.name);
  }

  return (
    <section className="card picker" aria-label="Adicionar exercício">
      <div className="picker-filters">
        <input type="search" name="search" placeholder="Buscar exercício (ex.: supino, prancha)" value={query} onChange={(event) => setQuery(event.target.value)} />
        <select name="group" value={group} onChange={(event) => setGroup(event.target.value)} aria-label="Grupo muscular">
          <option value="">Todos os grupos</option>
          {Object.entries(GROUPS).map(([key, label]) => (
            <option key={key} value={key}>
              {label}
            </option>
          ))}
        </select>
        <select name="type" value={type} onChange={(event) => setType(event.target.value)} aria-label="Tipo">
          <option value="">Todos os tipos</option>
          {Object.entries(TYPES).map(([key, label]) => (
            <option key={key} value={key}>
              {label}
            </option>
          ))}
        </select>
      </div>

      {added && (
        <p className="status-msg" role="status">
          “{added}” adicionado ao treino ✓
        </p>
      )}

      {results.length === 0 ? (
        <p className="muted">Nenhum exercício encontrado.</p>
      ) : (
        <ul className="picker-list">
          {results.map((exercise) => (
            <li key={exercise.id}>
              <ExerciseDemo image={exercise.image} name={exercise.name} size="small" />
              <div className="picker-info">
                <strong>{exercise.name}</strong>
                <span className="muted">
                  {GROUPS[exercise.group]} · {EQUIPMENT[exercise.equipment] ?? "Outro"}
                  {exercise.custom && " · meu exercício"}
                </span>
              </div>
              <button type="button" className="btn btn-ghost btn-sm" onClick={() => pick(exercise)}>
                + Adicionar
              </button>
            </li>
          ))}
        </ul>
      )}

      <p className="muted picker-footer">
        Não achou? <Link to={`/treino/exercicios/novo?treino=${workoutId}`}>Crie o seu exercício</Link> ou procure no{" "}
        <Link to="/treino/exercicios">catálogo completo</Link>.
      </p>
    </section>
  );
}
