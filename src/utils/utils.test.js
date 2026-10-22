import assert from "node:assert/strict";
import { toDateKey, fromDateKey, lastDays, startOfWeek } from "./dates.js";
import { sanitizeHabits } from "./habits.js";
import { mergeHabits, fromRow, toRow } from "./sync.js";
import { sanitizeParts, sanitizePartsDone, togglePart, toggleDay, nextPartToToggle, partProgress, donePartIds, isPartReminderDue, partLabel } from "./parts.js";
import { DAILY, sanitizeSchedule, describeSchedule, isDueToday, getStreak, getBestStreak, getWeekCount } from "./schedule.js";

// Quarta-feira, 21/10/2026.
const today = new Date(2026, 9, 21);
const habit = (completedDates, schedule = DAILY) => ({ completedDates, schedule });

// ---------- datas ----------

assert.equal(toDateKey(today), "2026-10-21");
assert.equal(toDateKey(fromDateKey("2026-10-21")), "2026-10-21");
assert.deepEqual(lastDays(3, today).map(toDateKey), ["2026-10-19", "2026-10-20", "2026-10-21"]);
assert.equal(toDateKey(startOfWeek(today)), "2026-10-18", "semana começa no domingo");

// ---------- todo dia ----------

assert.equal(getStreak(habit([]), today), 0);
assert.equal(getStreak(habit(["2026-10-19", "2026-10-20", "2026-10-21"]), today), 3);
assert.equal(getStreak(habit(["2026-10-19", "2026-10-20"]), today), 2, "hoje pendente não quebra a sequência");
assert.equal(getStreak(habit(["2026-10-19", "2026-10-21"]), today), 1, "um dia sem fazer quebra");
assert.equal(getStreak(habit(["2026-09-30", "2026-10-01"]), new Date(2026, 9, 1)), 2, "virada de mês");
assert.equal(getBestStreak(habit([]), today), 0);
assert.equal(getBestStreak(habit(["2026-10-07", "2026-10-01", "2026-10-02", "2026-10-05", "2026-10-06"]), today), 3, "fora de ordem");
assert.equal(getBestStreak(habit(["2026-09-29", "2026-09-30", "2026-10-01", "2026-10-03"]), today), 3, "atravessa o mês");

// ---------- dias da semana (seg, qua, sex) ----------

const mwf = { type: "weekdays", days: [1, 3, 5] };
assert.equal(isDueToday(habit([], mwf), today), true, "quarta está na lista");
assert.equal(isDueToday(habit([], mwf), new Date(2026, 9, 20)), false, "terça não está");
assert.equal(getStreak(habit(["2026-10-16", "2026-10-19", "2026-10-21"], mwf), today), 3, "sex, seg, qua: pula os dias de folga");
assert.equal(getStreak(habit(["2026-10-16", "2026-10-19"], mwf), today), 2, "quarta ainda pendente não quebra");
assert.equal(getStreak(habit(["2026-10-14", "2026-10-19"], mwf), today), 1, "faltou na sexta: quebra");
assert.equal(getBestStreak(habit(["2026-10-12", "2026-10-14", "2026-10-19"], mwf), today), 2, "seg e qua seguidos, sexta falhou");

// ---------- vezes por semana (3x) ----------

const thrice = { type: "weekly", times: 3 };
const lastWeek = ["2026-10-11", "2026-10-13", "2026-10-17"];
const weekBefore = ["2026-10-05", "2026-10-06", "2026-10-07"];
assert.equal(getWeekCount(habit(["2026-10-18", "2026-10-20"], thrice), today), 2);
assert.equal(isDueToday(habit(["2026-10-18", "2026-10-20"], thrice), today), true, "ainda falta 1 na semana");
assert.equal(isDueToday(habit(["2026-10-18", "2026-10-19", "2026-10-20"], thrice), today), false, "meta da semana batida");
assert.equal(getStreak(habit([...weekBefore, ...lastWeek], thrice), today), 2, "semana atual em andamento não quebra");
assert.equal(getStreak(habit([...weekBefore, ...lastWeek, "2026-10-18", "2026-10-19", "2026-10-21"], thrice), today), 3);
assert.equal(getStreak(habit([...weekBefore, "2026-10-13"], thrice), today), 0, "semana passada ficou abaixo da meta");
assert.equal(getBestStreak(habit([...weekBefore, ...lastWeek], thrice), today), 2);

// ---------- frequência vinda de fora ----------

assert.deepEqual(sanitizeSchedule(undefined), DAILY);
assert.deepEqual(sanitizeSchedule({ type: "weekdays", days: [5, 1, 1, 9, "x"] }), { type: "weekdays", days: [1, 5] });
assert.deepEqual(sanitizeSchedule({ type: "weekdays", days: [0, 1, 2, 3, 4, 5, 6] }), DAILY, "todos os dias = todo dia");
assert.deepEqual(sanitizeSchedule({ type: "weekly", times: 9 }), DAILY);
assert.equal(describeSchedule(mwf), "Seg, Qua, Sex");
assert.equal(describeSchedule(thrice), "3x por semana");

// ---------- limpeza de dados ----------

const key = "2026-10-21";

assert.deepEqual(sanitizeHabits("{oops", key), [], "não é lista");
assert.deepEqual(
  sanitizeHabits([{ id: "a", title: "Ler", goal: "10 páginas", completed: true }], key),
  [{ id: "a", title: "Ler", goal: "10 páginas", emoji: undefined, schedule: DAILY, parts: undefined, partsDone: undefined, updatedAt: undefined, deleted: undefined, completedDates: [key] }],
  "formato antigo é migrado",
);
assert.deepEqual(
  sanitizeHabits([1, null, { id: "b" }, { id: "c", title: "Correr", emoji: "🏃", schedule: mwf, completedDates: ["2026-10-20", "lixo", "2026-10-19", "2026-10-20"] }], key),
  [{ id: "c", title: "Correr", goal: undefined, emoji: "🏃", schedule: mwf, parts: undefined, partsDone: undefined, updatedAt: undefined, deleted: undefined, completedDates: ["2026-10-19", "2026-10-20"] }],
  "descarta itens inválidos, datas ruins e repetidas; mantém emoji e frequência",
);
assert.equal(sanitizeHabits([{ id: "e", title: "X", emoji: 42 }], key)[0].emoji, undefined, "emoji que não é texto é descartado");
assert.equal(sanitizeHabits([{ id: "d", title: "A" }, { id: "d", title: "B" }], key).length, 1, "id repetido entra uma vez");

assert.equal(
  sanitizeHabits([{ id: "f", title: "X", updatedAt: "2026-10-21T19:40:00.123+00:00", deleted: true }], key)[0].updatedAt,
  "2026-10-21T19:40:00.123Z",
  "data da nuvem é normalizada para comparar como texto",
);

// ---------- sincronização ----------

const h = (id, updatedAt, extra = {}) => ({ id, title: id, schedule: DAILY, completedDates: [], updatedAt, ...extra });
const t1 = "2026-10-21T10:00:00.000Z";
const t2 = "2026-10-21T11:00:00.000Z";

{
  const { merged, toPush } = mergeHabits([h("a", t2, { title: "local" })], [h("a", t1, { title: "nuvem" })]);
  assert.equal(merged[0].title, "local", "edição local mais nova vence");
  assert.equal(toPush.length, 1);
}
{
  const { merged, toPush } = mergeHabits([h("a", t1, { title: "local" })], [h("a", t2, { title: "nuvem" })]);
  assert.equal(merged[0].title, "nuvem", "edição da nuvem mais nova vence");
  assert.equal(toPush.length, 0);
}
{
  const { merged, toPush } = mergeHabits([h("a", t1)], [h("a", t1), h("b", t1)]);
  assert.deepEqual(merged.map((x) => x.id), ["a", "b"], "o que só existe na nuvem desce");
  assert.equal(toPush.length, 0, "empate não sobe nada");
}
{
  const { merged, toPush } = mergeHabits([h("a", t2, { deleted: true })], [h("a", t1)]);
  assert.equal(merged[0].deleted, true, "exclusão local mais nova vence");
  assert.equal(toPush[0].deleted, true);
}
{
  const { merged, toPush } = mergeHabits([h("water", undefined)], []);
  assert.equal(toPush.length, 1, "conta vazia recebe os hábitos iniciais");
  assert.equal(merged[0].updatedAt, new Date(0).toISOString());
}
{
  const { merged, toPush } = mergeHabits([h("water", undefined), h("walk", undefined)], [h("water", t1, { title: "da nuvem" }), h("x", t1)]);
  assert.deepEqual(merged.map((x) => x.id), ["water", "x"], "aparelho novo não suja uma conta com dados");
  assert.equal(merged[0].title, "da nuvem");
  assert.equal(toPush.length, 0);
}
{
  const habit = h("a", t1, { goal: "1x", emoji: "💧", completedDates: [key] });
  const back = fromRow({ ...toRow(habit, "user-1"), updated_at: t1 });
  assert.deepEqual(back, { ...habit, parts: undefined, partsDone: undefined, deleted: undefined }, "ida e volta pela tabela preserva o hábito");
  const split = { ...habit, parts: [{ id: "p1", label: "", time: "08:00" }, { id: "p2", label: "Noite", time: null }], partsDone: { [key]: ["p1"] } };
  assert.deepEqual(fromRow({ ...toRow(split, "user-1"), updated_at: t1 }), { ...split, deleted: undefined }, "partes também vão e voltam");
  assert.equal(toRow(habit, "user-1").user_id, "user-1");
}

// ---------- partes do dia ----------

const water = {
  completedDates: [],
  parts: sanitizeParts([{ id: "a", time: "08:00" }, { id: "b", label: " Almoço ", time: "12:00" }, { id: "c", time: "25:00" }, { id: "a" }, { label: "sem id" }]),
};
assert.deepEqual(water.parts, [{ id: "a", label: "", time: "08:00" }, { id: "b", label: "Almoço", time: "12:00" }, { id: "c", label: "", time: null }], "partes inválidas e repetidas saem; horário ruim vira null");
assert.equal(sanitizeParts([]), undefined, "lista vazia = hábito sem partes");
assert.deepEqual(sanitizePartsDone({ [key]: ["a", "x", "a"], lixo: ["a"], "2026-10-20": [] }, water.parts), { [key]: ["a"] });
assert.equal(partLabel(water.parts[0], 0), "08:00");
assert.equal(partLabel(water.parts[1], 1), "Almoço");
assert.equal(partLabel(water.parts[2], 2), "Parte 3");

let w = togglePart(water, "b", key);
assert.deepEqual(partProgress(w, key), { done: 1, total: 3 });
assert.equal(w.completedDates.includes(key), false, "parcial não conclui o dia");
assert.equal(nextPartToToggle(w, key), "a", "botão principal marca a próxima pendente");
w = togglePart(togglePart(w, "a", key), "c", key);
assert.deepEqual(w.completedDates, [key], "todas as partes = dia concluído");
assert.equal(w.partsDone, undefined, "dia completo não guarda parcial");
assert.equal(nextPartToToggle(w, key), "c", "com tudo feito, o botão desmarca a última");
w = togglePart(w, "c", key);
assert.deepEqual(donePartIds(w, key), ["a", "b"]);
assert.deepEqual(w.completedDates, [], "desmarcar uma parte reabre o dia");
assert.deepEqual(toggleDay(w, key).completedDates, [key], "marcar o dia inteiro conclui tudo");
assert.equal(toggleDay(w, key).partsDone, undefined);

const old = togglePart({ ...water, partsDone: { "2026-09-01": ["a"] } }, "a", key);
assert.equal(old.partsDone["2026-09-01"], undefined, "progresso parcial antigo é descartado");

assert.equal(isPartReminderDue("08:00", "08:00"), true);
assert.equal(isPartReminderDue("08:00", "08:29"), true);
assert.equal(isPartReminderDue("08:00", "08:30"), false, "passou da janela de 30 min");
assert.equal(isPartReminderDue("08:00", "07:59"), false, "ainda não chegou a hora");

console.log("utils: ok");
