// Junta os hábitos do aparelho com os da nuvem.
// Regra: para cada hábito, vence a edição mais recente (updatedAt). Exclusões viram
// "lápides" (deleted: true) para chegar aos outros aparelhos.
// Hábitos nunca editados (os 3 iniciais de um aparelho novo) só sobem se a conta estiver vazia.
const NEVER = new Date(0).toISOString();

export function mergeHabits(local, remote) {
  const remoteById = new Map(remote.map((habit) => [habit.id, habit]));
  const localIds = new Set(local.map((habit) => habit.id));
  const merged = [];
  const toPush = [];

  for (const habit of local) {
    const other = remoteById.get(habit.id);

    if (!habit.updatedAt) {
      if (other) merged.push(other);
      else if (remote.length === 0) {
        const stamped = { ...habit, updatedAt: NEVER };
        merged.push(stamped);
        toPush.push(stamped);
      }
      continue;
    }

    if (!other || habit.updatedAt > other.updatedAt) {
      merged.push(habit);
      toPush.push(habit);
    } else {
      merged.push(other);
    }
  }

  for (const habit of remote) {
    if (!localIds.has(habit.id)) merged.push(habit);
  }

  return { merged, toPush };
}

export function toRow(habit, userId) {
  return {
    user_id: userId,
    id: habit.id,
    title: habit.title,
    goal: habit.goal ?? null,
    emoji: habit.emoji ?? null,
    schedule: habit.schedule,
    completed_dates: habit.completedDates,
    deleted: habit.deleted === true,
    updated_at: habit.updatedAt,
  };
}

export function fromRow(row) {
  return {
    id: row.id,
    title: row.title,
    goal: row.goal ?? undefined,
    emoji: row.emoji ?? undefined,
    schedule: row.schedule,
    completedDates: row.completed_dates ?? [],
    deleted: row.deleted || undefined,
    updatedAt: row.updated_at,
  };
}
