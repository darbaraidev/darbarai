import type { Riad } from "~/types";

export const useRiad = () => {
  const supabase = useSupabaseClient();

  const riads = useState<Riad[]>("riads:list", () => []);

  const fetchRiads = async () => {
    const { data, error } = await supabase
      .from("riads")
      .select("*")
      .order("name");
    if (!error && data) riads.value = data;
    return { data, error };
  };

  const getRiadBySlug = async (slug: string): Promise<Riad | null> => {
    const { data } = await supabase
      .from("riads")
      .select("*")
      .eq("slug", slug)
      .single();
    return data;
  };

  const formatPrice = (centimes: number): string =>
    new Intl.NumberFormat("fr-FR", {
      style: "currency",
      currency: "EUR",
    }).format(centimes / 100);

  return { riads, fetchRiads, getRiadBySlug, formatPrice };
};
