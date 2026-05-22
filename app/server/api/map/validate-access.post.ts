import { serverSupabaseServiceRole } from "#supabase/server";

export default defineEventHandler(async (event) => {
  const { password } = await readBody(event) as { password: string };

  if (!password?.trim()) {
    return { valid: false };
  }

  const admin = serverSupabaseServiceRole(event);
  const { data } = await (admin as any)
    .from("site_settings")
    .select("map_password")
    .eq("id", 1)
    .single();

  if (!data?.map_password) {
    return { valid: false };
  }

  return { valid: data.map_password === password.trim() };
});
