import { serverSupabaseClient, serverSupabaseServiceRole } from "#supabase/server";

export default defineEventHandler(async (event) => {
  const supabase = await serverSupabaseClient(event);
  const authHeader = getHeader(event, "authorization");
  const token = authHeader?.replace(/^Bearer\s+/i, "");
  if (!token) throw createError({ statusCode: 401 });

  const { data: { user } } = await supabase.auth.getUser(token);
  if (!user?.id) throw createError({ statusCode: 401 });

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();
  if ((profile as any)?.role !== "admin") throw createError({ statusCode: 403 });

  const id = getRouterParam(event, "id");
  if (!id) throw createError({ statusCode: 400, statusMessage: "Missing id" });

  const admin = serverSupabaseServiceRole(event);
  const { error } = await admin.from("reservations").delete().eq("id", id);
  if (error) throw createError({ statusCode: 500, statusMessage: error.message });

  return { ok: true };
});
