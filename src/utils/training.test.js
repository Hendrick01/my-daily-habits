import assert from "node:assert/strict";
import { EXERCISES } from "../data/exercises.js";
import { GOALS, GOAL_RULES, describeGoal, filterExercises, videoUrlFor, bmi, bmiCategory, waistToHeight, needsMedicalClearance, prescription, exercisesFor, buildPlan, planToCsv, exercisesPerSession, joinLabels } from "./training.js";

const byId = Object.fromEntries(EXERCISES.map((exercise) => [exercise.id, exercise]));
const profile = (extra = {}) => ({
  age: 30, weight: 70, height: 175, goal: "hipertrofia", level: 2, days: 3, minutes: 60,
  place: "academia", style: "focado", restrictions: [], parq: [], ...extra,
});

// ---------- avaliação ----------

assert.equal(bmi(70, 175), 22.9);
assert.equal(bmi(0, 175), null);
assert.equal(bmiCategory(17), "Abaixo do peso");
assert.equal(bmiCategory(22.9), "Peso adequado");
assert.equal(bmiCategory(27), "Sobrepeso");
assert.equal(bmiCategory(41), "Obesidade grau III");
assert.equal(waistToHeight(90, 175), 0.51);
assert.equal(needsMedicalClearance(profile()), false);
assert.equal(needsMedicalClearance(profile({ parq: [false, true] })), true, "um 'sim' no PAR-Q pede liberação médica");

// ---------- prescrição ----------

assert.deepEqual(prescription(byId["supino-reto"], profile()), { sets: 4, reps: "8–12", rest: 75 });
assert.equal(prescription(byId["supino-reto"], profile({ level: 1 })).sets, 3, "iniciante faz uma série a menos");
assert.deepEqual(prescription(byId["supino-reto"], profile({ goal: "forca" })), { sets: 5, reps: "4–6", rest: 150 });
assert.equal(prescription(byId.prancha, profile({ level: 3 })).reps, "60 s", "exercício de tempo usa segundos");
assert.equal(prescription(byId["along-ombro"], profile()).reps, "30 s");
assert.equal(exercisesPerSession(60), 6);
assert.equal(exercisesPerSession(20), 3);
assert.equal(joinLabels(["Peito", "Ombros", "Tríceps"]), "Peito, Ombros e Tríceps");

// ---------- filtro por perfil ----------

const home = exercisesFor(profile({ place: "casa", level: 3 }));
assert.ok(home.every((exercise) => ["peso-corporal", "corda"].includes(exercise.equipment)), "em casa sem equipamento, só peso corporal");
assert.ok(exercisesFor(profile({ restrictions: ["joelho"] })).every((exercise) => !exercise.cautions.includes("joelho")), "restrição de joelho é respeitada");
assert.ok(exercisesFor(profile({ level: 1 })).every((exercise) => exercise.level === 1), "iniciante só recebe exercícios de nível 1");

// ---------- plano ----------

const split = buildPlan(profile());
assert.equal(split.length, 3, "3 dias focados = treinos A, B e C");
assert.deepEqual(split.map((workout) => workout.name), ["Treino A", "Treino B", "Treino C"]);
assert.ok(split[0].items.some((item) => item.group === "peito") && !split[0].items.some((item) => item.group === "pernas" && byId[item.exerciseId].type === "forca"), "treino A é de peito, sem pernas");
assert.ok(split.every((workout) => workout.items.filter((item) => byId[item.exerciseId].type === "forca").length === 6), "60 min = 6 exercícios principais");
assert.deepEqual(split[0].items.slice(0, 6).map((item) => item.group), ["peito", "peito", "ombros", "ombros", "triceps", "triceps"], "agrupado por músculo, grandes primeiro");
assert.ok(!split[2].items.some((item) => item.exerciseId === "agachamento"), "na academia, peso corporal só se faltar opção");
assert.equal(split[1].focus, "Costas, Bíceps e Abdômen");
assert.ok(split.every((workout) => workout.items.some((item) => byId[item.exerciseId].type === "alongamento")), "todo treino termina com alongamento");

const hybrid = buildPlan(profile({ style: "hibrido", days: 4, minutes: 45 }));
assert.equal(hybrid.length, 3, "corpo inteiro: no máximo 3 treinos para alternar");
assert.ok(hybrid.every((workout) => workout.focus === "Corpo inteiro"));
const firstExercises = hybrid.map((workout) => workout.items[0].exerciseId);
assert.equal(new Set(firstExercises).size, 3, "treinos de corpo inteiro variam entre si");

const cut = buildPlan(profile({ goal: "emagrecer", place: "casa", style: "hibrido", days: 2, level: 1 }));
assert.ok(cut.every((workout) => workout.items.some((item) => byId[item.exerciseId].type === "cardio")), "emagrecer inclui cardio");
assert.ok(cut.flatMap((workout) => workout.items).every((item) => ["peso-corporal", "corda"].includes(byId[item.exerciseId].equipment)));

const stretching = buildPlan(profile({ style: "alongamento", days: 5, minutes: 30 }));
assert.equal(stretching.length, 2, "alongamento: até 2 rotinas");
assert.ok(stretching.flatMap((workout) => workout.items).every((item) => byId[item.exerciseId].type === "alongamento"));
assert.ok(stretching[0].items.length >= 8, "rotina de 30 min tem pelo menos 8 alongamentos");

const knee = buildPlan(profile({ restrictions: ["joelho", "lombar"] }));
assert.ok(knee.flatMap((workout) => workout.items).every((item) => !byId[item.exerciseId].cautions.some((c) => c === "joelho" || c === "lombar")));

// ---------- objetivos ----------

const strengthItems = (workout) => workout.items.filter((item) => byId[item.exerciseId].type === "forca");
const stretchItems = (workout) => workout.items.filter((item) => byId[item.exerciseId].type === "alongamento");

assert.equal(Object.keys(GOALS).length, 15, "15 objetivos");
assert.ok(Object.values(GOAL_RULES).every((rule) => rule.label && rule.sets >= 2 && rule.reps && rule.rest > 0));
assert.equal(describeGoal("gluteos-pernas"), "4 séries de 10–15 · descanso de 60 s · mais Glúteos e Pernas");
assert.match(describeGoal("gluteos-pernas", 1), /^3 séries/, "iniciante: uma série a menos");
assert.equal(describeGoal("objetivo-que-nao-existe"), describeGoal("saude"), "objetivo desconhecido cai em saúde");

const glutes = buildPlan(profile({ goal: "gluteos-pernas" }));
assert.ok(["gluteos", "pernas"].includes(strengthItems(glutes[0]).at(-1).group), "dia de peito ganha um exercício de glúteo ou perna");
assert.ok(strengthItems(glutes[2]).filter((item) => ["gluteos", "pernas"].includes(item.group)).length >= 4, "dia de pernas concentra glúteos e pernas");

const arms = buildPlan(profile({ goal: "bracos", style: "hibrido", days: 3 }));
assert.ok(arms.every((workout) => ["biceps", "triceps", "ombros"].includes(strengthItems(workout)[0].group) || strengthItems(workout).some((i) => ["biceps", "triceps"].includes(i.group))));

const posture = buildPlan(profile({ goal: "postura" }));
assert.ok(posture.every((workout) => stretchItems(workout).length === 5), "postura termina com 5 alongamentos");
assert.ok(posture.every((workout) => stretchItems(workout).some((item) => item.group === "peito")), "postura sempre alonga o peitoral");
assert.ok(posture.every((workout) => /coluna/.test(workout.notes)));

const comeback = buildPlan(profile({ goal: "retorno", level: 3 }));
assert.ok(comeback.flatMap((w) => w.items).every((item) => byId[item.exerciseId].level === 1), "voltar a treinar usa só exercícios simples");
assert.ok(comeback.flatMap(strengthItems).every((item) => item.sets === 2));

const elderly = buildPlan(profile({ goal: "equilibrio", level: 2, style: "hibrido", days: 2 }));
assert.ok(elderly.flatMap((w) => w.items).every((item) => byId[item.exerciseId].level === 1));
assert.ok(elderly.every((workout) => /apoio firme/.test(workout.notes)));
assert.ok(elderly.flatMap((w) => w.items).every((item) => !["flexao", "mergulho-banco"].includes(item.exerciseId)), "60+ dispensa flexão no chão e mergulho");
assert.equal(prescription(byId.prancha, profile({ goal: "equilibrio", level: 3 })).reps, "20 s", "tempo segue o nível limitado pelo objetivo");

const power = buildPlan(profile({ goal: "potencia" }));
assert.equal(strengthItems(power[0])[0].reps, "3–6 rápidas");
assert.ok(power.every((workout) => workout.items.some((item) => byId[item.exerciseId].type === "cardio")));

const running = buildPlan(profile({ goal: "corrida" }));
assert.ok(running.every((workout) => strengthItems(workout).some((item) => ["pernas", "panturrilhas", "abdomen"].includes(item.group))), "corrida trabalha pernas ou core todo dia");

// ---------- planilha ----------

const csv = planToCsv({ profile: profile(), workouts: [{ name: "Treino A", focus: "Peito", items: [{ name: 'Supino "pesado"; com barra', group: "peito", sets: 4, reps: "8–12", load: "40", rest: 75, notes: "" }] }] }, new Date(2026, 9, 22));
assert.ok(csv.startsWith("﻿"), "BOM para o Excel reconhecer acentos");
assert.ok(csv.includes("Gerado em;22/10/2026"));
assert.ok(csv.includes("IMC;22,9 (Peso adequado)"));
assert.ok(csv.includes('Treino A;Peito;1;"Supino ""pesado""; com barra";Peito;4;8–12;40;75;'), "célula com ; e aspas é escapada");

// ---------- busca ----------

assert.ok(filterExercises(EXERCISES, { query: "supino" }).length >= 3);
assert.deepEqual(filterExercises(EXERCISES, { query: "TRICEPS testa" }).map((e) => e.id), ["triceps-testa"], "ignora acentos e maiúsculas");
assert.ok(filterExercises(EXERCISES, { type: "alongamento", group: "costas" }).every((e) => e.type === "alongamento" && e.group === "costas"));
assert.match(videoUrlFor(byId.prancha), /^https:\/\/www\.youtube\.com\/results\?search_query=como%20fazer%20Prancha/);
assert.equal(videoUrlFor({ name: "X", videoUrl: "https://youtu.be/abc" }), "https://youtu.be/abc");
assert.match(videoUrlFor({ name: "X", videoUrl: "javascript:alert(1)" }), /^https:\/\/www\.youtube\.com/, "link perigoso é ignorado");

console.log("training: ok");
