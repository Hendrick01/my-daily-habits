// Exclui a conta de quem está chamando. Hábitos e lembretes saem junto (on delete cascade).
// O gateway do Supabase já exige um token válido (verify_jwt); aqui só descobrimos de quem é.
import { createClient } from "npm:@supabase/supabase-js@2";

const admin = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);

const cors = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (request) => {
  if (request.method === "OPTIONS") return new Response("ok", { headers: cors });

  const token = request.headers.get("Authorization")?.replace("Bearer ", "") ?? "";
  const { data, error } = await admin.auth.getUser(token);
  if (error || !data.user) return Response.json({ error: "não autenticado" }, { status: 401, headers: cors });

  const { error: deleteError } = await admin.auth.admin.deleteUser(data.user.id);
  if (deleteError) return Response.json({ error: deleteError.message }, { status: 500, headers: cors });

  return Response.json({ deleted: true }, { headers: cors });
});
