import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useTraining } from "../../context/useTraining";
import { useHabits } from "../../context/useHabits";
import { GROUPS } from "../../data/exercises";
import { GOALS, LEVELS, PLACES, STYLES, RESTRICTIONS, bmi, bmiCategory, waistToHeight, needsMedicalClearance, planToCsv } from "../../utils/training";
import { toDateKey } from "../../utils/dates";
import { downloadFile } from "../../utils/download";

const number = (value) => String(value).replace(".", ",");

function ProfileCard({ profile }) {
  const bmiValue = bmi(profile.weight, profile.height);
  const ratio = waistToHeight(profile.waist, profile.height);
  const toTarget = profile.targetWeight ? Math.round((profile.weight - profile.targetWeight) * 10) / 10 : null;

  return (
    <section className="card profile-card">
      <div className="profile-stats">
        <div className="stat">
          <strong>{bmiValue == null ? "—" : number(bmiValue)}</strong>
          <span>IMC · {bmiCategory(bmiValue) ?? "sem dados"}</span>
        </div>
        {ratio != null && (
          <div className="stat">
            <strong>{number(ratio)}</strong>
            <span>cintura/altura · {ratio < 0.5 ? "adequada" : "acima de 0,5"}</span>
          </div>
        )}
        <div className="stat">
          <strong>
            {number(profile.weight)} <small>kg</small>
          </strong>
          <span>
            {profile.height} cm · {profile.age} anos
          </span>
        </div>
      </div>

      <dl className="profile-list">
        <div>
          <dt>Objetivo</dt>
          <dd>{GOALS[profile.goal]}</dd>
        </div>
        {(profile.target || toTarget) && (
          <div>
            <dt>Meta</dt>
            <dd>
              {profile.target}
              {toTarget ? `${profile.target ? " · " : ""}${toTarget > 0 ? `faltam ${number(toTarget)} kg` : `ganhar ${number(-toTarget)} kg`} até ${number(profile.targetWeight)} kg` : ""}
            </dd>
          </div>
        )}
        <div>
          <dt>Treino</dt>
          <dd>
            {STYLES[profile.style]} · {profile.days}x por semana · {profile.minutes} min · {LEVELS[profile.level]}
          </dd>
        </div>
        <div>
          <dt>Local</dt>
          <dd>{PLACES[profile.place]}</dd>
        </div>
        {profile.restrictions?.length > 0 && (
          <div>
            <dt>Cuidados</dt>
            <dd>{profile.restrictions.map((r) => RESTRICTIONS[r]).join(", ")}</dd>
          </div>
        )}
      </dl>
      <p className="muted small-print">O IMC é uma referência: não diferencia músculo de gordura.</p>
    </section>
  );
}

function PrintablePlan({ workouts }) {
  return (
    <div className="print-only">
      {workouts.map((workout) => (
        <section key={workout.id} className="print-workout">
          <h2>
            {workout.name} — {workout.focus}
          </h2>
          <table>
            <thead>
              <tr>
                <th>#</th>
                <th>Exercício</th>
                <th>Séries</th>
                <th>Repetições</th>
                <th>Carga</th>
                <th>Descanso</th>
                <th>Obs.</th>
              </tr>
            </thead>
            <tbody>
              {workout.items.map((item, index) => (
                <tr key={item.id}>
                  <td>{index + 1}</td>
                  <td>{item.name}</td>
                  <td>{item.sets}</td>
                  <td>{item.reps}</td>
                  <td>{item.load && `${item.load} kg`}</td>
                  <td>{item.rest}s</td>
                  <td>{item.notes}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
      ))}
    </div>
  );
}

export default function TrainingPage() {
  const { profile, workouts, addWorkout } = useTraining();
  const { habits, addHabit } = useHabits();
  const navigate = useNavigate();
  const [message, setMessage] = useState("");
  const hasTrainingHabit = habits.some((habit) => habit.title.toLowerCase() === "treinar");

  function exportSheet() {
    downloadFile(planToCsv({ profile, workouts }), `treino-${toDateKey()}.csv`, "text/csv;charset=utf-8");
    setMessage("Planilha baixada. Abra no Excel ou no Google Planilhas.");
  }

  function createHabit() {
    const days = Math.min(profile?.days ?? 3, 6);
    addHabit("Treinar", `${days}x por semana`, "💪", { type: "weekly", times: days });
    setMessage(`Hábito "Treinar" criado: ${days}x por semana.`);
  }

  function newWorkout() {
    navigate(`/treino/${addWorkout()}`);
  }

  if (!profile && workouts.length === 0) {
    return (
      <>
        <header className="page-head">
          <h1>Treino</h1>
          <p>Monte seus treinos com exercícios demonstrados, séries e repetições.</p>
        </header>
        <section className="card training-start">
          <h2>Comece pela avaliação</h2>
          <p className="muted">
            Medidas, IMC, objetivo, meta e o tipo de treino que você prefere. Com isso, o app monta um plano para você — e você ajusta como quiser.
          </p>
          <div className="actions">
            <Link to="/treino/avaliacao" className="btn btn-primary">
              Fazer avaliação
            </Link>
            <button type="button" className="btn btn-ghost" onClick={newWorkout}>
              Montar do zero
            </button>
            <Link to="/treino/exercicios" className="btn btn-ghost">
              Ver exercícios
            </Link>
          </div>
        </section>
      </>
    );
  }

  return (
    <>
      <header className="page-head no-print">
        <h1>Treino</h1>
        <p>Seu plano, sua avaliação e a biblioteca de exercícios.</p>
      </header>

      {profile && needsMedicalClearance(profile) && (
        <p className="notice is-warning no-print" role="alert">
          ⚠️ Pela sua avaliação, converse com um médico antes de começar a treinar. Comece leve e pare se sentir dor no peito, tontura ou falta de ar.
        </p>
      )}
      {profile && profile.age < 18 && (
        <p className="notice no-print">Para menores de 18 anos, treine com acompanhamento de um profissional de educação física.</p>
      )}

      {profile ? (
        <div className="no-print">
          <ProfileCard profile={profile} />
          <div className="actions">
            <Link to="/treino/avaliacao" className="btn btn-ghost">
              Refazer avaliação
            </Link>
            <Link to="/treino/exercicios" className="btn btn-ghost">
              Biblioteca de exercícios
            </Link>
          </div>
        </div>
      ) : (
        <p className="notice no-print">
          <Link to="/treino/avaliacao">Faça a avaliação</Link> para receber um plano montado para o seu objetivo.
        </p>
      )}

      <section className="panel no-print">
        <header className="panel-header">
          <h2>Meus treinos</h2>
        </header>
        {workouts.length === 0 ? (
          <div className="empty">
            <p>Nenhum treino ainda.</p>
          </div>
        ) : (
          <ul className="workout-list">
            {workouts.map((workout) => (
              <li key={workout.id}>
                <Link to={`/treino/${workout.id}`} className="workout-card">
                  <span className="workout-letter" aria-hidden="true">
                    {workout.name.replace(/^(Treino|Rotina) /, "").slice(0, 2)}
                  </span>
                  <span className="workout-info">
                    <strong>{workout.name}</strong>
                    <span className="muted">
                      {workout.focus || "Sem foco definido"} · {workout.items.length} {workout.items.length === 1 ? "exercício" : "exercícios"}
                    </span>
                    {!workout.focus && workout.items.length > 0 && (
                      <span className="workout-groups">
                        {[...new Set(workout.items.map((item) => GROUPS[item.group]).filter(Boolean))].slice(0, 4).join(" · ")}
                      </span>
                    )}
                  </span>
                  <span aria-hidden="true">›</span>
                </Link>
              </li>
            ))}
          </ul>
        )}
        <div className="actions">
          <button type="button" className="btn btn-ghost" onClick={newWorkout}>
            + Novo treino
          </button>
        </div>
      </section>

      {workouts.length > 0 && (
        <section className="card no-print">
          <h2>Levar o treino com você</h2>
          <div className="actions">
            <button type="button" className="btn btn-primary" onClick={exportSheet}>
              ⬇️ Exportar planilha
            </button>
            <button type="button" className="btn btn-ghost" onClick={() => window.print()}>
              🖨️ Imprimir ou salvar PDF
            </button>
            <button type="button" className="btn btn-ghost" onClick={createHabit} disabled={hasTrainingHabit}>
              {hasTrainingHabit ? "Hábito “Treinar” já existe ✓" : "💪 Criar hábito “Treinar”"}
            </button>
          </div>
          {message && (
            <p className="status-msg" role="status">
              {message}
            </p>
          )}
        </section>
      )}

      <PrintablePlan workouts={workouts} />
    </>
  );
}
