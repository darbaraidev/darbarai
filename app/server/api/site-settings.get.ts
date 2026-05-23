import { serverSupabaseServiceRole } from "#supabase/server";

export default defineEventHandler(async (event) => {
  const supabase = serverSupabaseServiceRole(event);
  const { data } = await (supabase as any)
    .from("site_settings")
    .select("page_boutique_enabled, page_gallery_enabled, page_services_enabled, page_contact_enabled, maintenance_mode")
    .eq("id", 1)
    .maybeSingle();

  return {
    page_boutique_enabled: data?.page_boutique_enabled ?? true,
    page_gallery_enabled: data?.page_gallery_enabled ?? true,
    page_services_enabled: data?.page_services_enabled ?? true,
    page_contact_enabled: data?.page_contact_enabled ?? true,
    maintenance_mode: data?.maintenance_mode ?? false,
  };
});
