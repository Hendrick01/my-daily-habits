import { useContext } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { HabitsContext } from "../context/HabitsContext";

export default function HabitDetailsPage() {
  const context = useContext(HabitsContext);

  if (!context) {
    throw new Error("O componente HabitDetailsPage precisa estar dentro de um HabitsProvider.");
  }

  const { habits } = context;
  const { habitId } = useParams();
  const navigate = useNavigate();

  // Array.prototype.find() devolve o primeiro elemento que satisfaz a condição (ou undefined)
  const habit = habits.find((h) => h.id === habitId);

  if (!habit) {
    return (
      <div>
        <h2>Hábito não encontrado</h2>
        <Link to="/habitos">Voltar à lista</Link>
      </div>
    );
  }

  return (
    <div>
      <h2>{habit.title}</h2>
      <p>Meta: {habit.goal}</p>
      <p>Status: {habit.completed ? "Concluído" : "Pendente"}</p>
      {/* navigate(-1) volta uma entrada no histórico do navegador */}
      <button type="button" onClick={() => navigate(-1)}>
        Voltar
      </button>
    </div>
  );
}
