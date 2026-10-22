import { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { useTraining } from "../../context/useTraining";
import { EQUIPMENT, GROUPS, TYPES } from "../../data/exercises";

export default function CustomExercisePage() {
  const { addCustomExercise, addItem, workouts } = useTraining();
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const targetWorkout = workouts.find((workout) => workout.id === params.get("treino"));
  const [form, setForm] = useState({ name: "", group: "peito", type: "forca", equipment: "peso-corporal", unit: "reps", steps: "", videoUrl: "" });
  const [error, setError] = useState("");

  const input = (field) => ({ value: form[field], onChange: (event) => setForm((current) => ({ ...current, [field]: event.target.value })) });

  function handleSubmit(event) {
    event.preventDefault();
    if (form.name.trim() === "") return setError("Dê um nome ao exercício.");
    if (form.videoUrl && !/^https:\/\/\S+$/.test(form.videoUrl.trim())) return setError("O link do vídeo precisa começar com https://");

    const exercise = addCustomExercise({
      name: form.name.trim(),
      group: form.group,
      type: form.type,
      equipment: form.equipment,
      unit: form.type === "alongamento" ? "seg" : form.unit,
      image: null,
      steps: form.steps.split("\n").map((step) => step.trim()).filter(Boolean),
      tip: "",
      videoUrl: form.videoUrl.trim() || undefined,
    });

    if (targetWorkout) {
      addItem(targetWorkout.id, exercise);
      navigate(`/treino/${targetWorkout.id}`);
    } else {
      navigate(`/treino/exercicios/${exercise.id}`);
    }
  }

  return (
    <>
      <p className="breadcrumb">
        <Link to={targetWorkout ? `/treino/${targetWorkout.id}` : "/treino/exercicios"}>← Voltar</Link>
      </p>
      <header className="page-head">
        <h1>Novo exercício</h1>
        <p>{targetWorkout ? `Ele será adicionado ao ${targetWorkout.name}.` : "Ele entra na sua biblioteca, junto com os outros."}</p>
      </header>

      <form className="form" onSubmit={handleSubmit} noValidate>
        <label className="field">
          Nome
          <input type="text" name="name" maxLength={60} placeholder="Ex.: Remada no TRX" {...input("name")} />
        </label>
        <div className="field-row">
          <label className="field">
            Grupo muscular
            <select name="group" {...input("group")}>
              {Object.entries(GROUPS).map(([key, label]) => (
                <option key={key} value={key}>
                  {label}
                </option>
              ))}
            </select>
          </label>
          <label className="field">
            Tipo
            <select name="type" {...input("type")}>
              {Object.entries(TYPES).map(([key, label]) => (
                <option key={key} value={key}>
                  {label}
                </option>
              ))}
            </select>
          </label>
          <label className="field">
            Equipamento
            <select name="equipment" {...input("equipment")}>
              {Object.entries(EQUIPMENT).map(([key, label]) => (
                <option key={key} value={key}>
                  {label}
                </option>
              ))}
            </select>
          </label>
          {form.type !== "alongamento" && (
            <label className="field">
              Medido em
              <select name="unit" {...input("unit")}>
                <option value="reps">Repetições</option>
                <option value="seg">Segundos</option>
              </select>
            </label>
          )}
        </div>
        <label className="field">
          Como fazer (opcional, um passo por linha)
          <textarea name="steps" rows={4} maxLength={800} {...input("steps")} />
        </label>
        <label className="field">
          Link de um vídeo (opcional)
          <input type="url" name="videoUrl" placeholder="https://…" maxLength={300} {...input("videoUrl")} />
        </label>
        <p className="field-hint">Sem link, o botão “Ver vídeo” abre uma busca no YouTube pelo nome do exercício.</p>

        {error && (
          <p className="form-error" role="alert">
            {error}
          </p>
        )}
        <div className="form-actions">
          <button type="submit" className="btn btn-primary">
            {targetWorkout ? "Criar e adicionar ao treino" : "Criar exercício"}
          </button>
        </div>
      </form>
    </>
  );
}
