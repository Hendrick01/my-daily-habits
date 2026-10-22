import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTraining } from "../../context/useTraining";
import { GOALS, LEVELS, PLACES, STYLES, RESTRICTIONS, PARQ_QUESTIONS, bmi, bmiCategory } from "../../utils/training";

const DEFAULTS = {
  age: "",
  sex: "",
  weight: "",
  height: "",
  waist: "",
  goal: "saude",
  target: "",
  targetWeight: "",
  level: 1,
  days: 3,
  minutes: 45,
  place: "academia",
  style: "focado",
  restrictions: [],
  parq: PARQ_QUESTIONS.map(() => false),
};

const STYLE_HINTS = {
  focado: "Cada dia um grupo (ex.: peito e tríceps; costas e bíceps; pernas).",
  hibrido: "Todo treino trabalha o corpo inteiro — ótimo para pouco tempo ou poucos dias.",
  alongamento: "Rotinas de flexibilidade e mobilidade, sem carga.",
};

function Options({ name, options, value, onChange }) {
  return (
    <div className="option-grid">
      {Object.entries(options).map(([key, label]) => (
        <label key={key} className="option-card">
          <input type="radio" name={name} className="sr-only" checked={String(value) === String(key)} onChange={() => onChange(key)} />
          {label}
        </label>
      ))}
    </div>
  );
}

export default function AssessmentPage() {
  const { profile, workouts, saveProfile } = useTraining();
  const navigate = useNavigate();
  const [form, setForm] = useState(() => (profile ? { ...DEFAULTS, ...profile } : DEFAULTS));
  const [error, setError] = useState("");

  const set = (field) => (value) => setForm((current) => ({ ...current, [field]: value }));
  const input = (field) => ({ value: form[field] ?? "", onChange: (event) => set(field)(event.target.value) });
  const preview = bmi(Number(form.weight), Number(form.height));

  function toggleRestriction(key) {
    setForm((current) => ({
      ...current,
      restrictions: current.restrictions.includes(key) ? current.restrictions.filter((r) => r !== key) : [...current.restrictions, key],
    }));
  }

  function answerParq(index, yes) {
    setForm((current) => ({ ...current, parq: current.parq.map((answer, i) => (i === index ? yes : answer)) }));
  }

  function save(regenerate) {
    const age = Number(form.age);
    const weight = Number(String(form.weight).replace(",", "."));
    const height = Number(form.height);
    if (!(age >= 10 && age <= 100)) return setError("Informe uma idade entre 10 e 100 anos.");
    if (!(weight >= 25 && weight <= 300)) return setError("Informe o peso em kg (entre 25 e 300).");
    if (!(height >= 100 && height <= 230)) return setError("Informe a altura em centímetros (entre 100 e 230).");

    const toNumber = (value) => (value === "" || value == null ? null : Number(String(value).replace(",", ".")) || null);
    saveProfile(
      {
        ...form,
        age,
        weight,
        height,
        waist: toNumber(form.waist),
        targetWeight: toNumber(form.targetWeight),
        level: Number(form.level),
        days: Number(form.days),
        minutes: Number(form.minutes),
        target: form.target.trim(),
      },
      { regenerate },
    );
    navigate("/treino");
  }

  return (
    <>
      <header className="page-head">
        <h1>Avaliação</h1>
        <p>Leva uns 2 minutos. Com ela, o app monta um plano para o seu objetivo.</p>
      </header>

      <form className="form assessment" onSubmit={(event) => (event.preventDefault(), save(workouts.length === 0))} noValidate>
        <fieldset className="plain-fieldset">
          <legend>Medidas</legend>
          <div className="field-row">
            <label className="field">
              Idade
              <input type="number" name="age" inputMode="numeric" min={10} max={100} {...input("age")} />
            </label>
            <label className="field">
              Peso (kg)
              <input type="number" name="weight" inputMode="decimal" step="0.1" {...input("weight")} />
            </label>
            <label className="field">
              Altura (cm)
              <input type="number" name="height" inputMode="numeric" {...input("height")} />
            </label>
            <label className="field">
              Cintura (cm, opcional)
              <input type="number" name="waist" inputMode="numeric" {...input("waist")} />
            </label>
          </div>
          <label className="field field-inline">
            Sexo (opcional)
            <select name="sex" {...input("sex")}>
              <option value="">Prefiro não informar</option>
              <option value="feminino">Feminino</option>
              <option value="masculino">Masculino</option>
            </select>
          </label>
          {preview != null && (
            <p className="bmi-preview" role="status">
              IMC: <strong>{String(preview).replace(".", ",")}</strong> · {bmiCategory(preview)}
            </p>
          )}
        </fieldset>

        <fieldset className="plain-fieldset">
          <legend>Objetivo</legend>
          <Options name="goal" options={GOALS} value={form.goal} onChange={set("goal")} />
          <div className="field-row">
            <label className="field">
              Sua meta (opcional)
              <input type="text" name="target" maxLength={80} placeholder="Ex.: correr 5 km, voltar a treinar" {...input("target")} />
            </label>
            <label className="field">
              Peso desejado (kg, opcional)
              <input type="number" name="targetWeight" inputMode="decimal" step="0.1" {...input("targetWeight")} />
            </label>
          </div>
        </fieldset>

        <fieldset className="plain-fieldset">
          <legend>Tipo de treino</legend>
          <Options name="style" options={STYLES} value={form.style} onChange={set("style")} />
          <p className="field-hint">{STYLE_HINTS[form.style]}</p>
        </fieldset>

        <fieldset className="plain-fieldset">
          <legend>Rotina</legend>
          <div className="field-row">
            <label className="field">
              Nível
              <select name="level" {...input("level")}>
                {Object.entries(LEVELS).map(([key, label]) => (
                  <option key={key} value={key}>
                    {label}
                  </option>
                ))}
              </select>
            </label>
            <label className="field">
              Treinos por semana
              <select name="days" {...input("days")}>
                {[2, 3, 4, 5, 6].map((days) => (
                  <option key={days} value={days}>
                    {days}x
                  </option>
                ))}
              </select>
            </label>
            <label className="field">
              Tempo por treino
              <select name="minutes" {...input("minutes")}>
                {[20, 30, 45, 60, 75, 90].map((minutes) => (
                  <option key={minutes} value={minutes}>
                    {minutes} min
                  </option>
                ))}
              </select>
            </label>
          </div>
          <span className="field-label">Onde você vai treinar?</span>
          <Options name="place" options={PLACES} value={form.place} onChange={set("place")} />
        </fieldset>

        <fieldset className="plain-fieldset">
          <legend>Cuidados</legend>
          <p className="field-hint">Marque onde você sente dor ou tem lesão. O plano evita exercícios que forçam essas partes.</p>
          <div className="chips">
            {Object.entries(RESTRICTIONS).map(([key, label]) => (
              <label key={key} className="day-option">
                <input type="checkbox" className="sr-only" checked={form.restrictions.includes(key)} onChange={() => toggleRestriction(key)} />
                {label}
              </label>
            ))}
          </div>
        </fieldset>

        <fieldset className="plain-fieldset">
          <legend>Prontidão para atividade física (PAR-Q)</legend>
          <ol className="parq">
            {PARQ_QUESTIONS.map((question, index) => (
              <li key={question}>
                <span>{question}</span>
                <div className="segmented">
                  <label>
                    <input type="radio" name={`parq-${index}`} className="sr-only" checked={!form.parq[index]} onChange={() => answerParq(index, false)} />
                    Não
                  </label>
                  <label>
                    <input type="radio" name={`parq-${index}`} className="sr-only" checked={form.parq[index]} onChange={() => answerParq(index, true)} />
                    Sim
                  </label>
                </div>
              </li>
            ))}
          </ol>
          {form.parq.some(Boolean) && (
            <p className="notice is-warning" role="alert">
              Com alguma resposta “sim”, converse com um médico antes de começar. O plano será montado, mas comece leve.
            </p>
          )}
        </fieldset>

        {error && (
          <p className="form-error" role="alert">
            {error}
          </p>
        )}

        <div className="form-actions">
          {workouts.length === 0 ? (
            <button type="submit" className="btn btn-primary">
              Salvar e montar meu plano
            </button>
          ) : (
            <>
              <button type="button" className="btn btn-primary" onClick={() => save(true)}>
                Salvar e gerar novo plano
              </button>
              <button type="button" className="btn btn-ghost" onClick={() => save(false)}>
                Só salvar a avaliação
              </button>
            </>
          )}
        </div>
        {workouts.length > 0 && <p className="field-hint">“Gerar novo plano” substitui os treinos atuais.</p>}
      </form>
    </>
  );
}
