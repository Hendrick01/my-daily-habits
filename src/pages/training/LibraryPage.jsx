import { useState } from "react";
import { Link } from "react-router-dom";
import { useTraining } from "../../context/useTraining";
import ExerciseDemo from "../../components/ExerciseDemo";
import { EQUIPMENT, GROUPS, TYPES } from "../../data/exercises";
import { filterExercises } from "../../utils/training";
import { loadCatalog } from "../../services/catalog";

function ExerciseGrid({ exercises }) {
  return (
    <ul className="exercise-grid">
      {exercises.map((exercise) => (
        <li key={exercise.id}>
          <Link to={`/treino/exercicios/${exercise.id}`} className="exercise-card">
            <ExerciseDemo image={exercise.image} name={exercise.name} size="small" />
            <span className="exercise-card-info">
              <strong>{exercise.name}</strong>
              <span className="muted">
                {GROUPS[exercise.group]} · {EQUIPMENT[exercise.equipment] ?? exercise.equipmentLabel ?? "Outro"}
              </span>
              {exercise.custom && <span className="schedule-tag">meu</span>}
            </span>
          </Link>
        </li>
      ))}
    </ul>
  );
}

export default function LibraryPage() {
  const { library } = useTraining();
  const [query, setQuery] = useState("");
  const [type, setType] = useState("");
  const [group, setGroup] = useState("");
  const [equipment, setEquipment] = useState("");
  const [catalog, setCatalog] = useState({ status: "idle", list: [], error: "" });

  const results = filterExercises(library, { query, type, group, equipment });
  const catalogResults =
    catalog.status === "ready" && query.trim().length >= 2 ? filterExercises(catalog.list, { query, type, group }).slice(0, 30) : [];

  async function openCatalog() {
    setCatalog({ status: "loading", list: [], error: "" });
    try {
      setCatalog({ status: "ready", list: await loadCatalog(), error: "" });
    } catch (error) {
      setCatalog({ status: "error", list: [], error: error.message });
    }
  }

  return (
    <>
      <p className="breadcrumb">
        <Link to="/treino">← Treinos</Link>
      </p>
      <header className="page-head">
        <h1>Exercícios</h1>
        <p>
          {library.length} exercícios com demonstração, passo a passo e vídeo. Não achou?{" "}
          <Link to="/treino/exercicios/novo">Crie o seu</Link>.
        </p>
      </header>

      <div className="library-filters">
        <input type="search" name="search" placeholder="Buscar (ex.: agachamento, alongamento)" value={query} onChange={(event) => setQuery(event.target.value)} />
        <div className="segmented" role="group" aria-label="Tipo">
          {[["", "Todos"], ...Object.entries(TYPES)].map(([key, label]) => (
            <button key={key || "todos"} type="button" aria-pressed={type === key} onClick={() => setType(key)}>
              {label}
            </button>
          ))}
        </div>
        <select name="group" value={group} onChange={(event) => setGroup(event.target.value)} aria-label="Grupo muscular">
          <option value="">Todos os grupos</option>
          {Object.entries(GROUPS).map(([key, label]) => (
            <option key={key} value={key}>
              {label}
            </option>
          ))}
        </select>
        <select name="equipment" value={equipment} onChange={(event) => setEquipment(event.target.value)} aria-label="Equipamento">
          <option value="">Qualquer equipamento</option>
          {Object.entries(EQUIPMENT).map(([key, label]) => (
            <option key={key} value={key}>
              {label}
            </option>
          ))}
        </select>
      </div>

      <p className="muted results-count" role="status">
        {results.length} {results.length === 1 ? "exercício" : "exercícios"}
      </p>
      {results.length === 0 ? <div className="empty">Nenhum exercício com esses filtros.</div> : <ExerciseGrid exercises={results} />}

      <section className="card catalog">
        <h2>Catálogo completo</h2>
        <p className="muted">Mais de 800 exercícios do Free Exercise DB, com nomes e instruções em inglês.</p>
        {catalog.status === "idle" && (
          <button type="button" className="btn btn-ghost" onClick={openCatalog}>
            Carregar catálogo completo
          </button>
        )}
        {catalog.status === "loading" && <p className="status-msg">Carregando catálogo…</p>}
        {catalog.status === "error" && (
          <p className="form-error" role="alert">
            {catalog.error}{" "}
            <button type="button" className="btn btn-ghost btn-sm" onClick={openCatalog}>
              Tentar de novo
            </button>
          </p>
        )}
        {catalog.status === "ready" &&
          (query.trim().length < 2 ? (
            <p className="status-msg">{catalog.list.length} exercícios carregados. Digite na busca acima (em inglês, ex.: “squat”, “stretch”).</p>
          ) : catalogResults.length === 0 ? (
            <p className="status-msg">Nada no catálogo para “{query}”.</p>
          ) : (
            <ExerciseGrid exercises={catalogResults} />
          ))}
      </section>
    </>
  );
}
