export default defineNuxtRouteMiddleware(async (to) => {
  if (import.meta.server) return;

  // Routes exemptées : maintenance elle-même, admin, auth (avec ou sans préfixe /en/)
  if (/^\/(en\/)?(maintenance|admin|auth)(\/|$)/.test(to.path) || to.path === "/maintenance" || to.path === "/en/maintenance") {
    return;
  }

  const settings = await $fetch("/api/site-settings").catch(() => null) as any;
  if (!settings?.maintenance_mode) return;

  // Maintenance activée — laisser passer les admins
  const supabase = useSupabaseClient();
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) return navigateTo("/maintenance");

  const { data: profile } = await (supabase as any)
    .from("profiles")
    .select("role")
    .eq("id", session.user.id)
    .single();

  if (profile?.role !== "admin") return navigateTo("/maintenance");
});
