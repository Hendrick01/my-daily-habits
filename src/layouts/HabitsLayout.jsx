import { Outlet } from "react-router-dom";

export default function HabitsLayout() {
  return (
    <div className="habits-layout">
      <h2>Meus Hábitos</h2>
      <Outlet />
    </div>
  );
}
