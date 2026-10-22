import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useTraining } from "../../context/useTraining";
import ExerciseDemo from "../../components/ExerciseDemo";
import { EQUIPMENT, GROUPS, TYPES } from "../../data/exercises";
import { LEVELS, RESTRICTIONS, videoUrlFor } from "../../utils/training";
import { loadCatalog } from "../../services/catalog";

function useExercise(exerciseId) {
  const { findExercise } = useTraining();
  const fromCatalog = exerciseId.startsWith("catalogo-");
  const [catalogState, setCatalogState] = useState({ exerciseId: null, exercise: null, error: "" });

  useEffect(() => {
    if (!fromCatalog) return;
    let active = true;
    loadCatalog()
      .then((list) => active && setCatalogState({ exerciseId, exercise: list.find((e) => e.id === exerciseId) ?? null, error: "" }))
      .catch((error) => active && setCatalogState({ exerciseId, exercise: null, error: error.message }));
    return () => {
      active = false;
    };
  }, [exerciseId, fromCatalog]);

  if (!fromCatalog) return { exercise: findExercise(exerciseId) ?? null, loading: false, error: "" };
  const loaded = catalogState.exerciseId === exerciseId;
  return { exercise: loaded ? catalogState.exercise : null, loading: !loaded, error: loaded ? catalogState.error : "" };
}

function AddToWorkout({ exercise }) {
  const { workouts, addItem, addWorkout } = useTraining();
  const navigate = useNavigate();
  const [target, setTarget] = useState(workouts[0]?.id ?? "");
  const [done, setDone] = useState("");

  if (workouts.length === 0) {
    return (
      <button
        type="button"
        className="btn btn-primary"
        onClick={() => {
          const id = addWorkout();
          addItem(id, exercise);
          navigate(`/treino/${id}`);
        }}
      >
        Criar treino com este exercício
      </button>
    );
  }

  return (
    <div className="add-to-workout">
      <label className="sr-only" htmlFor="target-workout">
        Treino
      </label>
      <select id="target-workout" value={target} onChange={(event) => setTarget(event.target.value)}>
        {workouts.map((workout) => (
          <option key={workout.id} value={workout.id}>
            {workout.name}
            {workout.focus ? ` — ${workout.focus}` : ""}
          </option>
        ))}
      </select>
      <button
        type="button"
        className="btn btn-primary"
        onClick={() => {
          addItem(target, exercise);
          setDone(workouts.find((workout) => workout.id === target)?.name ?? "treino");
        }}
      >
        + Adicionar ao treino
      </button>
      {done && (
        <p className="status-msg" role="status">
          Adicionado ao {done} ✓ <Link to={`/treino/${target}`}>Abrir treino</Link>
        </p>
      )}
    </div>
  );
}

export default function ExercisePage() {
  const { exerciseId } = useParams();
  const { removeCustomExercise } = useTraining();
  const navigate = useNavigate();
  const { exercise, loading, error } = useExercise(exerciseId);
  const [confirmingDelete, setConfirmingDelete] = useState(false);

  if (loading) return <p className="status-msg">Carregando exercício…</p>;
  if (!exercise) {
    return (
      <div className="empty">
        <h2>Exercício não encontrado</h2>
        {error && <p>{error}</p>}
        <Link to="/treino/exercicios">Voltar aos exercícios</Link>
      </div>
    );
  }

  const tags = [
    GROUPS[exercise.group],
    EQUIPMENT[exercise.equipment] ?? exercise.equipmentLabel,
    TYPES[exercise.type],
    exercise.custom ? null : LEVELS[exercise.level],
  ].filter(Boolean);

  return (
    <>
      <p className="breadcrumb">
        <Link to="/treino/exercicios">← Exercícios</Link>
      </p>

      <article className="card exercise-detail">
        <ExerciseDemo image={exercise.image} name={exercise.name} />
        <div className="exercise-body">
          <h1>{exercise.name}</h1>
          <div className="tags">
            {tags.map((tag) => (
              <span key={tag} className="schedule-tag">
                {tag}
              </span>
            ))}
          </div>
          {exercise.muscles?.length > 0 && <p className="muted">Músculos: {exercise.muscles.join(", ")}</p>}

          {exercise.steps?.length > 0 && (
            <>
              <h2>Como fazer{exercise.english ? " (instruções em inglês)" : ""}</h2>
              <ol className="steps">
                {exercise.steps.map((step) => (
                  <li key={step}>{step}</li>
                ))}
              </ol>
            </>
          )}
          {exercise.tip && <p className="tip">💡 {exercise.tip}</p>}
          {exercise.cautions?.length > 0 && (
            <p className="muted">Exige mais de: {exercise.cautions.map((caution) => RESTRICTIONS[caution].toLowerCase()).join(", ")}.</p>
          )}

          <div className="actions">
            <a className="btn btn-ghost" href={videoUrlFor(exercise)} target="_blank" rel="noopener noreferrer">
              ▶️ Ver vídeo
            </a>
            {exercise.custom && (
              <button
                type="button"
                className={`btn btn-danger${confirmingDelete ? " is-confirming" : ""}`}
                onBlur={() => setConfirmingDelete(false)}
                onClick={() => {
                  if (!confirmingDelete) return setConfirmingDelete(true);
                  removeCustomExercise(exercise.id);
                  navigate("/treino/exercicios", { replace: true });
                }}
              >
                {confirmingDelete ? "Confirmar exclusão" : "Excluir exercício"}
              </button>
            )}
          </div>

          <h2>Adicionar a um treino</h2>
          <AddToWorkout exercise={exercise} />
        </div>
      </article>
      {exercise.image && (
        <p className="muted small-print">
          Imagens: <a href="https://github.com/yuhonas/free-exercise-db">Free Exercise DB</a> (domínio público).
        </p>
      )}
    </>
  );
}
