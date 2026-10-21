// Lembrete diário por Web Push: o navegador cria uma inscrição e o servidor
// (função send-reminders, a cada 5 minutos) manda a notificação no horário escolhido.
import { supabase } from "./cloud";

const VAPID_PUBLIC_KEY = import.meta.env.VITE_VAPID_PUBLIC_KEY;

function base64UrlToBytes(base64Url) {
  const base64 = (base64Url + "=".repeat((4 - (base64Url.length % 4)) % 4)).replaceAll("-", "+").replaceAll("_", "/");
  return Uint8Array.from(atob(base64), (char) => char.charCodeAt(0));
}

// "ok" | "ios" (precisa instalar o app) | "no-sw" (sem service worker, ex.: npm run dev) | "unsupported"
export async function reminderSupport() {
  const isIOS = /iPhone|iPad|iPod/.test(navigator.userAgent);
  if (!("serviceWorker" in navigator) || !("PushManager" in window)) return isIOS ? "ios" : "unsupported";
  if (!VAPID_PUBLIC_KEY || !supabase) return "unsupported";
  return (await navigator.serviceWorker.getRegistration()) ? "ok" : "no-sw";
}

async function registration() {
  return navigator.serviceWorker.ready;
}

export async function currentReminder() {
  const subscription = await (await registration()).pushManager.getSubscription();
  if (!subscription) return null;
  const { data } = await supabase.from("push_subscriptions").select("remind_at").eq("endpoint", subscription.endpoint).maybeSingle();
  return data ? { time: data.remind_at.slice(0, 5) } : null;
}

async function saveReminder(subscription, time, userId) {
  const { endpoint, keys } = subscription.toJSON();
  const { error } = await supabase.from("push_subscriptions").upsert({
    endpoint,
    user_id: userId,
    p256dh: keys.p256dh,
    auth: keys.auth,
    remind_at: time,
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    last_sent_on: null, // horário novo pode valer ainda hoje
  });
  if (error) throw error;
}

export async function enableReminder(time, userId) {
  const permission = await Notification.requestPermission();
  if (permission !== "granted") throw new Error("Permita as notificações deste site nas configurações do navegador.");

  const pushManager = (await registration()).pushManager;
  const subscription =
    (await pushManager.getSubscription()) ??
    (await pushManager.subscribe({ userVisibleOnly: true, applicationServerKey: base64UrlToBytes(VAPID_PUBLIC_KEY) }));
  await saveReminder(subscription, time, userId);
}

export async function updateReminderTime(time, userId) {
  const subscription = await (await registration()).pushManager.getSubscription();
  if (subscription) await saveReminder(subscription, time, userId);
}

export async function disableReminder() {
  if (!("serviceWorker" in navigator) || !(await navigator.serviceWorker.getRegistration())) return;
  const subscription = await (await registration()).pushManager.getSubscription();
  if (!subscription) return;
  await supabase.from("push_subscriptions").delete().eq("endpoint", subscription.endpoint);
  await subscription.unsubscribe();
}

export async function sendTestReminder() {
  const { data, error } = await supabase.functions.invoke("send-reminders", { body: { test: true } });
  if (error) throw error;
  return data;
}
