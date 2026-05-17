import type { Place } from "~/types";

export const usePlaces = () => {
  const supabase = useSupabaseClient();

  const fetchPlaces = async (activeOnly = true) => {
    let query = (supabase as any).from("places").select("*").order("name");
    if (activeOnly) query = query.eq("active", true);
    const { data, error } = await query;
    return { data: (data ?? []) as Place[], error };
  };

  const createPlace = async (payload: Omit<Place, "id" | "created_at">) => {
    const { data, error } = await (supabase as any)
      .from("places")
      .insert([payload])
      .select()
      .single();
    return { data: data as Place | null, error };
  };

  const updatePlace = async (id: string, payload: Partial<Place>) => {
    const { data, error } = await (supabase as any)
      .from("places")
      .update(payload)
      .eq("id", id)
      .select()
      .single();
    return { data: data as Place | null, error };
  };

  const deletePlace = async (id: string) => {
    const { error } = await (supabase as any).from("places").delete().eq("id", id);
    return { error };
  };

  return { fetchPlaces, createPlace, updatePlace, deletePlace };
};
