import { useState } from "react";
import { useHabits } from "../context/useHabits";
import { sanitizeHabits } from "../utils/habits";

export default function BackupPanel() {
  const { habits, today, replaceHabits } = useHabits();
  const [pendingImport, setPendingImport] = useState(null);
  const [message, setMessage] = useState("");

  function handleExport() {
    const backup = {
      app: "my-daily-habits",
      version: 1,
      exportedAt: new Date().toISOString(),
      habits: habits.map(({ id, title, goal, emoji, schedule, completedDates }) => ({ id, title, goal, emoji, schedule, completedDates })),
    };
    const url = URL.createObjectURL(new Blob([JSON.stringify(backup, null, 2)], { type: "application/json" }));
    const link = document.createElement("a");
    link.href = url;
    link.download = `my-daily-habits-${today}.json`;
    link.click();
    URL.revokeObjectURL(url);
    setMessage("Backup baixado.");
  }

  async function handleFile(event) {
    const file = event.target.files[0];
    event.target.value = ""; // permite escolher o mesmo arquivo de novo
    if (!file) return;

    try {
      const data = JSON.parse(await file.text());
      const imported = sanitizeHabits(Array.isArray(data) ? data : data?.habits, today);
      if (imported.length === 0) throw new Error("sem hábitos");
      setPendingImport(imported);
      setMessage("");
    } catch {
      setPendingImport(null);
      setMessage("Arquivo inválido: não encontrei hábitos nele.");
    }
  }

  function confirmImport() {
    replaceHabits(pendingImport);
    setMessage(`${pendingImport.length} hábitos importados.`);
    setPendingImport(null);
  }

  return (
    <section className="card backup">
      <h2>Backup</h2>
      <p className="muted">Seus hábitos ficam só neste navegador. Baixe uma cópia para não perder nada, ou restaure um backup.</p>

      <div className="actions">
        <button type="button" className="btn btn-ghost" onClick={handleExport}>
          ⬇️ Exportar
        </button>
        <label className="btn btn-ghost">
          ⬆️ Importar
          <input type="file" accept="application/json,.json" className="sr-only" onChange={handleFile} />
        </label>
      </div>

      {pendingImport && (
        <div className="confirm" role="alert">
          <p>
            Substituir seus {habits.length} hábitos pelos {pendingImport.length} do arquivo? Isso não pode ser desfeito.
          </p>
          <div className="actions">
            <button type="button" className="btn btn-danger is-confirming" onClick={confirmImport}>
              Substituir
            </button>
            <button type="button" className="btn btn-ghost" onClick={() => setPendingImport(null)}>
              Cancelar
            </button>
          </div>
        </div>
      )}

      {message && (
        <p className="status-msg" role="status">
          {message}
        </p>
      )}
    </section>
  );
}
