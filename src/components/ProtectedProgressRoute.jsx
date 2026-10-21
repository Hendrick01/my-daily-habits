import { Navigate } from "react-router-dom";
import { useHabits } from "../context/useHabits";

export default function ProtectedProgressRoute({ children }) {
  const { habits } = useHabits();

  if (habits.length === 0) {
    return <Navigate to="/novo" replace />;
  }

  return children;
}
