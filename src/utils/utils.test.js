import assert from "node:assert/strict";
import { toDateKey, fromDateKey, lastDays, getStreak, getBestStreak } from "./dates.js";
import { sanitizeHabits } from "./habits.js";

// ---------- datas ----------

const today = new Date(2026, 9, 21);

assert.equal(toDateKey(today), "2026-10-21");
assert.equal(toDateKey(fromDateKey("2026-10-21")), "2026-10-21");
assert.deepEqual(lastDays(3, today).map(toDateKey), ["2026-10-19", "2026-10-20", "2026-10-21"]);

assert.equal(getStreak([], today), 0);
assert.equal(getStreak(["2026-10-19", "2026-10-20", "2026-10-21"], today), 3);
assert.equal(getStreak(["2026-10-19", "2026-10-20"], today), 2, "hoje pendente não quebra a sequência");
assert.equal(getStreak(["2026-10-19", "2026-10-21"], today), 1, "um dia sem fazer quebra");
assert.equal(getStreak(["2026-09-30", "2026-10-01"], new Date(2026, 9, 1)), 2, "virada de mês");

assert.equal(getBestStreak([]), 0);
assert.equal(getBestStreak(["2026-10-07", "2026-10-01", "2026-10-02", "2026-10-05", "2026-10-06"]), 3, "fora de ordem");
assert.equal(getBestStreak(["2026-09-29", "2026-09-30", "2026-10-01", "2026-10-03"]), 3, "atravessa o mês");

// ---------- limpeza de dados ----------

const key = "2026-10-21";

assert.deepEqual(sanitizeHabits("{oops", key), [], "não é lista");
assert.deepEqual(
  sanitizeHabits([{ id: "a", title: "Ler", goal: "10 páginas", completed: true }], key),
  [{ id: "a", title: "Ler", goal: "10 páginas", emoji: undefined, completedDates: [key] }],
  "formato antigo é migrado",
);
assert.deepEqual(
  sanitizeHabits([1, null, { id: "b" }, { id: "c", title: "Correr", emoji: "🏃", completedDates: ["2026-10-20", "lixo", "2026-10-19", "2026-10-20"] }], key),
  [{ id: "c", title: "Correr", goal: undefined, emoji: "🏃", completedDates: ["2026-10-19", "2026-10-20"] }],
  "descarta itens inválidos, datas ruins e repetidas; mantém o emoji",
);
assert.equal(sanitizeHabits([{ id: "e", title: "X", emoji: 42 }], key)[0].emoji, undefined, "emoji que não é texto é descartado");
assert.equal(sanitizeHabits([{ id: "d", title: "A" }, { id: "d", title: "B" }], key).length, 1, "id repetido entra uma vez");

console.log("utils: ok");
