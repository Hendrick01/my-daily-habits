import { useEffect, useState } from "react";
import { useHabits } from "../context/useHabits";
import { friendlyError, supabase } from "../services/cloud";
import { currentReminder, disableReminder, enableReminder, reminderSupport, sendTestReminder, updateReminder } from "../services/reminders";

const timeFormat = new Intl.DateTimeFormat("pt-BR", { hour: "2-digit", minute: "2-digit" });

function SignInCard() {
  const [mode, setMode] = useState("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState(null);

  async function handleSubmit(event) {
    event.preventDefault();
    setBusy(true);
    setMessage(null);
    const credentials = { email: email.trim(), password };
    const { error } =
      mode === "signin" ? await supabase.auth.signInWithPassword(credentials) : await supabase.auth.signUp(credentials);
    setBusy(false);
    if (error) setMessage({ error: true, text: friendlyError(error) });
  }

  async function handleForgot() {
    if (!email.trim()) {
      setMessage({ error: true, text: "Digite o seu e-mail acima e toque de novo em “Esqueci a senha”." });
      return;
    }
    setBusy(true);
    const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), { redirectTo: `${location.origin}/conta` });
    setBusy(false);
    setMessage(
      error
        ? { error: true, text: friendlyError(error) }
        : { error: false, text: "Se esse e-mail tiver conta, enviamos um link para criar uma senha nova." },
    );
  }

  return (
    <section className="card">
      <div className="segmented" role="group" aria-label="Entrar ou criar conta">
        <button type="button" aria-pressed={mode === "signin"} onClick={() => setMode("signin")}>
          Entrar
        </button>
        <button type="button" aria-pressed={mode === "signup"} onClick={() => setMode("signup")}>
          Criar conta
        </button>
      </div>

      <form className="form account-form" onSubmit={handleSubmit}>
        <label className="field">
          E-mail
          <input type="email" name="email" autoComplete="email" required value={email} onChange={(event) => setEmail(event.target.value)} />
        </label>
        <label className="field">
          Senha
          <input
            type="password"
            name="password"
            minLength={8}
            required
            autoComplete={mode === "signin" ? "current-password" : "new-password"}
            value={password}
            onChange={(event) => setPassword(event.target.value)}
          />
        </label>
        {mode === "signup" && <p className="muted hint-inline">Pelo menos 8 caracteres.</p>}

        {message && (
          <p className={message.error ? "form-error" : "status-msg"} role={message.error ? "alert" : "status"}>
            {message.text}
          </p>
        )}

        <div className="form-actions">
          <button type="submit" className="btn btn-primary" disabled={busy}>
            {mode === "signin" ? "Entrar" : "Criar conta"}
          </button>
          {mode === "signin" && (
            <button type="button" className="btn btn-ghost" onClick={handleForgot} disabled={busy}>
              Esqueci a senha
            </button>
          )}
        </div>
      </form>
    </section>
  );
}

function NewPasswordCard({ onDone }) {
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  async function handleSubmit(event) {
    event.preventDefault();
    const { error: updateError } = await supabase.auth.updateUser({ password });
    if (updateError) setError(friendlyError(updateError));
    else onDone();
  }

  return (
    <section className="card">
      <h2>Criar senha nova</h2>
      <form className="form account-form" onSubmit={handleSubmit}>
        <label className="field">
          Senha nova
          <input type="password" name="new-password" minLength={8} required autoComplete="new-password" value={password} onChange={(event) => setPassword(event.target.value)} />
        </label>
        {error && (
          <p className="form-error" role="alert">
            {error}
          </p>
        )}
        <div className="form-actions">
          <button type="submit" className="btn btn-primary">
            Salvar senha
          </button>
        </div>
      </form>
    </section>
  );
}

function SyncCard({ cloud }) {
  const { user, sync, syncNow, signOut } = cloud;
  const [leaving, setLeaving] = useState(false);

  const status = {
    idle: "Aguardando a primeira sincronização…",
    syncing: "Sincronizando…",
    ok: sync.at ? `Tudo sincronizado às ${timeFormat.format(new Date(sync.at))}.` : "Tudo sincronizado.",
    error: `Não deu para sincronizar: ${friendlyError(sync.error)}`,
  }[sync.status];

  async function handleSignOut() {
    setLeaving(true);
    await signOut();
  }

  return (
    <section className="card">
      <h2>Sincronização</h2>
      <p className="muted">
        Conectado como <strong>{user.email}</strong>. Seus hábitos ficam salvos na conta e aparecem em todo aparelho em que você entrar.
      </p>
      <p className={`status-msg${sync.status === "error" ? " is-error" : ""}`} role="status">
        <span className={`sync-dot is-${sync.status}`} aria-hidden="true" /> {status}
      </p>
      <div className="actions">
        <button type="button" className="btn btn-ghost" onClick={syncNow} disabled={sync.status === "syncing"}>
          Sincronizar agora
        </button>
        <button type="button" className="btn btn-danger" onClick={handleSignOut} disabled={leaving}>
          Sair
        </button>
      </div>
    </section>
  );
}

function DeleteAccountCard({ onDelete }) {
  const [confirming, setConfirming] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function handleClick() {
    if (!confirming) {
      setConfirming(true);
      return;
    }
    setBusy(true);
    setError("");
    try {
      await onDelete();
    } catch (deleteError) {
      setError(friendlyError(deleteError));
      setBusy(false);
      setConfirming(false);
    }
  }

  return (
    <section className="card">
      <h2>Excluir conta</h2>
      <p className="muted">
        Apaga a conta e todos os hábitos salvos nela, em todos os aparelhos. Os hábitos deste aparelho continuam aqui. Se quiser uma cópia, faça um backup antes em Hábitos.
      </p>
      {error && (
        <p className="form-error" role="alert">
          {error}
        </p>
      )}
      <div className="actions">
        <button
          type="button"
          className={`btn btn-danger${confirming ? " is-confirming" : ""}`}
          onClick={handleClick}
          onBlur={() => !busy && setConfirming(false)}
          disabled={busy}
        >
          {busy ? "Excluindo…" : confirming ? "Confirmar: excluir para sempre" : "Excluir minha conta"}
        </button>
      </div>
    </section>
  );
}

function ReminderCard({ userId }) {
  const [support, setSupport] = useState("checking");
  const [enabled, setEnabled] = useState(false);
  const [time, setTime] = useState("20:00");
  const [summary, setSummary] = useState(true);
  const [partsOn, setPartsOn] = useState(true);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState(null);

  useEffect(() => {
    let active = true;
    (async () => {
      const result = await reminderSupport();
      const reminder = result === "ok" ? await currentReminder().catch(() => null) : null;
      if (!active) return;
      setSupport(result);
      setEnabled(Boolean(reminder));
      if (reminder) {
        setTime(reminder.time);
        setSummary(reminder.summary);
        setPartsOn(reminder.parts);
      }
    })();
    return () => {
      active = false;
    };
  }, []);

  async function run(action, success) {
    setBusy(true);
    setMessage(null);
    try {
      const result = await action();
      setMessage({ error: false, text: typeof success === "function" ? success(result) : success });
      return true;
    } catch (error) {
      setMessage({ error: true, text: friendlyError(error) });
      return false;
    } finally {
      setBusy(false);
    }
  }

  const supportText = {
    checking: "Verificando…",
    ios: "No iPhone, os lembretes funcionam com o app instalado: toque em Compartilhar → “Adicionar à Tela de Início” e abra por lá.",
    "no-sw": "Os lembretes funcionam na versão publicada do app (ou em npm run preview).",
    unsupported: "Este navegador não suporta notificações push.",
  }[support];

  return (
    <section className="card">
      <h2>Lembretes</h2>
      <p className="muted">Notificações neste aparelho, mesmo com o app fechado. Só avisam o que ainda está pendente.</p>

      {support !== "ok" ? (
        <p className="status-msg">{supportText}</p>
      ) : (
        <>
          <div className="reminder-options">
            <label className="check-option">
              <input type="checkbox" name="summary" checked={summary} onChange={(event) => setSummary(event.target.checked)} />
              Resumo do dia às
              <input type="time" name="remind-at" value={time} disabled={!summary} onChange={(event) => setTime(event.target.value)} />
            </label>
            <label className="check-option">
              <input type="checkbox" name="parts" checked={partsOn} onChange={(event) => setPartsOn(event.target.checked)} />
              Avisar nos horários das partes dos hábitos
            </label>
          </div>
          <div className="actions">
            {enabled ? (
              <>
                <button type="button" className="btn btn-primary" disabled={busy} onClick={() => run(() => updateReminder({ time, summary, parts: partsOn }, userId), "Lembretes salvos.")}>
                  Salvar
                </button>
                <button
                  type="button"
                  className="btn btn-ghost"
                  disabled={busy}
                  onClick={() => run(sendTestReminder, (result) => (result.sent > 0 ? "Notificação de teste enviada. Confira o aparelho!" : "Nenhum aparelho recebeu. Tente desativar e ativar de novo."))}
                >
                  Enviar teste
                </button>
                <button
                  type="button"
                  className="btn btn-danger"
                  disabled={busy}
                  onClick={async () => (await run(disableReminder, "Lembrete desativado neste aparelho.")) && setEnabled(false)}
                >
                  Desativar
                </button>
              </>
            ) : (
              <button
                type="button"
                className="btn btn-primary"
                disabled={busy}
                onClick={async () => (await run(() => enableReminder({ time, summary, parts: partsOn }, userId), "Pronto! Lembretes ativados neste aparelho.")) && setEnabled(true)}
              >
                Ativar lembretes
              </button>
            )}
          </div>
        </>
      )}

      {message && (
        <p className={message.error ? "form-error" : "status-msg"} role={message.error ? "alert" : "status"}>
          {message.text}
        </p>
      )}
    </section>
  );
}

export default function AccountPage() {
  const { cloud } = useHabits();
  const [notice, setNotice] = useState("");

  async function handleDelete() {
    await cloud.deleteAccount();
    setNotice("Conta excluída. Os dados na nuvem foram apagados; os hábitos deste aparelho continuam aqui.");
  }

  return (
    <>
      <header className="page-head">
        <h1>Conta</h1>
        <p>Sincronize seus hábitos entre aparelhos e receba um lembrete por dia.</p>
      </header>

      {!cloud.enabled ? (
        <div className="empty">
          <p>A sincronização não está disponível nesta versão do app.</p>
        </div>
      ) : cloud.recovering ? (
        <NewPasswordCard onDone={cloud.finishRecovery} />
      ) : !cloud.user ? (
        <>
          {notice && (
            <p className="notice" role="status">
              {notice}
            </p>
          )}
          <SignInCard />
        </>
      ) : (
        <div className="account-grid">
          <SyncCard cloud={cloud} />
          <ReminderCard userId={cloud.user.id} />
          <DeleteAccountCard onDelete={handleDelete} />
        </div>
      )}
    </>
  );
}
