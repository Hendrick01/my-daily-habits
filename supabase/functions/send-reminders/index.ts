// Envia os lembretes diários por Web Push.
//
// Chamada de dois jeitos:
//   - pelo agendamento (pg_cron, a cada 5 min), com o cabeçalho x-cron-secret;
//   - pelo app, com o login do usuário e { "test": true }, para mandar uma notificação de teste.
import webpush from "npm:web-push@3.6.7";
import { createClient } from "npm:@supabase/supabase-js@2";
import { fromDateKey } from "../_shared/dates.js";
import { isDueToday, sanitizeSchedule } from "../_shared/schedule.js";

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

async function pendingToday(userId: string, date: string) {
  const { data, error } = await supabase.from("habits").select("schedule, completed_dates").eq("user_id", userId).eq("deleted", false);
  if (error) throw error;
  const day = fromDateKey(date);
  return data.filter((row) => {
    const habit = { schedule: sanitizeSchedule(row.schedule), completedDates: row.completed_dates ?? [] };
    return isDueToday(habit, day) && !habit.completedDates.includes(date);
  }).length;
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
    for (const subscription of subscriptions ?? []) {
      const pending = await pendingToday(auth.user.id, localNow(subscription.timezone).date);
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
  for (const subscription of subscriptions as Subscription[]) {
    const now = localNow(subscription.timezone);
    if (subscription.last_sent_on === now.date || now.time < subscription.remind_at.slice(0, 5)) continue;

    // Marca o dia antes de enviar: no máximo um lembrete por dia, mesmo se tudo já estiver feito.
    await supabase.from("push_subscriptions").update({ last_sent_on: now.date }).eq("endpoint", subscription.endpoint);
    const pending = await pendingToday(subscription.user_id, now.date);
    if (pending > 0 && (await send(subscription, { title: "Hora dos seus hábitos", body: reminderText(pending), url: "/" }))) sent += 1;
  }

  return Response.json({ checked: subscriptions.length, sent });
});
