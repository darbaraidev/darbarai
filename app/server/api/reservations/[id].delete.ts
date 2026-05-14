import { serverSupabaseClient } from "#supabase/server";

export default defineEventHandler(async (event) => {
  const supabase = await serverSupabaseClient(event);
  const id = getRouterParam(event, "id");

  // Auth : header Bearer ou token dans le body (sendBeacon ne supporte pas les headers)
  let user = null;
  const authHeader = getHeader(event, "authorization");
  if (authHeader) {
    const { data } = await supabase.auth.getUser(authHeader.replace(/^Bearer\s+/i, ""));
    user = data.user;
  } else {
    const body = await readBody(event).catch(() => ({}));
    if (body?.token) {
      const { data } = await supabase.auth.getUser(body.token);
      user = data.user;
    }
  }

  if (!user?.id) throw createError({ statusCode: 401 });

  // Supprime uniquement les réservations pending appartenant à l'user
  await (supabase as any)
    .from("reservations")
    .delete()
    .eq("id", id)
    .eq("user_id", user.id)
    .eq("status", "pending");

  return { ok: true };
});
