import assert from "node:assert/strict";
import { toDateKey, lastDays, getStreak } from "./dates.js";

const today = new Date(2026, 9, 21);

assert.equal(toDateKey(today), "2026-10-21");
assert.deepEqual(lastDays(3, today).map(toDateKey), ["2026-10-19", "2026-10-20", "2026-10-21"]);

assert.equal(getStreak([], today), 0);
assert.equal(getStreak(["2026-10-19", "2026-10-20", "2026-10-21"], today), 3);
assert.equal(getStreak(["2026-10-19", "2026-10-20"], today), 2, "hoje pendente não quebra a sequência");
assert.equal(getStreak(["2026-10-19", "2026-10-21"], today), 1, "um dia sem fazer quebra");
assert.equal(getStreak(["2026-09-30", "2026-10-01"], new Date(2026, 9, 1)), 2, "virada de mês");

console.log("dates: ok");
