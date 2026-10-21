import { useState, useEffect } from "react";
import { Link, NavLink, Outlet } from "react-router-dom";
import { useHabits } from "../context/useHabits";

const THEME_KEY = "my-daily-habits:theme";

const links = [
  ["/", "Hoje"],
  ["/novo", "Novo hábito"],
  ["/habitos", "Hábitos"],
  ["/progresso", "Progresso"],
  ["/sugestoes", "Sugestões"],
  ["/sobre", "Sobre"],
];

function getInitialTheme() {
  try {
    const saved = localStorage.getItem(THEME_KEY);
    if (saved === "light" || saved === "dark") return saved;
  } catch {
    // armazenamento bloqueado: segue o sistema
  }
  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

export default function AppLayout() {
  const { cloud } = useHabits();
  const [theme, setTheme] = useState(getInitialTheme);

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
  }, [theme]);

  function toggleTheme() {
    const next = theme === "dark" ? "light" : "dark";
    setTheme(next);
    try {
      localStorage.setItem(THEME_KEY, next);
    } catch {
      // sem armazenamento, o tema vale só nesta visita
    }
  }

  return (
    <>
      <header className="topbar">
        <div className="topbar-inner">
          <Link to="/" className="brand">
            <span className="brand-mark" aria-hidden="true">✓</span>
            <span>
              My Daily Habits
              <small>painel do Hendrick</small>
            </span>
          </Link>
          <div className="topbar-actions">
            {cloud.enabled && (
              <NavLink to="/conta" className="icon-button account-button" aria-label={cloud.user ? `Conta: ${cloud.user.email}` : "Entrar"}>
                👤
                {cloud.user && <span className={`sync-dot is-${cloud.sync.status}`} aria-hidden="true" />}
              </NavLink>
            )}
            <button
              type="button"
              className="icon-button"
              onClick={toggleTheme}
              aria-label={theme === "dark" ? "Usar tema claro" : "Usar tema escuro"}
            >
              {theme === "dark" ? "☀️" : "🌙"}
            </button>
          </div>
        </div>

        <nav className="main-nav" aria-label="Principal">
          {links.map(([to, label]) => (
            <NavLink key={to} to={to} end={to === "/"}>
              {label}
            </NavLink>
          ))}
        </nav>
      </header>

      <main className="app">
        <Outlet />
      </main>
    </>
  );
}
