import { useContext } from "react";
import { useNavigate } from "react-router-dom";
import { HabitsContext } from "../context/HabitsContext";
import HabitForm from "../components/HabitForm";

export default function NewHabitPage() {
  const context = useContext(HabitsContext);

  if (!context) {
    throw new Error("O componente NewHabitPage precisa estar dentro de um HabitsProvider.");
  }

  const { addHabit } = context;
  const navigate = useNavigate();

  function handleAddHabit(title, goal) {
    addHabit(title, goal);
    navigate("/");
  }

  return (
    <div>
      <h2>Cadastrar novo hábito</h2>
      <HabitForm onAddHabit={handleAddHabit} />
    </div>
  );
}
