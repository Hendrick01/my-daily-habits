// Envia os lembretes diários por Web Push.
//
// Chamada de dois jeitos:
//   - pelo agendamento (pg_cron, a cada 5 min), com o cabeçalho x-cron-secret;
//   - pelo app, com o login do usuário e { "test": true }, para mandar uma notificação de teste.
import webpush from "npm:web-push@3.6.7";
import { createClient } from "npm:@supabase/supabase-js@2";
import { fromDateKey } from "../_shared/dates.js";
import { isDueToday, sanitizeSchedule } from "../_shared/schedule.js";
import { donePartIds, isPartReminderDue, isSplit, sanitizeParts, sanitizePartsDone } from "../_shared/parts.js";

const supabase = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);
webpush.setVapidDetails(Deno.env.get("VAPID_SUBJECT")!, Deno.env.get("VAPID_PUBLIC_KEY")!, Deno.env.get("VAPID_PRIVATE_KEY")!);

const cors = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

type Subscription = {
  endpoint: string;
  user_id: string;
  p256dh: string;
  auth: string;
  remind_at: string;
  timezone: string;
  last_sent_on: string | null;
  summary_enabled: boolean;
  parts_enabled: boolean;
  parts_sent: { date?: string; keys?: string[] };
};

type Habit = {
  id: string;
  title: string;
  emoji?: string;
  goal?: string;
  schedule: ReturnType<typeof sanitizeSchedule>;
  completedDates: string[];
  parts?: { id: string; label: string; time: string | null }[];
  partsDone?: Record<string, string[]>;
};

// Data e hora locais no fuso do aparelho que pediu o lembrete.
function localNow(timeZone: string) {
  let format: Intl.DateTimeFormat;
  try {
    format = new Intl.DateTimeFormat("en-CA", { timeZone, year: "numeric", month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit", hourCycle: "h23" });
  } catch {
    format = new Intl.DateTimeFormat("en-CA", { timeZone: "America/Sao_Paulo", year: "numeric", month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit", hourCycle: "h23" });
  }
  const parts = Object.fromEntries(format.formatToParts(new Date()).map((part) => [part.type, part.value]));
  const date = `${parts.year}-${parts.month}-${parts.day}`;
  return { date, time: `${parts.hour}:${parts.minute}` };
}

async function habitsOf(userId: string): Promise<Habit[]> {
  const { data, error } = await supabase
    .from("habits")
    .select("id, title, emoji, goal, schedule, completed_dates, parts, parts_done")
    .eq("user_id", userId)
    .eq("deleted", false);
  if (error) throw error;
  return data.map((row) => {
    const parts = sanitizeParts(row.parts);
    return {
      id: row.id,
      title: row.title,
      emoji: row.emoji ?? undefined,
      goal: row.goal ?? undefined,
      schedule: sanitizeSchedule(row.schedule),
      completedDates: row.completed_dates ?? [],
      parts,
      partsDone: sanitizePartsDone(row.parts_done, parts),
    };
  });
}

function pendingCount(habits: Habit[], date: string) {
  const day = fromDateKey(date);
  return habits.filter((habit) => isDueToday(habit, day) && !habit.completedDates.includes(date)).length;
}

// Partes com horário que chegaram agora e ainda não foram feitas nem avisadas hoje.
function partsToRemind(habits: Habit[], now: { date: string; time: string }, alreadySent: Set<string>) {
  const day = fromDateKey(now.date);
  const due = [];
  for (const habit of habits) {
    if (!habit.parts || !isDueToday(habit, day)) continue;
    const done = new Set(donePartIds(habit, now.date));
    habit.parts.forEach((part, index) => {
      const key = `${habit.id}:${part.id}`;
      if (!part.time || done.has(part.id) || alreadySent.has(key) || !isPartReminderDue(part.time, now.time)) return;
      due.push({
        key,
        payload: {
          title: `${habit.emoji ? `${habit.emoji} ` : ""}${habit.title}`,
          body: isSplit(habit)
            ? `Parte ${index + 1} de ${habit.parts!.length}${part.label ? ` · ${part.label}` : ""} — ${part.time}`
            : `Hora de fazer${habit.goal ? `: ${habit.goal}` : ""} (${part.time})`,
          url: `/habitos/${habit.id}`,
          tag: key,
        },
      });
    });
  }
  return due;
}

async function send(subscription: Subscription, payload: Record<string, string>) {
  try {
    await webpush.sendNotification(
      { endpoint: subscription.endpoint, keys: { p256dh: subscription.p256dh, auth: subscription.auth } },
      JSON.stringify(payload),
    );
    return true;
  } catch (error) {
    // 404/410: o navegador cancelou a inscrição; não adianta tentar de novo.
    if (error?.statusCode === 404 || error?.statusCode === 410) {
      await supabase.from("push_subscriptions").delete().eq("endpoint", subscription.endpoint);
    } else {
      console.error("falha ao enviar push", error?.statusCode, error?.body ?? error);
    }
    return false;
  }
}

function reminderText(pending: number) {
  return pending === 1 ? "1 hábito pendente hoje. Bora? 💪" : `${pending} hábitos pendentes hoje. Bora? 💪`;
}

Deno.serve(async (request) => {
  if (request.method === "OPTIONS") return new Response("ok", { headers: cors });

  // Teste pedido pelo app: manda agora para os aparelhos do próprio usuário.
  const body = await request.json().catch(() => ({}));
  if (body?.test) {
    const token = request.headers.get("Authorization")?.replace("Bearer ", "") ?? "";
    const { data: auth } = await supabase.auth.getUser(token);
    if (!auth?.user) return Response.json({ error: "não autenticado" }, { status: 401, headers: cors });

    const { data: subscriptions } = await supabase.from("push_subscriptions").select("*").eq("user_id", auth.user.id);
    let sent = 0;
    const habits = await habitsOf(auth.user.id);
    for (const subscription of subscriptions ?? []) {
      const pending = pendingCount(habits, localNow(subscription.timezone).date);
      const ok = await send(subscription, {
        title: "Teste do My Daily Habits",
        body: pending > 0 ? reminderText(pending) : "Tudo feito hoje. Os lembretes estão funcionando! ✅",
        url: "/",
      });
      if (ok) sent += 1;
    }
    return Response.json({ devices: subscriptions?.length ?? 0, sent }, { headers: cors });
  }

  // Agendamento: só com o segredo do cron.
  if (request.headers.get("x-cron-secret") !== Deno.env.get("CRON_SECRET")) {
    return Response.json({ error: "não autorizado" }, { status: 401, headers: cors });
  }

  const { data: subscriptions, error } = await supabase.from("push_subscriptions").select("*");
  if (error) return Response.json({ error: error.message }, { status: 500 });

  let sent = 0;
  let partsSent = 0;
  const habitsByUser = new Map<string, Promise<Habit[]>>();
  const habitsFor = (userId: string) => {
    if (!habitsByUser.has(userId)) habitsByUser.set(userId, habitsOf(userId));
    return habitsByUser.get(userId)!;
  };

  for (const subscription of subscriptions as Subscription[]) {
    const now = localNow(subscription.timezone);

    // Resumo do dia: no máximo um por dia, mesmo se tudo já estiver feito.
    const summaryDue = subscription.summary_enabled !== false && subscription.last_sent_on !== now.date && now.time >= subscription.remind_at.slice(0, 5);
    if (summaryDue) {
      await supabase.from("push_subscriptions").update({ last_sent_on: now.date }).eq("endpoint", subscription.endpoint);
      const pending = pendingCount(await habitsFor(subscription.user_id), now.date);
      if (pending > 0 && (await send(subscription, { title: "Hora dos seus hábitos", body: reminderText(pending), url: "/" }))) sent += 1;
    }

    // Partes com horário: um aviso por parte por dia.
    if (subscription.parts_enabled === false) continue;
    const alreadySent = new Set(subscription.parts_sent?.date === now.date ? subscription.parts_sent.keys ?? [] : []);
    const due = partsToRemind(await habitsFor(subscription.user_id), now, alreadySent);
    if (due.length === 0) continue;
    await supabase
      .from("push_subscriptions")
      .update({ parts_sent: { date: now.date, keys: [...alreadySent, ...due.map((item) => item.key)] } })
      .eq("endpoint", subscription.endpoint);
    for (const item of due) {
      if (await send(subscription, item.payload)) partsSent += 1;
    }
  }

  return Response.json({ checked: subscriptions.length, sent, partsSent });
});
