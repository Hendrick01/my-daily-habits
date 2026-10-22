import { useState, useEffect, useEffectEvent, useRef } from "react";
import { TrainingContext } from "./useTraining";
import { EXERCISES } from "../data/exercises";
import { buildPlan, newItem } from "../utils/training";
import { supabase } from "../services/cloud";

const STORAGE_KEY = "my-daily-habits:training";
const EMPTY = { profile: null, workouts: [], customExercises: [], updatedAt: null };
const LETTERS = "ABCDEFGHIJ";

function loadTraining() {
  try {
    const stored = JSON.parse(localStorage.getItem(STORAGE_KEY));
    if (stored && typeof stored === "object") return sanitizeTraining(stored);
  } catch {
    // dado corrompido: começa vazio
  }
  return EMPTY;
}

function sanitizeTraining(value) {
  return {
    profile: value.profile && typeof value.profile === "object" ? value.profile : null,
    workouts: Array.isArray(value.workouts) ? value.workouts.filter((w) => w && typeof w.id === "string" && Array.isArray(w.items)) : [],
    customExercises: Array.isArray(value.customExercises) ? value.customExercises.filter((e) => e && typeof e.id === "string") : [],
    updatedAt: typeof value.updatedAt === "string" ? value.updatedAt : null,
  };
}

export function TrainingProvider({ children }) {
  const [training, setTraining] = useState(loadTraining);
  const latest = useRef(training);
  const syncTimer = useRef(null);

  const library = [...EXERCISES, ...training.customExercises];

  useEffect(() => {
    latest.current = training;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(training));
  }, [training]);

  // ---------- nuvem: um documento por usuário, vence a versão mais recente ----------

  async function sync() {
    if (!supabase) return;
    const { data } = await supabase.auth.getSession();
    const user = data.session?.user;
    if (!user) return;

    const { data: row, error } = await supabase.from("training_plans").select("data, updated_at").maybeSingle();
    if (error) return;
    const local = latest.current;
    const remoteAt = row ? new Date(row.updated_at).toISOString() : null;

    if (row && (!local.updatedAt || remoteAt > local.updatedAt)) {
      setTraining(sanitizeTraining({ ...row.data, updatedAt: remoteAt }));
    } else if (local.updatedAt && (!row || local.updatedAt > remoteAt)) {
      const { updatedAt, ...doc } = local;
      await supabase.from("training_plans").upsert({ user_id: user.id, data: doc, updated_at: updatedAt });
    }
  }

  const onSync = useEffectEvent(() => sync());

  useEffect(() => {
    if (!supabase) return;
    const { data } = supabase.auth.onAuthStateChange((event, session) => {
      if (session && (event === "INITIAL_SESSION" || event === "SIGNED_IN")) setTimeout(onSync, 0);
      // O treino é da conta: ao sair, o aparelho volta ao começo.
      if (event === "SIGNED_OUT") setTraining(EMPTY);
    });
    const onVisible = () => document.visibilityState === "visible" && onSync();
    document.addEventListener("visibilitychange", onVisible);
    window.addEventListener("online", onSync);
    return () => {
      data.subscription.unsubscribe();
      document.removeEventListener("visibilitychange", onVisible);
      window.removeEventListener("online", onSync);
    };
  }, []);

  function change(update) {
    setTraining((current) => ({ ...update(current), updatedAt: new Date().toISOString() }));
    clearTimeout(syncTimer.current);
    syncTimer.current = setTimeout(sync, 1000);
  }

  // ---------- ações ----------

  function updateWorkouts(update) {
    change((current) => ({ ...current, workouts: update(current.workouts) }));
  }

  function updateItems(workoutId, update) {
    updateWorkouts((workouts) => workouts.map((w) => (w.id === workoutId ? { ...w, items: update(w.items) } : w)));
  }

  const value = {
    ...training,
    library,
    findExercise: (id) => library.find((exercise) => exercise.id === id),

    saveProfile: (profile, { regenerate }) =>
      change((current) => ({ ...current, profile, workouts: regenerate ? buildPlan(profile, library) : current.workouts })),

    addWorkout: () => {
      const id = crypto.randomUUID();
      updateWorkouts((workouts) => [
        ...workouts,
        { id, name: `Treino ${LETTERS[workouts.length] ?? workouts.length + 1}`, focus: "", notes: "", items: [] },
      ]);
      return id;
    },
    updateWorkout: (workoutId, patch) => updateWorkouts((workouts) => workouts.map((w) => (w.id === workoutId ? { ...w, ...patch } : w))),
    removeWorkout: (workoutId) => updateWorkouts((workouts) => workouts.filter((w) => w.id !== workoutId)),

    addItem: (workoutId, exercise) => updateItems(workoutId, (items) => [...items, newItem(exercise, training.profile)]),
    updateItem: (workoutId, itemId, patch) => updateItems(workoutId, (items) => items.map((i) => (i.id === itemId ? { ...i, ...patch } : i))),
    removeItem: (workoutId, itemId) => updateItems(workoutId, (items) => items.filter((i) => i.id !== itemId)),
    // Sem workoutId, vale para todos os treinos.
    setRestForAll: (rest, workoutId = null) =>
      updateWorkouts((workouts) => workouts.map((w) => (!workoutId || w.id === workoutId ? { ...w, items: w.items.map((i) => ({ ...i, rest })) } : w))),
    moveItem: (workoutId, itemId, delta) =>
      updateItems(workoutId, (items) => {
        const from = items.findIndex((i) => i.id === itemId);
        const to = from + delta;
        if (from < 0 || to < 0 || to >= items.length) return items;
        const next = [...items];
        [next[from], next[to]] = [next[to], next[from]];
        return next;
      }),

    addCustomExercise: (exercise) => {
      const custom = { ...exercise, id: `meu-${crypto.randomUUID().slice(0, 8)}`, custom: true, cautions: [], level: 1 };
      change((current) => ({ ...current, customExercises: [...current.customExercises, custom] }));
      return custom;
    },
    removeCustomExercise: (exerciseId) =>
      change((current) => ({ ...current, customExercises: current.customExercises.filter((e) => e.id !== exerciseId) })),
  };

  return <TrainingContext value={value}>{children}</TrainingContext>;
}
