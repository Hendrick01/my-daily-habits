import { addDays, fromDateKey, toDateKey } from "./dates.js";

// Partes do dia: um hábito pode ser dividido em partes (ex.: 4 copos de água, remédio de manhã
// e à noite). Cada parte pode ter um nome e um horário; o horário vira lembrete.
// Sem `parts`, o hábito é uma coisa só. O dia conta como concluído quando todas as partes estão feitas.
//   parts:     [{ id, label, time }]               time = "HH:MM" ou null
//   partsDone: { "AAAA-MM-DD": [ids feitos] }      só dias parciais; dia completo vai para completedDates

export const MAX_PARTS = 12;
const TIME = /^([01]\d|2[0-3]):[0-5]\d$/;
const DATE_KEY = /^\d{4}-\d{2}-\d{2}$/;
const KEEP_DAYS = 14;

export function sanitizeParts(parts) {
  if (!Array.isArray(parts)) return undefined;
  const seen = new Set();
  const clean = parts
    .filter((part) => part && typeof part.id === "string" && part.id.length <= 40 && !seen.has(part.id) && seen.add(part.id))
    .slice(0, MAX_PARTS)
    .map((part) => ({
      id: part.id,
      label: typeof part.label === "string" ? part.label.trim().slice(0, 40) : "",
      time: TIME.test(part.time) ? part.time : null,
    }));
  return clean.length > 0 ? clean : undefined;
}

export function sanitizePartsDone(value, parts) {
  if (!parts || value === null || typeof value !== "object" || Array.isArray(value)) return undefined;
  const ids = new Set(parts.map((part) => part.id));
  const clean = {};
  for (const [date, list] of Object.entries(value)) {
    if (!DATE_KEY.test(date) || !Array.isArray(list)) continue;
    const valid = [...new Set(list.filter((id) => ids.has(id)))];
    if (valid.length > 0) clean[date] = valid;
  }
  return Object.keys(clean).length > 0 ? clean : undefined;
}

export function isSplit(habit) {
  return (habit.parts?.length ?? 0) > 1;
}

export function partLabel(part, index) {
  return part.label || part.time || `Parte ${index + 1}`;
}

export function donePartIds(habit, date) {
  if (habit.completedDates.includes(date)) return (habit.parts ?? []).map((part) => part.id);
  return habit.partsDone?.[date] ?? [];
}

export function partProgress(habit, date) {
  if (!isSplit(habit)) return { done: habit.completedDates.includes(date) ? 1 : 0, total: 1 };
  return { done: donePartIds(habit, date).length, total: habit.parts.length };
}

// Mantém só as últimas 2 semanas de progresso parcial (dias completos ficam em completedDates).
function prune(partsDone, today) {
  const cutoff = toDateKey(addDays(fromDateKey(today), -KEEP_DAYS));
  const kept = Object.fromEntries(Object.entries(partsDone).filter(([date]) => date >= cutoff));
  return Object.keys(kept).length > 0 ? kept : undefined;
}

// Liga/desliga uma parte num dia. Com todas feitas, o dia entra em completedDates.
export function togglePart(habit, partId, date) {
  const ids = habit.parts.map((part) => part.id);
  const done = new Set(donePartIds(habit, date));
  if (done.has(partId)) done.delete(partId);
  else done.add(partId);

  const allDone = ids.every((id) => done.has(id));
  const partsDone = { ...habit.partsDone };
  if (allDone || done.size === 0) delete partsDone[date];
  else partsDone[date] = ids.filter((id) => done.has(id));

  return {
    ...habit,
    partsDone: prune(partsDone, date),
    completedDates: allDone
      ? [...new Set([...habit.completedDates, date])].sort()
      : habit.completedDates.filter((day) => day !== date),
  };
}

// Marca ou desmarca o dia inteiro (todas as partes de uma vez).
export function toggleDay(habit, date) {
  const partsDone = { ...habit.partsDone };
  delete partsDone[date];
  return {
    ...habit,
    partsDone: Object.keys(partsDone).length > 0 ? partsDone : undefined,
    completedDates: habit.completedDates.includes(date)
      ? habit.completedDates.filter((day) => day !== date)
      : [...habit.completedDates, date].sort(),
  };
}

// Botão principal do cartão: marca a próxima parte pendente; com tudo feito, desmarca a última.
export function nextPartToToggle(habit, date) {
  const done = new Set(donePartIds(habit, date));
  return (habit.parts.find((part) => !done.has(part.id)) ?? habit.parts.at(-1)).id;
}

// O lembrete de uma parte vale da hora marcada até 30 min depois (o agendamento roda a cada 5 min).
export function isPartReminderDue(partTime, nowTime, windowMinutes = 30) {
  const minutes = (time) => Number(time.slice(0, 2)) * 60 + Number(time.slice(3, 5));
  const diff = minutes(nowTime) - minutes(partTime);
  return diff >= 0 && diff < windowMinutes;
}
