export interface ServiceCategoryRecord {
  id: string;
  slug: string;
  name: string;
  name_en: string | null;
  description: string | null;
  description_en: string | null;
  sort_order: number;
  created_at: string;
}

export const useServiceCategories = () => {
  const supabase = useSupabaseClient();

  const fetchCategories = async () => {
    const { data, error } = await (supabase as any)
      .from("service_categories")
      .select("*")
      .order("sort_order")
      .order("name");
    return { data: (data ?? []) as ServiceCategoryRecord[], error };
  };

  const createCategory = async (
    payload: Omit<ServiceCategoryRecord, "id" | "created_at">,
  ) => {
    const { data, error } = await (supabase as any)
      .from("service_categories")
      .insert([payload])
      .select()
      .single();
    return { data: data as ServiceCategoryRecord | null, error };
  };

  const updateCategory = async (
    id: string,
    payload: Partial<ServiceCategoryRecord>,
  ) => {
    const { data, error } = await (supabase as any)
      .from("service_categories")
      .update(payload)
      .eq("id", id)
      .select()
      .single();
    return { data: data as ServiceCategoryRecord | null, error };
  };

  const deleteCategory = async (id: string) => {
    const { error } = await (supabase as any)
      .from("service_categories")
      .delete()
      .eq("id", id);
    return { error };
  };

  return { fetchCategories, createCategory, updateCategory, deleteCategory };
};
