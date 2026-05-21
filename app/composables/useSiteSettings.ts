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

  return { fetchBookingEnabled, setBookingEnabled, fetchNewsletterPromoEnabled, setNewsletterPromoEnabled };
};
