import { createClient } from "@supabase/supabase-js";
import { fromRow, toRow } from "../utils/sync";

const url = import.meta.env.VITE_SUPABASE_URL;
const key = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

// Sem as variáveis de ambiente, o app funciona só no navegador, como antes.
export const supabase = url && key ? createClient(url, key) : null;

const authMessages = [
  [/invalid login credentials/i, "E-mail ou senha incorretos."],
  [/already registered|already been registered/i, "Este e-mail já tem conta. Use “Entrar”."],
  [/password should be at least/i, "A senha precisa ter pelo menos 8 caracteres."],
  [/unable to validate email|invalid email|email address .* is invalid/i, "Digite um e-mail válido."],
  [/rate limit|too many/i, "Muitas tentativas. Espere alguns minutos e tente de novo."],
  [/failed to fetch|network/i, "Sem conexão com o servidor. Confira a internet."],
];

export function friendlyError(error) {
  const text = error?.message ?? String(error);
  return authMessages.find(([pattern]) => pattern.test(text))?.[1] ?? text;
}

export async function fetchRemoteHabits() {
  const { data, error } = await supabase.from("habits").select("*");
  if (error) throw error;
  return data.map(fromRow);
}

export async function pushHabits(habits, userId) {
  if (habits.length === 0) return;
  const { error } = await supabase.from("habits").upsert(habits.map((habit) => toRow(habit, userId)));
  if (error) throw error;
}
