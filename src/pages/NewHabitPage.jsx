import { useNavigate } from "react-router-dom";
import { useHabits } from "../context/useHabits";
import HabitForm from "../components/HabitForm";

const ideas = [
  { title: "Ler", goal: "10 páginas" },
  { title: "Meditar", goal: "5 minutos" },
  { title: "Alongar", goal: "10 minutos" },
  { title: "Dormir cedo", goal: "Antes das 23h" },
  { title: "Comer uma fruta", goal: "1 por dia" },
  { title: "Desligar o celular", goal: "1 hora antes de dormir" },
];

export default function NewHabitPage() {
  const { habits, addHabit } = useHabits();
  const navigate = useNavigate();

  function handleAddHabit(title, goal) {
    addHabit(title, goal);
    navigate("/");
  }

  const existing = new Set(habits.map((habit) => habit.title.toLowerCase()));
  const availableIdeas = ideas.filter((idea) => !existing.has(idea.title.toLowerCase()));

  return (
    <>
      <header className="page-head">
        <h1>Novo hábito</h1>
        <p>Comece pequeno: um hábito simples, uma meta clara.</p>
      </header>

      <HabitForm onSave={handleAddHabit} />

      {availableIdeas.length > 0 && (
        <section className="ideas">
          <h2>Sem ideias? Toque para adicionar</h2>
          <div className="chips">
            {availableIdeas.map((idea) => (
              <button key={idea.title} type="button" className="chip" onClick={() => handleAddHabit(idea.title, idea.goal)}>
                + {idea.title} · {idea.goal}
              </button>
            ))}
          </div>
        </section>
      )}
    </>
  );
}
