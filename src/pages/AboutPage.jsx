export default function AboutPage() {
  return (
    <div>
      <h2>Sobre o projeto</h2>
      <p>
        A coisa mais difícil nesta atividade foi entender como compartilhar o estado global sem quebrar o fluxo de dados dos componentes antigos. Resolvi isso lendo a documentação do React sobre Context API e mapeando com cuidado o que deveria ficar no Provider e o que pertencia aos formulários locais.
      </p>
    </div>
  );
}
