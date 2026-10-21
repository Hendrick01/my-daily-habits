import assert from "node:assert/strict";
import { toDateKey, fromDateKey, lastDays, startOfWeek } from "./dates.js";
import { sanitizeHabits } from "./habits.js";
import { mergeHabits, fromRow, toRow } from "./sync.js";
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
  [{ id: "a", title: "Ler", goal: "10 páginas", emoji: undefined, schedule: DAILY, updatedAt: undefined, deleted: undefined, completedDates: [key] }],
  "formato antigo é migrado",
);
assert.deepEqual(
  sanitizeHabits([1, null, { id: "b" }, { id: "c", title: "Correr", emoji: "🏃", schedule: mwf, completedDates: ["2026-10-20", "lixo", "2026-10-19", "2026-10-20"] }], key),
  [{ id: "c", title: "Correr", goal: undefined, emoji: "🏃", schedule: mwf, updatedAt: undefined, deleted: undefined, completedDates: ["2026-10-19", "2026-10-20"] }],
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
  assert.deepEqual(back, { ...habit, deleted: undefined }, "ida e volta pela tabela preserva o hábito");
  assert.equal(toRow(habit, "user-1").user_id, "user-1");
}

console.log("utils: ok");
