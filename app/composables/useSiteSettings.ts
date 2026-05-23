export const useSiteSettings = () => {
  const supabase = useSupabaseClient() as any;

  const fetchBookingEnabled = async (): Promise<boolean> => {
    const { data } = await supabase
      .from("site_settings")
      .select("booking_enabled")
      .eq("id", 1)
      .single();
    return data?.booking_enabled ?? true;
  };

  const setBookingEnabled = async (enabled: boolean) => {
    const { error } = await supabase
      .from("site_settings")
      .upsert({ id: 1, booking_enabled: enabled });
    return { error };
  };

  const fetchNewsletterPromoEnabled = async (): Promise<boolean> => {
    const { data } = await supabase
      .from("site_settings")
      .select("newsletter_promo_enabled")
      .eq("id", 1)
      .single();
    return data?.newsletter_promo_enabled !== false;
  };

  const setNewsletterPromoEnabled = async (enabled: boolean) => {
    const { error } = await supabase
      .from("site_settings")
      .upsert({ id: 1, newsletter_promo_enabled: enabled });
    return { error };
  };

  const fetchPageSettings = async (): Promise<Record<string, boolean>> => {
    const { data } = await supabase
      .from("site_settings")
      .select("page_boutique_enabled, page_gallery_enabled, page_services_enabled, page_contact_enabled")
      .eq("id", 1)
      .single();
    return {
      boutique: data?.page_boutique_enabled ?? true,
      gallery: data?.page_gallery_enabled ?? true,
      services: data?.page_services_enabled ?? true,
      contact: data?.page_contact_enabled ?? true,
    };
  };

  const setPageEnabled = async (page: string, enabled: boolean) => {
    const { error } = await (supabase as any)
      .from("site_settings")
      .upsert({ id: 1, [`page_${page}_enabled`]: enabled });
    return { error };
  };

  const fetchMaintenanceMode = async (): Promise<boolean> => {
    const { data } = await supabase
      .from("site_settings")
      .select("maintenance_mode")
      .eq("id", 1)
      .single();
    return data?.maintenance_mode ?? false;
  };

  const setMaintenanceMode = async (enabled: boolean) => {
    const { error } = await supabase
      .from("site_settings")
      .upsert({ id: 1, maintenance_mode: enabled });
    return { error };
  };

  return { fetchBookingEnabled, setBookingEnabled, fetchNewsletterPromoEnabled, setNewsletterPromoEnabled, fetchPageSettings, setPageEnabled, fetchMaintenanceMode, setMaintenanceMode };
};
