// Dias como texto "AAAA-MM-DD" no fuso local: comparar dias sem se preocupar com horas.
export function toDateKey(date = new Date()) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

// Os últimos `count` dias, do mais antigo até `from`.
export function lastDays(count, from = new Date()) {
  return Array.from({ length: count }, (_, index) => {
    const day = new Date(from);
    day.setDate(from.getDate() - (count - 1 - index));
    return day;
  });
}

// Dias seguidos feitos. Se hoje ainda está pendente, a sequência de ontem continua valendo.
export function getStreak(completedDates, today = new Date()) {
  const done = new Set(completedDates);
  const day = new Date(today);
  if (!done.has(toDateKey(day))) day.setDate(day.getDate() - 1);

  let streak = 0;
  while (done.has(toDateKey(day))) {
    streak += 1;
    day.setDate(day.getDate() - 1);
  }
  return streak;
}
