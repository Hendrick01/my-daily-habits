// Regras do treino: avaliação (IMC, PAR-Q), prescrição de séries e montagem do plano.
import { EXERCISES, GROUPS } from "../data/exercises.js";

// ---------- avaliação ----------

// Cada objetivo define a prescrição (séries, repetições, descanso) e como o plano é montado:
//   cardio:   termina com um exercício de cardio
//   emphasis: grupos que vêm primeiro e ganham exercício extra (inclusive em dias de outro foco)
//   stretches / stretchGroups: quantos alongamentos no fim e de quais regiões, além das trabalhadas
//   maxLevel: limita a dificuldade dos exercícios · avoid: exercícios que o objetivo dispensa
//   note:     orientação que vai junto com o treino
export const GOAL_RULES = {
  emagrecer: { label: "Emagrecer", sets: 3, reps: "12–15", rest: 45, cardio: true },
  definicao: { label: "Definição muscular", sets: 4, reps: "10–15", rest: 45, cardio: true },
  hipertrofia: { label: "Ganhar massa muscular", sets: 4, reps: "8–12", rest: 75 },
  forca: {
    label: "Ganhar força",
    sets: 5,
    reps: "4–6",
    rest: 150,
    note: "Carga alta só com técnica perfeita; nos exercícios com barra, treine com alguém por perto.",
  },
  potencia: {
    label: "Potência e explosão",
    sets: 4,
    reps: "3–6 rápidas",
    rest: 120,
    cardio: true,
    note: "Faça a subida o mais rápido possível e desça controlando. Encerre a série quando a velocidade cair.",
  },
  resistencia: { label: "Resistência muscular", sets: 3, reps: "15–20", rest: 30 },
  condicionamento: { label: "Condicionamento físico", sets: 3, reps: "15–20", rest: 30, cardio: true },
  corrida: {
    label: "Preparar para corrida",
    sets: 3,
    reps: "12–15",
    rest: 45,
    cardio: true,
    emphasis: ["pernas", "panturrilhas", "abdomen"],
    note: "Complementa a corrida: prefira fazer em dias diferentes dos treinos de corrida.",
  },
  "gluteos-pernas": { label: "Glúteos e pernas", sets: 4, reps: "10–15", rest: 60, emphasis: ["gluteos", "pernas"] },
  bracos: { label: "Braços e ombros", sets: 4, reps: "10–12", rest: 60, emphasis: ["biceps", "triceps", "ombros"] },
  postura: {
    label: "Postura e coluna",
    sets: 3,
    reps: "12–15",
    rest: 45,
    emphasis: ["costas", "abdomen"],
    stretches: 5,
    stretchGroups: ["peito", "costas", "pernas"],
    note: "Movimentos lentos e controlados. Se sentir dor na coluna, pare e procure um profissional.",
  },
  flexibilidade: { label: "Flexibilidade e mobilidade", sets: 3, reps: "10–12", rest: 45, stretches: 5 },
  equilibrio: {
    label: "Equilíbrio e autonomia (60+)",
    sets: 2,
    reps: "10–12",
    rest: 90,
    maxLevel: 1,
    avoid: ["flexao", "mergulho-banco"], // pesam no punho e no ombro; a flexão inclinada entra no lugar
    emphasis: ["pernas", "gluteos", "abdomen"],
    stretches: 4,
    note: "Faça perto de um apoio firme (parede, cadeira ou bancada), sem pressa.",
  },
  retorno: {
    label: "Voltar a treinar",
    sets: 2,
    reps: "10–12",
    rest: 90,
    maxLevel: 1,
    note: "Nas 2 primeiras semanas, termine cada série sentindo que ainda daria para fazer mais 2 ou 3 repetições.",
  },
  saude: { label: "Saúde e bem-estar", sets: 3, reps: "10–12", rest: 60 },
};

export const GOALS = Object.fromEntries(Object.entries(GOAL_RULES).map(([key, rule]) => [key, rule.label]));

const goalRule = (goal) => GOAL_RULES[goal] ?? GOAL_RULES.saude;

// Resumo do que o objetivo muda no treino (aparece na avaliação).
export function describeGoal(goal, level = 2) {
  const rule = goalRule(goal);
  const sets = prescription({ type: "forca", unit: "reps" }, { goal, level: Number(level) }).sets;
  return [
    `${sets} séries de ${rule.reps}`,
    `descanso de ${rule.rest} s`,
    rule.cardio && "cardio no fim",
    rule.emphasis && `mais ${joinLabels(rule.emphasis.map((group) => GROUPS[group]))}`,
    rule.stretches && `${rule.stretches} alongamentos`,
    rule.maxLevel && "exercícios mais simples",
  ]
    .filter(Boolean)
    .join(" · ");
}
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

const TIMED = { 1: "20 s", 2: "40 s", 3: "60 s" };

export function prescription(exercise, profile) {
  if (exercise.type === "alongamento") return { sets: 2, reps: "30 s", rest: 15 };
  const base = goalRule(profile?.goal);
  const level = Math.min(profile?.level ?? 1, base.maxLevel ?? 3);
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

// Exercícios possíveis para o perfil: equipamento do local, nível (e limite do objetivo) e restrições.
export function exercisesFor(profile, library = EXERCISES) {
  const allowed = PLACE_EQUIPMENT[profile.place] ?? null;
  const restrictions = new Set(profile.restrictions ?? []);
  const rule = goalRule(profile.goal);
  const maxLevel = Math.min(profile.level, rule.maxLevel ?? 3);
  return library.filter(
    (exercise) =>
      (!allowed || allowed.includes(exercise.equipment)) &&
      exercise.level <= maxLevel &&
      !(rule.avoid ?? []).includes(exercise.id) &&
      !(exercise.cautions ?? []).some((caution) => restrictions.has(caution)),
  );
}

// Quantos exercícios principais cabem no tempo: ~8 min cada, descontando aquecimento.
export function exercisesPerSession(minutes) {
  return Math.min(8, Math.max(3, Math.round((minutes - 10) / 8)));
}

const WARM_UP = "Aquecimento: 5 minutos de caminhada, bicicleta ou polichinelo leve.";

export function buildPlan(profile, library = EXERCISES) {
  const rule = goalRule(profile.goal);
  const emphasis = rule.emphasis ?? [];
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
      const notes = ["Movimentos suaves, sem dor. Respire fundo em cada posição.", rule.note].filter(Boolean).join(" ");
      return { id: crypto.randomUUID(), name: `Rotina ${LETTERS[index]}`, focus: routine.focus, notes, items };
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
    const notIn = (list) => (exercise) => !list.some((item) => item.exerciseId === exercise.id);
    // No corpo inteiro, cada treino começa num grupo diferente para variar.
    const start = hybrid ? (index * perSession) % groups.length : 0;
    const rotated = groups.map((_, i) => groups[(start + i) % groups.length]);
    // Ênfase do objetivo: os grupos destacados vêm primeiro e ganham um exercício a mais.
    const slots = [...rotated.filter((group) => emphasis.includes(group)), ...rotated];
    for (let step = 0; items.length < perSession && step < slots.length * 3; step++) {
      const group = slots[step % slots.length];
      const option = pick(strength.filter((e) => e.group === group && notIn(items)(e)));
      if (option) items.push(take(option));
    }
    // Dia de outro foco (ex.: peito no objetivo "glúteos e pernas"): entra um exercício do grupo destacado.
    if (!hybrid) {
      const missing = emphasis.find((group) => !groups.includes(group) && strength.some((e) => e.group === group));
      const option = missing && pick(strength.filter((e) => e.group === missing && notIn(items)(e)));
      if (option) items.push(take(option));
    }
    // Agrupa por músculo, na ordem do treino (grandes primeiro), como se faz na academia.
    const order = [...groups, ...emphasis];
    items.sort((a, b) => order.indexOf(a.group) - order.indexOf(b.group));
    if (rule.cardio && cardio.length > 0) items.push(take(pick(cardio)));

    // Volta à calma: alongamentos dos grupos trabalhados e das regiões que o objetivo pede.
    const stretchGroups = [...new Set([...items.map((item) => item.group), ...(rule.stretchGroups ?? [])])];
    const coolDown = [];
    for (let round = 0; round < 2 && coolDown.length < (rule.stretches ?? 3); round++) {
      for (const group of stretchGroups) {
        if (coolDown.length >= (rule.stretches ?? 3)) break;
        const option = pick(stretches.filter((s) => s.group === group && notIn(coolDown)(s)));
        if (option) coolDown.push(take(option));
      }
    }
    const worked = new Set(items.map((item) => item.group));

    const focus = hybrid ? "Corpo inteiro" : joinLabels(groups.filter((group) => worked.has(group)).map((group) => GROUPS[group]));
    return {
      id: crypto.randomUUID(),
      name: `Treino ${LETTERS[index]}`,
      focus,
      notes: [WARM_UP, rule.note].filter(Boolean).join(" "),
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
