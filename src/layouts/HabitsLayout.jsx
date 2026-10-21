import { Outlet } from "react-router-dom";

export default function HabitsLayout() {
  return (
    <section className="habits-layout">
      <header className="page-head">
        <h1>Meus hábitos</h1>
        <p>Acompanhe cada hábito e veja o histórico dos últimos dias.</p>
      </header>
      <Outlet />
    </section>
  );
}
