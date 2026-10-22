import { useState, useEffect, useEffectEvent, useRef } from "react";
import { initialHabits } from "../data/habits";
import { HabitsContext } from "./useHabits";
import { fromDateKey, toDateKey } from "../utils/dates";
import { sanitizeHabits } from "../utils/habits";
import { DAILY, getWeekCount, isDueToday } from "../utils/schedule";
import { mergeHabits } from "../utils/sync";
import { sanitizePartsDone, toggleDay, togglePart as togglePartOn } from "../utils/parts";
import { fetchRemoteHabits, pushHabits, supabase } from "../services/cloud";
import { disableReminder } from "../services/reminders";

const STORAGE_KEY = "my-daily-habits:habits";

function loadHabits() {
  const today = toDateKey();
  try {
    const stored = JSON.parse(localStorage.getItem(STORAGE_KEY));
    if (Array.isArray(stored)) return sanitizeHabits(stored, today);
  } catch {
    // JSON inválido: cai nos hábitos iniciais abaixo
  }
  return sanitizeHabits(initialHabits, today);
}

const stamp = () => new Date().toISOString();

export function HabitsProvider({ children }) {
  // Inclui as "lápides" (deleted: true): somem da tela, mas levam a exclusão para a nuvem.
  const [habits, setHabits] = useState(loadHabits);
  const [today, setToday] = useState(toDateKey);
  const [session, setSession] = useState(null);
  const [recovering, setRecovering] = useState(false);
  const [sync, setSync] = useState({ status: "idle", at: null, error: "" });

  const latestHabits = useRef(habits);
  const syncing = useRef(false);
  const syncAgain = useRef(false);
  const syncTimer = useRef(null);

  const todayDate = fromDateKey(today);
  const habitsToday = habits
    .filter((habit) => !habit.deleted)
    .map((habit) => ({
      ...habit,
      completed: habit.completedDates.includes(today),
      dueToday: isDueToday(habit, todayDate),
      weekCount: getWeekCount(habit, todayDate),
    }));
  // "Hoje" conta só o que está programado para hoje.
  const dueCount = habitsToday.filter((habit) => habit.dueToday).length;
  const completedCount = habitsToday.filter((habit) => habit.dueToday && habit.completed).length;

  useEffect(() => {
    latestHabits.current = habits;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(habits));
  }, [habits]);

  useEffect(() => {
    const originalTitle = document.title;
    document.title = `${completedCount}/${dueCount} hábitos concluídos`;

    return () => {
      document.title = originalTitle;
    };
  }, [completedCount, dueCount]);

  // ---------- sincronização ----------

  async function runSync() {
    if (!supabase) return;
    if (syncing.current) {
      syncAgain.current = true;
      return;
    }
    const { data } = await supabase.auth.getSession();
    const user = data.session?.user;
    if (!user) return;

    syncing.current = true;
    setSync((current) => ({ ...current, status: "syncing" }));
    try {
      const remote = sanitizeHabits(await fetchRemoteHabits(), toDateKey());
      const { merged, toPush } = mergeHabits(latestHabits.current, remote);
      await pushHabits(toPush, user.id);
      // Junta de novo com o estado atual: o que foi editado durante a sincronização continua valendo.
      setHabits((current) => {
        const next = mergeHabits(current, merged).merged;
        return JSON.stringify(next) === JSON.stringify(current) ? current : next;
      });
      setSync({ status: "ok", at: stamp(), error: "" });
    } catch (error) {
      setSync((current) => ({ ...current, status: "error", error: error.message ?? String(error) }));
    } finally {
      syncing.current = false;
      if (syncAgain.current) {
        syncAgain.current = false;
        scheduleSync();
      }
    }
  }

  function scheduleSync() {
    if (!supabase) return;
    clearTimeout(syncTimer.current);
    syncTimer.current = setTimeout(runSync, 800);
  }

  const onTick = useEffectEvent(() => {
    setToday(toDateKey());
    if (document.visibilityState === "visible") runSync();
  });
  const onLogin = useEffectEvent(() => runSync());

  // Vira o dia sozinho e busca novidades da nuvem: a cada minuto, ao voltar para a aba e ao reconectar.
  useEffect(() => {
    const timer = setInterval(onTick, 60_000);
    document.addEventListener("visibilitychange", onTick);
    window.addEventListener("online", onTick);

    return () => {
      clearInterval(timer);
      document.removeEventListener("visibilitychange", onTick);
      window.removeEventListener("online", onTick);
    };
  }, []);

  useEffect(() => {
    if (!supabase) return;
    const { data } = supabase.auth.onAuthStateChange((event, newSession) => {
      setSession(newSession);
      if (event === "PASSWORD_RECOVERY") setRecovering(true);
      // Fora do callback: o Supabase pede para não chamar a API de dentro dele.
      if (newSession && (event === "INITIAL_SESSION" || event === "SIGNED_IN")) setTimeout(onLogin, 0);
    });
    return () => data.subscription.unsubscribe();
  }, []);

  async function signOut() {
    await runSync();
    await disableReminder().catch(() => {});
    await supabase.auth.signOut();
    // Os hábitos ficam na conta; o aparelho volta ao começo para não misturar com outra pessoa.
    setHabits(sanitizeHabits(initialHabits, toDateKey()));
    setSync({ status: "idle", at: null, error: "" });
  }

  // Apaga a conta e os dados na nuvem; os hábitos deste aparelho continuam aqui.
  async function deleteAccount() {
    await disableReminder().catch(() => {});
    const { error } = await supabase.functions.invoke("delete-account");
    if (error) throw error;
    await supabase.auth.signOut({ scope: "local" });
    setSync({ status: "idle", at: null, error: "" });
  }

  // ---------- ações ----------

  function change(update) {
    setHabits(update);
    scheduleSync();
  }

  function updateWhere(habitId, edit) {
    change((currentHabits) =>
      currentHabits.map((habit) => (habit.id === habitId ? { ...edit(habit), updatedAt: stamp() } : habit)),
    );
  }

  // Marca ou desmarca o dia inteiro (com partes, todas de uma vez).
  function toggleHabit(habitId, date = today) {
    updateWhere(habitId, (habit) => toggleDay(habit, date));
  }

  function togglePart(habitId, partId, date = today) {
    updateWhere(habitId, (habit) => togglePartOn(habit, partId, date));
  }

  function addHabit(title, goal, emoji, schedule = DAILY, parts = undefined) {
    const newHabit = {
      id: crypto.randomUUID(),
      title: title.trim(),
      goal: goal.trim(),
      emoji,
      schedule,
      parts,
      completedDates: [],
      updatedAt: stamp(),
    };

    change((currentHabits) => [...currentHabits, newHabit]);
  }

  function updateHabit(habitId, title, goal, emoji, schedule, parts) {
    updateWhere(habitId, (habit) => ({
      ...habit,
      title: title.trim(),
      goal: goal.trim(),
      emoji,
      schedule,
      parts,
      // Partes removidas levam junto o progresso delas.
      partsDone: sanitizePartsDone(habit.partsDone, parts),
    }));
  }

  function removeHabit(habitId) {
    updateWhere(habitId, (habit) => ({ ...habit, deleted: true }));
  }

  // Backup importado substitui tudo: os hábitos atuais que não estão no arquivo viram lápides.
  function replaceHabits(newHabits) {
    const now = stamp();
    const imported = sanitizeHabits(newHabits, today).map((habit) => ({ ...habit, deleted: undefined, updatedAt: now }));
    const importedIds = new Set(imported.map((habit) => habit.id));
    change((currentHabits) => [
      ...imported,
      ...currentHabits.filter((habit) => !importedIds.has(habit.id)).map((habit) => ({ ...habit, deleted: true, updatedAt: now })),
    ]);
  }

  const value = {
    habits: habitsToday,
    completedCount,
    dueCount,
    today,
    toggleHabit,
    togglePart,
    addHabit,
    updateHabit,
    removeHabit,
    replaceHabits,
    cloud: {
      enabled: Boolean(supabase),
      user: session?.user ?? null,
      sync,
      syncNow: runSync,
      signOut,
      deleteAccount,
      recovering,
      finishRecovery: () => setRecovering(false),
    },
  };

  return <HabitsContext value={value}>{children}</HabitsContext>;
}
