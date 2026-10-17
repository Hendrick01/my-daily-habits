import { Link } from "react-router-dom";

export default function NotFoundPage() {
  return (
    <div>
      <h2>Página não encontrada</h2>
      <p>O caminho que você tentou acessar não existe.</p>
      <Link to="/">Voltar para o início</Link>
    </div>
  );
}
