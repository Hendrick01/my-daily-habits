import { NavLink, Outlet } from "react-router-dom";

export default function AppLayout() {
  return (
    <main className="app">
      <header className="hero">
        <p className="eyebrow">MY DAILY HABITS — painel do Hendrick</p>
        <h1>Pequenos hábitos, progresso visível.</h1>
      </header>

      <nav className="main-nav">
        <ul>
          <li><NavLink to="/" end>Hoje</NavLink></li>
          <li><NavLink to="/novo">Novo hábito</NavLink></li>
          <li><NavLink to="/habitos">Hábitos</NavLink></li>
          <li><NavLink to="/progresso">Progresso</NavLink></li>
          <li><NavLink to="/sugestoes">Sugestões</NavLink></li>
          <li><NavLink to="/sobre">Sobre</NavLink></li>
        </ul>
      </nav>
      
      <Outlet />
    </main>
  );
}
