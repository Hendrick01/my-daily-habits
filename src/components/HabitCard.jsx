export default function HabitCard({
  id,
  title,
  goal = "Sem meta definida",
  completed,
  onShowDetails,
}) {
  return (
    <article className={`habit-card ${completed ? "is-complete" : ""}`}>
      <div>
        <h2>{title}</h2>
        <p>Meta: {goal}</p>
      </div>

      <span className="habit-status">
        {completed ? "Concluído" : "Pendente"}
      </span>

      <button type="button" onClick={() => onShowDetails(id)}>
        Ver detalhes
      </button>
    </article>
  );
}
