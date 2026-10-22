export default function AboutPage() {
  return (
    <>
      <header className="page-head">
        <h1>Sobre o projeto</h1>
        <p>Projeto final do módulo de React · Capacitação Full Stack ITEAM · 2026</p>
      </header>

      <div className="card prose">
        <p>
          A coisa mais difícil nesta atividade foi entender como compartilhar o estado global sem quebrar o fluxo de dados dos componentes antigos. Resolvi isso lendo a documentação do React sobre Context API e mapeando com cuidado o que deveria ficar no Provider e o que pertencia aos formulários locais.
        </p>

        <h2>O que dá para fazer aqui</h2>
        <ul>
          <li>Marcar hábitos como feitos: a lista recomeça sozinha a cada dia.</li>
          <li>Escolher a frequência: todo dia, dias da semana ou N vezes por semana.</li>
          <li>Dividir um hábito em partes do dia, cada uma com horário e lembrete.</li>
          <li>Acompanhar sequências 🔥 e o histórico da semana.</li>
          <li>Corrigir dias passados, editar e excluir hábitos.</li>
          <li>Ver o progresso do dia e dos últimos 7 dias.</li>
          <li>Buscar sugestões e adicioná-las com um clique.</li>
          <li>Fazer backup dos dados num arquivo e restaurar quando quiser.</li>
          <li>Dar um ícone para cada hábito e ver o histórico de 16 semanas.</li>
          <li>Alternar entre tema claro e escuro.</li>
          <li>Instalar como app e usar sem internet.</li>
          <li>Criar uma conta para sincronizar entre aparelhos e receber um lembrete por dia.</li>
        </ul>
      </div>
    </>
  );
}
