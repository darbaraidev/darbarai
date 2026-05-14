import { serverSupabaseClient, serverSupabaseServiceRole } from "#supabase/server";

export default defineEventHandler(async (event) => {
  // Vérifier que l'appelant est admin
  const supabase = await serverSupabaseClient(event);
  const { data: { session } } = await supabase.auth.getSession();
  if (!session?.user) throw createError({ statusCode: 401, statusMessage: "Unauthorized" });

  const { data: profile } = await (supabase as any)
    .from("profiles")
    .select("role")
    .eq("id", session.user.id)
    .single();

  if (profile?.role !== "admin") {
    throw createError({ statusCode: 403, statusMessage: "Forbidden" });
  }

  const userId = getRouterParam(event, "id");
  if (!userId) throw createError({ statusCode: 400, statusMessage: "Missing user id" });

  // Empêcher l'admin de se supprimer lui-même
  if (userId === session.user.id) {
    throw createError({ statusCode: 400, statusMessage: "Cannot delete your own account" });
  }

  const adminClient = serverSupabaseServiceRole(event);
  const { error } = await adminClient.auth.admin.deleteUser(userId);

  if (error) throw createError({ statusCode: 500, statusMessage: error.message });

  return { success: true };
});
