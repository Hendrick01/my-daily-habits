// Regras do treino: avaliação (IMC, PAR-Q), prescrição de séries e montagem do plano.
import { EXERCISES, GROUPS } from "../data/exercises.js";

// ---------- avaliação ----------

export const GOALS = {
  emagrecer: "Emagrecer",
  hipertrofia: "Ganhar massa muscular",
  forca: "Ganhar força",
  condicionamento: "Condicionamento físico",
  flexibilidade: "Flexibilidade e mobilidade",
  saude: "Saúde e bem-estar",
};
export const LEVELS = { 1: "Iniciante", 2: "Intermediário", 3: "Avançado" };
export const PLACES = { academia: "Academia", "casa-halteres": "Casa, com halteres", casa: "Casa, sem equipamento" };
export const STYLES = {
  focado: "Focado por grupo muscular",
  hibrido: "Híbrido: corpo inteiro",
  alongamento: "Só alongamento e mobilidade",
};
export const RESTRICTIONS = { joelho: "Joelho", lombar: "Lombar", ombro: "Ombro", punho: "Punho" };

// Questionário de prontidão para atividade física (PAR-Q), em versão simplificada.
export const PARQ_QUESTIONS = [
  "Algum médico já disse que você tem problema no coração e só deve fazer atividade física com recomendação médica?",
  "Você sente dor no peito quando faz atividade física?",
  "No último mês, você sentiu dor no peito sem estar fazendo atividade física?",
  "Você perde o equilíbrio por tontura ou já perdeu a consciência?",
  "Você tem algum problema nos ossos ou articulações que pode piorar com exercício?",
  "Você toma remédio para pressão arterial ou para o coração?",
  "Existe algum outro motivo para você não fazer atividade física?",
];

export function bmi(weightKg, heightCm) {
  if (!(weightKg > 0) || !(heightCm > 0)) return null;
  const meters = heightCm / 100;
  return Math.round((weightKg / (meters * meters)) * 10) / 10;
}

// Classificação da OMS para adultos. O IMC não diferencia músculo de gordura.
export function bmiCategory(value) {
  if (value == null) return null;
  if (value < 18.5) return "Abaixo do peso";
  if (value < 25) return "Peso adequado";
  if (value < 30) return "Sobrepeso";
  if (value < 35) return "Obesidade grau I";
  if (value < 40) return "Obesidade grau II";
  return "Obesidade grau III";
}

// Relação cintura/altura: acima de 0,5 indica mais risco cardiometabólico.
export function waistToHeight(waistCm, heightCm) {
  if (!(waistCm > 0) || !(heightCm > 0)) return null;
  return Math.round((waistCm / heightCm) * 100) / 100;
}

export function needsMedicalClearance(profile) {
  return (profile?.parq ?? []).some(Boolean);
}

// ---------- prescrição ----------

const PRESCRIPTION = {
  emagrecer: { sets: 3, reps: "12–15", rest: 45 },
  hipertrofia: { sets: 4, reps: "8–12", rest: 75 },
  forca: { sets: 5, reps: "4–6", rest: 150 },
  condicionamento: { sets: 3, reps: "15–20", rest: 30 },
  flexibilidade: { sets: 3, reps: "10–12", rest: 45 },
  saude: { sets: 3, reps: "10–12", rest: 60 },
};
const TIMED = { 1: "20 s", 2: "40 s", 3: "60 s" };

export function prescription(exercise, profile) {
  if (exercise.type === "alongamento") return { sets: 2, reps: "30 s", rest: 15 };
  const base = PRESCRIPTION[profile?.goal] ?? PRESCRIPTION.saude;
  const level = profile?.level ?? 1;
  const sets = Math.max(2, base.sets - (level === 1 ? 1 : 0));
  if (exercise.unit === "seg") return { sets, reps: TIMED[level], rest: Math.max(30, Math.min(base.rest, 60)) };
  return { sets, reps: base.reps, rest: base.rest };
}

export function newItem(exercise, profile) {
  return {
    id: crypto.randomUUID(),
    exerciseId: exercise.id,
    name: exercise.name,
    image: exercise.image ?? null,
    group: exercise.group,
    ...prescription(exercise, profile),
    load: "",
    notes: "",
  };
}

// ---------- montagem do plano ----------

const PLACE_EQUIPMENT = {
  academia: null,
  "casa-halteres": ["peso-corporal", "halteres", "corda"],
  casa: ["peso-corporal", "corda"],
};

const FOCUSED_SPLITS = {
  2: [
    ["peito", "costas", "ombros", "triceps", "biceps"],
    ["pernas", "gluteos", "abdomen", "panturrilhas"],
  ],
  3: [
    ["peito", "ombros", "triceps"],
    ["costas", "biceps", "abdomen"],
    ["pernas", "gluteos", "panturrilhas"],
  ],
  4: [
    ["peito", "triceps"],
    ["costas", "biceps"],
    ["pernas", "gluteos", "panturrilhas"],
    ["ombros", "abdomen"],
  ],
  5: [
    ["peito", "triceps"],
    ["costas", "biceps"],
    ["pernas", "panturrilhas"],
    ["ombros", "abdomen"],
    ["gluteos", "pernas"],
  ],
};
const FULL_BODY = ["pernas", "peito", "costas", "ombros", "gluteos", "abdomen", "triceps", "biceps", "panturrilhas"];
const STRETCH_ROUTINES = [
  { focus: "Alongamento do corpo todo", groups: ["corpo-inteiro", "pernas", "gluteos", "costas", "peito", "ombros", "triceps", "panturrilhas", "abdomen", "pescoco", "biceps"] },
  { focus: "Mobilidade de quadril e coluna", groups: ["pernas", "gluteos", "costas", "abdomen"] },
];
const LETTERS = "ABCDE";

export function joinLabels(labels) {
  return labels.length <= 1 ? labels.join("") : `${labels.slice(0, -1).join(", ")} e ${labels.at(-1)}`;
}

// Exercícios possíveis para o perfil: equipamento do local, nível e restrições.
export function exercisesFor(profile, library = EXERCISES) {
  const allowed = PLACE_EQUIPMENT[profile.place] ?? null;
  const restrictions = new Set(profile.restrictions ?? []);
  return library.filter(
    (exercise) =>
      (!allowed || allowed.includes(exercise.equipment)) &&
      exercise.level <= profile.level &&
      !(exercise.cautions ?? []).some((caution) => restrictions.has(caution)),
  );
}

// Quantos exercícios principais cabem no tempo: ~8 min cada, descontando aquecimento.
export function exercisesPerSession(minutes) {
  return Math.min(8, Math.max(3, Math.round((minutes - 10) / 8)));
}

export function buildPlan(profile, library = EXERCISES) {
  const pool = exercisesFor(profile, library);
  const stretches = pool.filter((exercise) => exercise.type === "alongamento");
  const used = new Map();
  // Prefere o menos usado no plano (varia entre treinos); na academia, peso corporal fica por último.
  // Empate fica na ordem da biblioteca (os básicos vêm primeiro).
  const bodyweightLast = (exercise) => (profile.place === "academia" && exercise.equipment === "peso-corporal" ? 1 : 0);
  const pick = (options) =>
    [...options].sort((a, b) => (used.get(a.id) ?? 0) - (used.get(b.id) ?? 0) || bodyweightLast(a) - bodyweightLast(b))[0];
  const take = (exercise) => {
    used.set(exercise.id, (used.get(exercise.id) ?? 0) + 1);
    return newItem(exercise, profile);
  };

  if (profile.style === "alongamento") {
    const perRoutine = Math.min(12, Math.max(4, Math.round(profile.minutes / 3)));
    return STRETCH_ROUTINES.slice(0, Math.min(profile.days, 2)).map((routine, index) => {
      const items = [];
      for (let round = 0; items.length < perRoutine && round < 3; round++) {
        for (const group of routine.groups) {
          if (items.length >= perRoutine) break;
          const option = pick(stretches.filter((s) => s.group === group && !items.some((item) => item.exerciseId === s.id)));
          if (option) items.push(take(option));
        }
      }
      return { id: crypto.randomUUID(), name: `Rotina ${LETTERS[index]}`, focus: routine.focus, notes: "Movimentos suaves, sem dor. Respire fundo em cada posição.", items };
    });
  }

  const strength = pool.filter((exercise) => exercise.type === "forca");
  const cardio = pool.filter((exercise) => exercise.type === "cardio");
  const perSession = exercisesPerSession(profile.minutes);
  const hybrid = profile.style === "hibrido";
  const splits = hybrid
    ? Array.from({ length: Math.min(profile.days, 3) }, () => FULL_BODY)
    : FOCUSED_SPLITS[Math.min(Math.max(profile.days, 2), 5)] ?? FOCUSED_SPLITS[3];

  return splits.map((groups, index) => {
    const items = [];
    // No corpo inteiro, cada treino começa num grupo diferente para variar.
    const start = hybrid ? (index * perSession) % groups.length : 0;
    for (let step = 0; items.length < perSession && step < groups.length * 3; step++) {
      const group = groups[(start + step) % groups.length];
      const option = pick(strength.filter((e) => e.group === group && !items.some((item) => item.exerciseId === e.id)));
      if (option) items.push(take(option));
    }
    // Agrupa por músculo, na ordem do treino (grandes primeiro), como se faz na academia.
    items.sort((a, b) => groups.indexOf(a.group) - groups.indexOf(b.group));
    if ((profile.goal === "emagrecer" || profile.goal === "condicionamento") && cardio.length > 0) items.push(take(pick(cardio)));

    // Volta à calma: até 3 alongamentos dos grupos trabalhados.
    const worked = new Set(items.map((item) => item.group));
    const coolDown = [];
    for (const group of worked) {
      if (coolDown.length >= 3) break;
      const option = pick(stretches.filter((s) => s.group === group));
      if (option) coolDown.push(take(option));
    }

    const focus = hybrid ? "Corpo inteiro" : joinLabels(groups.filter((group) => worked.has(group)).map((group) => GROUPS[group]));
    return {
      id: crypto.randomUUID(),
      name: `Treino ${LETTERS[index]}`,
      focus,
      notes: "Aquecimento: 5 minutos de caminhada, bicicleta ou polichinelo leve.",
      items: [...items, ...coolDown],
    };
  });
}

// ---------- planilha ----------

const cell = (value) => {
  const text = String(value ?? "");
  return /[;"\r\n]/.test(text) ? `"${text.replaceAll('"', '""')}"` : text;
};

// CSV com ";" e BOM: abre direto no Excel e no Google Planilhas em português.
export function planToCsv({ profile, workouts }, date = new Date()) {
  const rows = [["Plano de treino — My Daily Habits"], ["Gerado em", date.toLocaleDateString("pt-BR")]];
  if (profile) {
    const value = bmi(profile.weight, profile.height);
    rows.push(
      ["Objetivo", GOALS[profile.goal] ?? ""],
      ["Meta", profile.target ?? ""],
      ["Nível", LEVELS[profile.level] ?? ""],
      ["Treinos por semana", profile.days],
      ["Tempo por treino (min)", profile.minutes],
      ["Peso (kg)", profile.weight],
      ["Altura (cm)", profile.height],
      ["IMC", value == null ? "" : `${String(value).replace(".", ",")} (${bmiCategory(value)})`],
    );
  }
  rows.push([], ["Treino", "Foco", "Ordem", "Exercício", "Grupo", "Séries", "Repetições", "Carga (kg)", "Descanso (s)", "Observações"]);
  for (const workout of workouts) {
    workout.items.forEach((item, index) => {
      rows.push([workout.name, workout.focus, index + 1, item.name, GROUPS[item.group] ?? item.group ?? "", item.sets, item.reps, item.load, item.rest, item.notes]);
    });
  }
  return "﻿" + rows.map((row) => row.map(cell).join(";")).join("\r\n");
}

// ---------- busca e vídeo ----------

const plain = (text) => text.normalize("NFD").replace(/\p{Diacritic}/gu, "").toLowerCase();

export function filterExercises(list, { query = "", group = "", type = "", equipment = "" } = {}) {
  const words = plain(query).split(/\s+/).filter(Boolean);
  return list.filter(
    (exercise) =>
      (!group || exercise.group === group) &&
      (!type || exercise.type === type) &&
      (!equipment || exercise.equipment === equipment) &&
      words.every((word) => plain(exercise.name).includes(word)),
  );
}

// Busca no YouTube em vez de um vídeo fixo: nunca vira link quebrado.
export function videoUrlFor(exercise) {
  if (typeof exercise.videoUrl === "string" && /^https:\/\//.test(exercise.videoUrl)) return exercise.videoUrl;
  return `https://www.youtube.com/results?search_query=${encodeURIComponent(`como fazer ${exercise.name} execução correta`)}`;
}
