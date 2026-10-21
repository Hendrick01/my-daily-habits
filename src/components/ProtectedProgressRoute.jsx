import { useContext } from "react";
import { Navigate } from "react-router-dom";
import { HabitsContext } from "../context/HabitsContext";

export default function ProtectedProgressRoute({ children }) {
  const context = useContext(HabitsContext);

  if (!context) {
    throw new Error("O componente ProtectedProgressRoute precisa estar dentro de um HabitsProvider.");
  }

  const { habits } = context;

  if (habits.length === 0) {
    return <Navigate to="/novo" replace />;
  }

  return children;
}
