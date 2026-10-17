import { NavLink, Outlet } from "react-router-dom";

export default function AppLayout() {
  return (
    <div className="app-layout">
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
      
      {/* O Outlet é onde as páginas renderizam o seu conteúdo */}
      <Outlet />
    </div>
  );
}
