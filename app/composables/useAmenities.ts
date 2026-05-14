export interface AmenityDef {
  id: string;
  slug: string;
  name_fr: string;
  name_en: string;
  emoji: string;
  sort_order: number;
}

export const useAmenities = () => {
  const supabase = useSupabaseClient();

  const { data: amenities, refresh: refreshAmenities } = useAsyncData(
    "amenities",
    async () => {
      const { data } = await supabase
        .from("amenities")
        .select("id, slug, name_fr, name_en, emoji, sort_order")
        .order("sort_order");
      return (data as any[] ?? []) as AmenityDef[];
    },
  );

  const getAmenity = (slug: string): AmenityDef | undefined =>
    (amenities.value ?? []).find((a) => a.slug === slug);

  return { amenities, getAmenity, refreshAmenities };
};
