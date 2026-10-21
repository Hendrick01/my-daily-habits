import { Link } from "react-router-dom";

export default function NotFoundPage() {
  return (
    <div className="empty not-found">
      <p className="big" aria-hidden="true">🧭</p>
      <h1>Página não encontrada</h1>
      <p>O caminho que você tentou acessar não existe.</p>
      <Link to="/" className="btn btn-primary">
        Voltar para o início
      </Link>
    </div>
  );
}
