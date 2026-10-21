// Dias como texto "AAAA-MM-DD" no fuso local: comparar dias sem se preocupar com horas.
export function toDateKey(date = new Date()) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function fromDateKey(key) {
  const [year, month, day] = key.split("-").map(Number);
  return new Date(year, month - 1, day);
}

export function addDays(date, amount) {
  const day = new Date(date);
  day.setDate(day.getDate() + amount);
  return day;
}

// Semana começando no domingo, como no calendário brasileiro.
export function startOfWeek(date) {
  return addDays(new Date(date.getFullYear(), date.getMonth(), date.getDate()), -date.getDay());
}

// Os últimos `count` dias, do mais antigo até `from`.
export function lastDays(count, from = new Date()) {
  return Array.from({ length: count }, (_, index) => addDays(from, index - (count - 1)));
}
