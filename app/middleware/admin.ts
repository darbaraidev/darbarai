// Redirige vers / si l'utilisateur n'est pas admin
export default defineNuxtRouteMiddleware(async () => {
  const user = useSupabaseUser();

  if (!user.value) {
    return navigateTo("/auth/login");
  }

  const supabase = useSupabaseClient();
  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.value.id)
    .single();

  if (profile?.role !== "admin") {
    throw createError({ statusCode: 403, statusMessage: "Forbidden" });
  }
});
