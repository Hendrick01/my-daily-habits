import { useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useTraining } from "../../context/useTraining";
import ExerciseDemo from "../../components/ExerciseDemo";
import ExercisePicker from "../../components/ExercisePicker";
import { GROUPS } from "../../data/exercises";

export default function WorkoutPage() {
  const { workoutId } = useParams();
  const navigate = useNavigate();
  const { workouts, updateWorkout, removeWorkout, addItem, updateItem, removeItem, moveItem } = useTraining();
  const [picking, setPicking] = useState(false);
  const [confirmingDelete, setConfirmingDelete] = useState(false);

  const workout = workouts.find((item) => item.id === workoutId);

  if (!workout) {
    return (
      <div className="empty">
        <h2>Treino não encontrado</h2>
        <Link to="/treino">Voltar aos treinos</Link>
      </div>
    );
  }

  function handleDelete() {
    if (!confirmingDelete) {
      setConfirmingDelete(true);
      return;
    }
    removeWorkout(workout.id);
    navigate("/treino", { replace: true });
  }

  const field = (item, key, type = "text") => ({
    type,
    value: item[key] ?? "",
    onChange: (event) => updateItem(workout.id, item.id, { [key]: type === "number" ? Number(event.target.value) || "" : event.target.value }),
  });

  return (
    <>
      <p className="breadcrumb">
        <Link to="/treino">← Treinos</Link>
      </p>

      <section className="card workout-head">
        <label className="sr-only" htmlFor="workout-name">
          Nome do treino
        </label>
        <input id="workout-name" className="title-input" value={workout.name} maxLength={40} onChange={(event) => updateWorkout(workout.id, { name: event.target.value })} />
        <label className="field">
          Foco
          <input type="text" name="focus" maxLength={60} placeholder="Ex.: Peito e tríceps" value={workout.focus} onChange={(event) => updateWorkout(workout.id, { focus: event.target.value })} />
        </label>
        <label className="field">
          Observações do treino
          <input type="text" name="workout-notes" maxLength={160} value={workout.notes ?? ""} onChange={(event) => updateWorkout(workout.id, { notes: event.target.value })} />
        </label>
      </section>

      {workout.items.length === 0 ? (
        <div className="empty">
          <p>Nenhum exercício neste treino ainda.</p>
        </div>
      ) : (
        <ol className="workout-items">
          {workout.items.map((item, index) => (
            <li key={item.id} className="card workout-item">
              <div className="item-head">
                <span className="item-number">{index + 1}</span>
                <ExerciseDemo image={item.image} name={item.name} size="small" />
                <div className="item-title">
                  <Link to={`/treino/exercicios/${item.exerciseId}`}>{item.name}</Link>
                  <span className="muted">{GROUPS[item.group] ?? ""}</span>
                </div>
                <div className="item-actions">
                  <button type="button" aria-label={`Subir ${item.name}`} disabled={index === 0} onClick={() => moveItem(workout.id, item.id, -1)}>
                    ↑
                  </button>
                  <button type="button" aria-label={`Descer ${item.name}`} disabled={index === workout.items.length - 1} onClick={() => moveItem(workout.id, item.id, 1)}>
                    ↓
                  </button>
                  <button type="button" aria-label={`Remover ${item.name}`} onClick={() => removeItem(workout.id, item.id)}>
                    ✕
                  </button>
                </div>
              </div>
              <div className="item-fields">
                <label>
                  Séries
                  <input name="sets" min={1} max={20} inputMode="numeric" {...field(item, "sets", "number")} />
                </label>
                <label>
                  Repetições
                  <input name="reps" maxLength={20} {...field(item, "reps")} />
                </label>
                <label>
                  Carga (kg)
                  <input name="load" maxLength={10} inputMode="decimal" {...field(item, "load")} />
                </label>
                <label>
                  Descanso (s)
                  <input name="rest" min={0} max={600} inputMode="numeric" {...field(item, "rest", "number")} />
                </label>
                <label className="item-notes">
                  Observações
                  <input name="notes" maxLength={120} {...field(item, "notes")} />
                </label>
              </div>
            </li>
          ))}
        </ol>
      )}

      {picking ? (
        <ExercisePicker workoutId={workout.id} onPick={(exercise) => addItem(workout.id, exercise)} />
      ) : null}

      <div className="actions">
        <button type="button" className="btn btn-primary" onClick={() => setPicking((open) => !open)}>
          {picking ? "Fechar lista" : "+ Adicionar exercício"}
        </button>
        <button
          type="button"
          className={`btn btn-danger${confirmingDelete ? " is-confirming" : ""}`}
          onClick={handleDelete}
          onBlur={() => setConfirmingDelete(false)}
        >
          {confirmingDelete ? "Confirmar exclusão" : "Excluir treino"}
        </button>
      </div>
    </>
  );
}
