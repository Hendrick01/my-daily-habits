import "./App.css";

export default function App() {
  return (
    <main className="app">
      <header className="hero">
        <p className="eyebrow">MY DAILY HABITS</p>
        <h1>Pequenos hábitos, progresso visível.</h1>
        <p>Hoje começamos com uma tela simples e funcional.</p>
      </header>

      <section className="habit-list" aria-label="Hábitos de hoje">
        <article className="habit-card">
          <h2>Beber água</h2>
          <p>Meta: 8 copos</p>
        </article>

        <article className="habit-card">
          <h2>Estudar React</h2>
          <p>Meta: 30 minutos</p>
        </article>

        <article className="habit-card">
          <h2>Caminhar</h2>
          <p>Meta: 20 minutos</p>
        </article>
      </section>
    </main>
  );
}
