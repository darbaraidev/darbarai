export interface FaqCategory {
  id: string;
  name_fr: string;
  name_en: string;
  sort_order: number;
  items?: FaqItem[];
}

export interface FaqItem {
  id: string;
  category_id: string;
  question_fr: string;
  question_en: string;
  answer_fr: string;
  answer_en: string;
  sort_order: number;
  active: boolean;
}

export const useFaq = () => {
  const supabase = useSupabaseClient() as any;
  const faqData = ref<FaqCategory[]>([]);

  async function fetchFaq(onlyActive = true) {
    const [{ data: categories }, { data: items }] = await Promise.all([
      supabase.from("faq_categories").select("*").order("sort_order"),
      onlyActive
        ? supabase.from("faq_items").select("*").eq("active", true).order("sort_order")
        : supabase.from("faq_items").select("*").order("sort_order"),
    ]);

    faqData.value = ((categories as FaqCategory[]) ?? []).map((cat) => ({
      ...cat,
      items: ((items as FaqItem[]) ?? []).filter(
        (item) => item.category_id === cat.id
      ),
    }));

    return faqData.value;
  }

  async function createCategory(form: Omit<FaqCategory, "id">) {
    const { error } = await supabase.from("faq_categories").insert(form);
    return { error };
  }

  async function updateCategory(id: string, form: Partial<FaqCategory>) {
    const { error } = await supabase
      .from("faq_categories")
      .update(form)
      .eq("id", id);
    return { error };
  }

  async function deleteCategory(id: string) {
    const { error } = await supabase
      .from("faq_categories")
      .delete()
      .eq("id", id);
    return { error };
  }

  async function createItem(form: Omit<FaqItem, "id">) {
    const { error } = await supabase.from("faq_items").insert(form);
    return { error };
  }

  async function updateItem(id: string, form: Partial<FaqItem>) {
    const { error } = await supabase
      .from("faq_items")
      .update(form)
      .eq("id", id);
    return { error };
  }

  async function deleteItem(id: string) {
    const { error } = await supabase.from("faq_items").delete().eq("id", id);
    return { error };
  }

  return {
    faqData,
    fetchFaq,
    createCategory,
    updateCategory,
    deleteCategory,
    createItem,
    updateItem,
    deleteItem,
  };
};
